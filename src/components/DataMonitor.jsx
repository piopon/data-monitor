"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const DataMonitor = ({ parentName }) => {
  const defaults = { enabled: false, threshold: "", condition: "<", notifier: "email" };
  const parentId = parentName.toLowerCase().replace(/\s+/g, "-");

  const [enabled, setEnabled] = useState(defaults.enabled);
  const [threshold, setThreshold] = useState(defaults.threshold);
  const [condition, setCondition] = useState(defaults.condition);
  const [notifier, setNotifier] = useState(defaults.notifier);

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
        setEnabled(data[0].enabled ?? defaults.enabled);
        setCondition(data[0].condition ?? defaults.condition);
        setThreshold(data[0].threshold ?? defaults.threshold);
        setNotifier(data[0].notifier ?? defaults.notifier);
      } catch (error) {
        toast.error(`Failed to get monitor: ${error.message}`);
      }
    };
    initialize();
  }, []);

  const saveMonitor = async (event) => {
    event.preventDefault();
    const monitor = { parent: parentId, enabled, threshold, condition, notifier };
    console.log("monitor: ", monitor);
    try {
      const getResponse = await fetch(`/api/monitor?parent=${parentId}`);
      const getData = await getResponse.json();
      if (!getResponse.ok) {
        toast.error(getData.message);
        return;
      }
      if (0 === getData.length) {
        const postResponse = await fetch("/api/monitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(monitor),
        });
        const postData = await postResponse.json();
        if (!postResponse.ok) {
          toast.error(postData.message);
          return;
        }
        toast.success(`Saved ${parentName} monitor!`);
      } else {
        const putResponse = await fetch(`/api/monitor?id=${getData[0].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(monitor),
        });
        const putData = await putResponse.json();
        if (!putResponse.ok) {
          toast.error(putData.message);
          return;
        }
        toast.success(`Updated ${parentName} monitor!`);
      }
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  return (
    <div className="data-card-monitor">
      <form onSubmit={saveMonitor}>
        <input
          type="checkbox"
          name={`${parentId}-enabled`}
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
        />
        <select name="condition" value={condition} onChange={(event) => setCondition(event.target.value)}>
          <option value="<">&lt;</option>
          <option value="<=">&le;</option>
          <option value=">">&gt;</option>
          <option value=">=">&ge;</option>
        </select>
        <input
          type="text"
          placeholder="threshold"
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
        />
        <select name="notifier" value={notifier} onChange={(event) => setNotifier(event.target.value)}>
          <option value="email">email</option>
          <option value="discord">discord</option>
        </select>
        <button type="submit">save</button>
      </form>
    </div>
  );
};

export default DataMonitor;
