import { ClipLoader } from "react-spinners";

const Spinner = ({ loading }) => {
  return (
    <div>
      <ClipLoader loading={loading} size="50" speedMultiplier="1.1" color="var(--color-indigo-600)" />
      <p>loading...</p>
    </div>
  );
};

export default Spinner;
