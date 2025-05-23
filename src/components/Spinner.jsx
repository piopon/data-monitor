import { ClipLoader } from "react-spinners";

const Spinner = ({ loading }) => {
  return (
    <div>
      <ClipLoader loading={loading} size="50px" speedMultiplier="1.1" color="var(--color-indigo-600)" />
      <p className="spinner-loading">loading...</p>
    </div>
  );
};

export default Spinner;
