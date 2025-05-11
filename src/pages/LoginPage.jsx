import React from "react";

const LoginPage = () => {
  const inputContainerStyle =
    "rounded-md m-2 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:outline-indigo-600";
  const inputFieldStyle = "block py-1.5 pl-1 text-gray-900 focus:outline-none sm:text-sm/6";
  const submitContainerStyle = "m-2 flex items-center justify-end gap-x-6";
  const submitButtonStyle =
    "rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

  return (
    <form>
      <div>
        <div>
          <h1>Login</h1>
          <div className={inputContainerStyle}>
            <input type="email" placeholder="email" className={inputFieldStyle} required />
          </div>
          <div className={inputContainerStyle}>
            <input type="password" placeholder="password" className={inputFieldStyle} required />
          </div>
          <div className={submitContainerStyle}>
            <button type="submit" className={submitButtonStyle}>
              login
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default LoginPage;
