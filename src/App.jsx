import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Announcements from "./pages/Announcements";
import Login from "./pages/Login";

export default function App(){
  return (
    <Router>
      <header style={{padding:12, borderBottom:'1px solid #ddd'}}>
        <Link to="/">Dashboard</Link> | {" "}
        <Link to="/announcements">Announcements</Link> | {" "}
        <Link to="/login">Login</Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/announcements" element={<Announcements/>} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </main>
    </Router>
  );
}
