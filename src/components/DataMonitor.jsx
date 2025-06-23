"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Toggle from "./Toggle";

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
        <Toggle id={parentId} enabled={enabled} setter={setEnabled} />
        <select
          class="py-3 px-4 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
          name="condition"
          value={condition}
          onChange={(event) => setCondition(event.target.value)}
        >
          <option value="<">&lt;</option>
          <option value="<=">&le;</option>
          <option value=">">&gt;</option>
          <option value=">=">&ge;</option>
        </select>
        <input
          type="text"
          class="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
          placeholder="threshold"
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
        />
        <select
          class="py-3 px-4 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
          name="notifier"
          value={notifier}
          onChange={(event) => setNotifier(event.target.value)}
        >
          <option value="email">email</option>
          <option value="discord">discord</option>
        </select>
        <button
          class="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-red-500 text-white hover:bg-red-600 focus:outline-hidden focus:bg-red-600 disabled:opacity-50 disabled:pointer-events-none"
          type="submit"
        >
          save
        </button>
      </form>
    </div>
  );
};

export default DataMonitor;
