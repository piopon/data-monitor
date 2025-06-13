"use client";

import { useState } from "react";

const DataMonitor = ({ parent }) => {
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState("");
  const [condition, setCondition] = useState("<");
  const [notifier, setNotifier] = useState("email");

  const saveMonitor = async (event) => {
    event.preventDefault();
    console.warn(`enabled: ${enabled}`);
    console.log(`parent: ${parent}`);
    console.log(`condition: ${condition}`);
    console.log(`threshold: ${threshold}`);
    console.log(`notifier: ${notifier}`);

    const response = await fetch("/api/monitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parent, enabled, threshold, condition, notifier }),
    });
    if (!response.ok) {
      toast.error("Error while saving monitor");
      return;
    }
    toast.success("Monitor saved!");
  };

  return (
    <div className="data-card-monitor">
      <form onSubmit={saveMonitor}>
        <input
          type="checkbox"
          name={`${parent}-enabled`}
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
