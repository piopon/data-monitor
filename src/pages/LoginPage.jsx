import { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const tileStyle = "mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900";
  const inputContainerStyle =
    "w-75 rounded-md m-3 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:outline-indigo-600";
  const inputFieldStyle = " block py-1.5 pl-1 text-gray-900 focus:outline-none sm:text-sm/6";
  const submitContainerStyle = "mt-5 mb-5 flex items-center justify-center gap-x-6";
  const submitButtonStyle =
    "rounded-md w-75 bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

  return (
    <>
      <h2 className={tileStyle}>Log in to your account</h2>
      <form className="flex items-center justify-center">
        <div>
          <div className={inputContainerStyle}>
            <input
              required
              type="email"
              placeholder="email"
              className={inputFieldStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={inputContainerStyle}>
            <input
              required
              type="password"
              placeholder="password"
              className={inputFieldStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={submitContainerStyle}>
            <button type="submit" className={submitButtonStyle}>
              login
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default LoginPage;
