import React from "react";

export default function Announcements(){
  const list = [
    {id:1, title:"PTM on Friday", body:"Parent–teacher meeting at 10:00 AM in hall."},
    {id:2, title:"Holiday", body:"School closed next Monday for local holiday."}
  ];
  return (
    <div style={{padding:20}}>
      <h2>Announcements</h2>
      {list.map(a=>(
        <div key={a.id} style={{border:'1px solid #eee', padding:10, marginBottom:8}}>
          <h4>{a.title}</h4>
          <p>{a.body}</p>
        </div>
      ))}
    </div>
  );
}
