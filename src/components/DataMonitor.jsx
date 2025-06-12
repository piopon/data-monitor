"use client";

import { useState } from "react";

const DataMonitor = ({ parent }) => {
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState("");
  const [condition, setCondition] = useState("<");
  const [notifier, setNotifier] = useState("email");

  const saveMonitor = (event) => {
    event.preventDefault();
    console.warn(`enabled: ${enabled}`);
    console.log(`parent: ${parent}`);
    console.log(`condition: ${condition}`);
    console.log(`threshold: ${threshold}`);
    console.log(`notifier: ${notifier}`);
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
        <select name="condition" value={condition}>
          <option value="<">&lt;</option>
          <option value="<=">&le;</option>
          <option value=">">&gt;</option>
          <option value=">=">&ge;</option>
        </select>
        <input type="text" placeholder="threshold" value={threshold} />
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
