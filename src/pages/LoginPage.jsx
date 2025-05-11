import React from 'react'

const LoginPage = () => {
  return (
    <div>
      <form>
        <h1>Login</h1>
        <input type="email" placeholder='email' required/>
        <input type="password" placeholder='password' required/>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginPage