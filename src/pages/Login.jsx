import React from "react";

export default function Login(){
  return (
    <div style={{padding:20}}>
      <h2>Login (placeholder)</h2>
      <p>This will use Azure AD B2C later. For now, put a parent/teacher account here.</p>
      <form>
        <input placeholder="Email" /><br/><br/>
        <input placeholder="Password" type="password" /><br/><br/>
        <button type="button">Sign in</button>
      </form>
    </div>
  );
}
