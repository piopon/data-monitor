const DataMonitor = ({parent}) => {
  return (
    <div className="data-card-monitor">
      <input type="checkbox" name={`${parent}-enabled`} />
      <select name="condition">
        <option value="<">&lt;</option>
        <option value="<=">&le;</option>
        <option value=">">&gt;</option>
        <option value=">=">&ge;</option>
      </select>
      <input type="text" placeholder="threshold"/>
      <select name="notifier">
        <option value="email">email</option>
        <option value="discord">discord</option>
      </select>
    </div>
  )
}

export default DataMonitor