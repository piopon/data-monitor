"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const DataMonitor = ({ parentName }) => {
  const defaults = { id: 0, enabled: false, threshold: "", condition: "<", notifier: "email" };
  const parentId = parentName.toLowerCase().replace(/\s+/g, "-");

  const [id, setId] = useState(defaults.id);
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
        setId(data[0].id ?? defaults.id);
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
