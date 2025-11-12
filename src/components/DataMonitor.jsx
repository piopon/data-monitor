"use client";

import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoginContext } from "@/context/Contexts";
import { Monitor } from "@/model/Monitor";
import { Notifier } from "@/notifiers/core/Notifier";
import { DataUtils } from "@/lib/DataUtils";
import Toggle from "./Toggle";
import Select from "./Select";

const DataMonitor = ({ parentName }) => {
  const defaults = { id: 0, enabled: false, threshold: "", condition: "<", notifier: "email", interval: 300_000 };
  const parentId = DataUtils.nameToId(parentName);
  const { userId } = useContext(LoginContext);

  const [id, setId] = useState(defaults.id);
  const [enabled, setEnabled] = useState(defaults.enabled);
  const [threshold, setThreshold] = useState(defaults.threshold);
  const [condition, setCondition] = useState(defaults.condition);
  const [notifier, setNotifier] = useState(defaults.notifier);
  const [interval, setInterval] = useState(defaults.interval);

  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await fetch(`/api/monitor?parent=${parentId}`);
        const data = await response.json();
        if (!response.ok) {
          toast.error(data.message);
          return;
        }
        if (0 === data.length) {
          // no monitor data for the specified parent (leave default values)
          return;
        }
        if (1 !== data.length) {
          toast.error("Error: Received multiple monitor entries...");
          return;
        }
        setId(data[0].id ?? defaults.id);
        setEnabled(data[0].enabled ?? defaults.enabled);
        setCondition(data[0].condition ?? defaults.condition);
        setThreshold(data[0].threshold ?? defaults.threshold);
        setNotifier(data[0].notifier ?? defaults.notifier);
        setInterval(data[0].interval ?? defaults.interval);
      } catch (error) {
        toast.error(`Failed to get monitor: ${error.message}`);
      }
    };
    initialize();
  }, []);

  const saveMonitor = async (event) => {
    event.preventDefault();
    const monitor = { parent: parentId, enabled, threshold, condition, notifier, interval, user: userId };
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
        <Select options={Notifier.getSupportedList()} value={notifier} disabled={!enabled} setter={setNotifier} />
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
