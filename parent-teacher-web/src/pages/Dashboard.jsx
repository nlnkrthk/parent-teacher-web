import React from "react";

export default function Dashboard(){
  return (
    <div style={{padding:20}}>
      <h2>Dashboard</h2>
      <p>Student snapshot (sample):</p>
      <div style={{border:'1px solid #ddd', padding:12, width:400}}>
        <strong>Student:</strong> Rahul Sharma<br/>
        <strong>Class:</strong> 8A<br/>
        <strong>Attendance:</strong> 95%<br/>
      </div>
    </div>
  );
}
