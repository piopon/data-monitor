import { useState } from "react";

const DataMonitor = ({ parent }) => {
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState("");
  const [condition, setCondition] = useState("<");
  const [notifier, setNotifier] = useState("discord");

  return (
    <div className="data-card-monitor">
      <form>
        <input type="checkbox" name={`${parent}-enabled`} checked={enabled} />
        <select name="condition" value={condition}>
          <option value="<">&lt;</option>
          <option value="<=">&le;</option>
          <option value=">">&gt;</option>
          <option value=">=">&ge;</option>
        </select>
        <input type="text" placeholder="threshold" value={threshold} />
        <select name="notifier" value={notifier}>
          <option value="email">email</option>
          <option value="discord">discord</option>
        </select>
        <button type="submit">save</button>
      </form>
    </div>
  );
};

export default DataMonitor;
