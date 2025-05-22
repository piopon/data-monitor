import { ClipLoader } from "react-spinners";

const Spinner = ({ loading }) => {
  return <ClipLoader loading={loading} size="50" color="var(--color-indigo-600)" />;
};

export default Spinner;
