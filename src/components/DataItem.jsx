import Image from "next/image";
import DataMonitor from "./DataMonitor";

import unknown from "@/assets/images/unknown.png";

const DataItem = ({ item }) => {
  const valid = "OK" === item.status;
  const state = valid ? `✔️` : `❌`;
  const image = valid ? { src: item.icon, alt: `${item.name} logo` } : { src: unknown, alt: `Unknown logo` };
  const value = valid
    ? { data: `${item.price} ${item.currency}`, threshold: `THRESHOLD SETTINGS...` }
    : { data: item.reason, threshold: `FIX ITEM CONFIG...` };

  return (
    <div className="data-card-item">
      <Image src={image.src} alt={image.alt} height={50} width={50} />
      <div>
        <p>
          {state}
          <span>{item.name}</span>: {value.data}
        </p>
        <div>
          <DataMonitor />
        </div>
      </div>
    </div>
  );
};

export default DataItem;
