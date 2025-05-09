
// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Layout from "./components/Layout";
import Auth from "./components/Auth";
import UserInfo from "./components/UserInfo";
import Journal from "./components/Journal";
// import AdminTools from "./components/AdminTools"; // future

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe(); // Cleanup to prevent memory leaks
  }, []);

  return (
    <Router>
      <div className="text-red-500 font-bold text-2xl">Tailwind is working</div>
      <Layout>
        <Auth user={user} />
        <UserInfo user={user} />
        <Routes>
          <Route path="/" element={user ? <Journal user={user} /> : null} />
          {/* <Route path="/admin" element={<AdminTools user={user} />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
}


