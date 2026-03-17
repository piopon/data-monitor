"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LoginContext } from "@/context/Contexts";
import { DataUtils } from "@/lib/DataUtils";
import { Monitor } from "@/model/Monitor";
import Toggle from "@/widgets/Toggle";
import Select from "@/widgets/Select";

const OPTION_VALUE_DELIMITER = "@";
const CONFIG_NOTIFIER_OPTION = { value: `config${OPTION_VALUE_DELIMITER}-1`, text: "configure..." };
const MONITOR_DEFAULTS = {
  id: 0,
  enabled: false,
  threshold: "",
  condition: "<",
  notifier: CONFIG_NOTIFIER_OPTION.value,
  interval: 300_000,
};

const parseNotifierValue = (input) => {
  const [typeRaw = "", idRaw = ""] = String(input).split(OPTION_VALUE_DELIMITER);
  const type = typeRaw.trim();
  const id = Number.parseInt(idRaw.trim(), 10);
  return { type, id: Number.isNaN(id) ? null : id };
};

const DataMonitor = ({ parentName }) => {
  const parentId = DataUtils.nameToId(parentName);
  const { isDemo, userId, email } = useContext(LoginContext);
  const router = useRouter();

  const [id, setId] = useState(MONITOR_DEFAULTS.id);
  const [enabled, setEnabled] = useState(MONITOR_DEFAULTS.enabled);
  const [interval, setInterval] = useState(MONITOR_DEFAULTS.interval);
  const [threshold, setThreshold] = useState(MONITOR_DEFAULTS.threshold);
  const [condition, setCondition] = useState(MONITOR_DEFAULTS.condition);
  const [notifierId, setNotifierId] = useState(-1);
  const [notifierOpts, setNotifierOpts] = useState([CONFIG_NOTIFIER_OPTION]);
  const [notifierType, setNotifierType] = useState(MONITOR_DEFAULTS.notifier);

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
          value: `${notifier.type}${OPTION_VALUE_DELIMITER}${notifier.id}`,
          text: notifier.type,
        }));
        notifierOptions.push(CONFIG_NOTIFIER_OPTION);
        setNotifierOpts(notifierOptions);
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
        const currNotifierId = monitorData[0].notifier_id;
        if (currNotifierId == null) {
          return;
        }
        setNotifierId(currNotifierId);
        const notifierResponse = await fetch(`/api/notifier?id=${currNotifierId}`);
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
        setId(monitorData[0].id ?? MONITOR_DEFAULTS.id);
        setEnabled(monitorData[0].enabled ?? MONITOR_DEFAULTS.enabled);
        setCondition(monitorData[0].condition ?? MONITOR_DEFAULTS.condition);
        setThreshold(monitorData[0].threshold ?? MONITOR_DEFAULTS.threshold);
        setInterval(monitorData[0].interval ?? MONITOR_DEFAULTS.interval);
        if (notifierData[0].type) {
          setNotifierType(`${notifierData[0].type}${OPTION_VALUE_DELIMITER}${currNotifierId}`);
        }
      } catch (error) {
        toast.error(`Failed to get monitor: ${error.message}`);
      }
    };
    initialize();
  }, []);

  const saveMonitor = async () => {
    if (isDemo) {
      toast.warn(`Notifications are disabled for demo session.`);
      return;
    }
    const user = userId();
    if (user === -1) {
      toast.error(`Missing user ID, please re-login and try again.`);
      return;
    }
    const monitor = { parent: parentId, enabled, threshold, condition, notifier: notifierId, interval, user };
    try {
      const exists = MONITOR_DEFAULTS.id !== id;
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

  const testMonitor = async () => {
    try {
      const { type } = parseNotifierValue(notifierType);
      if ("" === type || "config" === type) {
        toast.warning("Please select a configured notifier before running test notification.");
        return;
      }
      if ("email" === type && email == null) {
        toast.error(`Missing user email to send notification. Please re-login and try again.`);
        return;
      }
      const message = "This is only a TEST message with FAKE values sent from data-monitor!";
      const notifyResponse = await fetch(`/api/notifier?type=${encodeURIComponent(type)}`, {
        method: "POST",
        body: JSON.stringify({
          name: parentName,
          receiver: email,
          details: { message, data: "123.456", threshold },
        }),
      });
      if (!notifyResponse.ok) {
        toast.error(`Test notification ERROR: ${await notifyResponse.json()}`);
        return;
      }
      toast.success(`Test notification OK: ${await notifyResponse.json()}`);
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const conditionSelected = (selection) => setCondition(selection.value);

  const notifierSelected = (selection) => {
    const input = selection.value;
    if (CONFIG_NOTIFIER_OPTION.value === input) {
      router.replace("/notifiers");
    }
    setNotifierType(input);
    const { id: parsedNotifierId } = parseNotifierValue(input);
    if (parsedNotifierId == null) {
      toast.warning(`Notifier does not have an ID: ${input}`);
      return;
    }
    setNotifierId(parsedNotifierId);
  };

  const submitMonitor = async (event) => {
    event.preventDefault();
    await saveMonitor();
  };

  return (
    <div className="data-card-monitor">
      <form onSubmit={submitMonitor}>
        <Toggle id={parentId} label="enabled" enabled={enabled} setter={setEnabled} />
        <Select options={Monitor.CONDITIONS} value={condition} disabled={!enabled} setter={conditionSelected} />
        <input
          type="text"
          className="data-threshold"
          placeholder="threshold"
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
          disabled={!enabled}
        />
        <Select
          size="big"
          options={notifierOpts}
          placeholder="notifier"
          value={notifierType}
          disabled={!enabled}
          setter={notifierSelected}
        />
        <input
          type="text"
          className="data-interval"
          placeholder="interval (ms)"
          value={interval}
          onChange={(event) => setInterval(event.target.value)}
          disabled={!enabled}
        />
        <button className="test-monitor" type="button" disabled={!enabled} onClick={testMonitor}>
          test
        </button>
        <button className="save-monitor" type="submit">
          save
        </button>
      </form>
    </div>
  );
};

export default DataMonitor;
