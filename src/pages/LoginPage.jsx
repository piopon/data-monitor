import React from 'react'

const LoginPage = () => {
  return (
    <form>
      <div className="space-y-12">
        <div className="border-gray-900/10 pb-5">
          <h1>Login</h1>
          <div className="flex items-center rounded-md bg-white m-2 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
            <input type="email" placeholder='email' className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" required/>
          </div>
          <div className="flex items-center rounded-md bg-white m-2 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
            <input type="password" placeholder='password' className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" required/>
          </div>
          <div className="m-2 flex items-center justify-end gap-x-6">
            <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">login</button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default LoginPage