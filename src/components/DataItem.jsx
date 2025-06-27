import Image from "next/image";
import DataMonitor from "./DataMonitor";

import unknown from "@/assets/images/unknown.png";

const DataItem = ({ item }) => {
  const valid = "OK" === item.status;
  const state = valid ? `✔️` : `❌`;
  const image = valid ? { src: item.icon, alt: `${item.name} logo` } : { src: unknown, alt: `Unknown logo` };
  const value = valid ? `${item.price} ${item.currency}` : item.reason;

  return (
    <div className="data-card-item">
      <Image src={image.src} alt={image.alt} height={50} width={50} />
      <div className="data-card-content">
        <p className="data-card-value">
          {state}
          <span className="data-card-name">{item.name}</span>: {value}
        </p>
        <DataMonitor parentName={item.name} />
      </div>
    </div>
  );
};

export default DataItem;
