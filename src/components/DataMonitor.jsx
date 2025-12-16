"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LoginContext } from "@/context/Contexts";
import { DataUtils } from "@/lib/DataUtils";
import { Monitor } from "@/model/Monitor";
import Toggle from "./Toggle";
import Select from "./Select";

const CONFIG_NOTIFIER_OPTION = { value: "config", text: "configure..." };

const DataMonitor = ({ parentName }) => {
  const defaults = { id: 0, enabled: false, threshold: "", condition: "<", notifier: "", interval: 300_000 };
  const parentId = DataUtils.nameToId(parentName);
  const router = useRouter();
  const { isDemo, userId } = useContext(LoginContext);

  const [id, setId] = useState(defaults.id);
  const [notifierId, setNotifierId] = useState(-1);
  const [notifierOpts, setNotifierOpts] = useState([]);
  const [enabled, setEnabled] = useState(defaults.enabled);
  const [threshold, setThreshold] = useState(defaults.threshold);
  const [condition, setCondition] = useState(defaults.condition);
  const [notifier, setNotifier] = useState(defaults.notifier);
  const [interval, setInterval] = useState(defaults.interval);

  useEffect(() => {
    const initialize = async () => {
      try {
        const notifiersResponse = await fetch(`/api/notifier`);
        const notifiersData = await notifiersResponse.json();
        if (!notifiersResponse.ok) {
          toast.error(notifiersData.message);
          return;
        }
        const notifierOptions = notifiersData.map((notifier) => ({
          value: `${notifier.type}@${notifier.id}`,
          text: notifier.type,
        }));
        notifierOptions.push(CONFIG_NOTIFIER_OPTION);
        setNotifierOpts(notifierOptions)
        // get monitor for specified parent
        const monitorResponse = await fetch(`/api/monitor?parent=${parentId}`);
        const monitorData = await monitorResponse.json();
        if (!monitorResponse.ok) {
          toast.error(monitorData.message);
          return;
        }
        if (0 === monitorData.length) {
          return;
        }
        if (1 !== monitorData.length) {
          toast.error("Error: Received multiple monitor entries...");
          return;
        }
        // get notifier name from ID
        if (monitorData[0].notifier == null) {
          return;
        }
        setNotifierId(monitorData[0].notifier);
        const notifierResponse = await fetch(`/api/notifier?id=${notifierId}`);
        const notifierData = await notifierResponse.json();
        if (!notifierResponse.ok) {
          toast.error(notifierData.message);
          return;
        }
        if (0 === notifierData.length) {
          return;
        }
        if (1 !== notifierData.length) {
          toast.error("Error: Received multiple notifier entries...");
          return;
        }
        // initialize UI with monitor and notifier data
        setId(monitorData[0].id ?? defaults.id);
        setEnabled(monitorData[0].enabled ?? defaults.enabled);
        setCondition(monitorData[0].condition ?? defaults.condition);
        setThreshold(monitorData[0].threshold ?? defaults.threshold);
        setNotifier(notifierData[0].type ?? defaults.notifier);
        setInterval(monitorData[0].interval ?? defaults.interval);
      } catch (error) {
        toast.error(`Failed to get monitor: ${error.message}`);
      }
    };
    initialize();
  }, []);

  const saveMonitor = async (event) => {
    event.preventDefault();
    if (isDemo) {
      toast.warn(`Notifications are disabled for demo session.`);
      return;
    }
    const monitor = { parent: parentId, enabled, threshold, condition, notifier: notifierId, interval, user: userId };
    try {
      const exists = defaults.id !== id;
      const idFilter = exists ? `?id=${id}` : ``;
      const monitorResponse = await fetch(`/api/monitor${idFilter}`, {
        method: exists ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(monitor),
      });
      const monitorData = await monitorResponse.json();
      if (!monitorResponse.ok) {
        toast.error(monitorData.message);
        return;
      }
      setId(monitorData.id);
      toast.success(`${exists ? "Updated" : "Saved"} ${parentName} monitor!`);
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const notifierSelected = (value) => {
    if (CONFIG_NOTIFIER_OPTION.value === value) {
      router.replace("/notifiers");
    }
    setNotifier(value);
  };

  return (
    <div className="data-card-monitor">
      <form onSubmit={saveMonitor}>
        <Toggle id={parentId} label="enabled" enabled={enabled} setter={setEnabled} />
        <Select options={Monitor.CONDITIONS} value={condition} disabled={!enabled} setter={setCondition} />
        <input
          type="text"
          className="data-threshold"
          placeholder="threshold"
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
          disabled={!enabled}
        />
        <Select options={notifierOpts} value={notifier} disabled={!enabled} setter={notifierSelected} />
        <input
          type="text"
          className="data-interval"
          placeholder="interval (ms)"
          value={interval}
          onChange={(event) => setInterval(event.target.value)}
          disabled={!enabled}
        />
        <button className="save-monitor" type="submit">
          save
        </button>
      </form>
    </div>
  );
};

export default DataMonitor;
