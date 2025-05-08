// App.jsx
import React, { useEffect, useState } from "react";
import { auth, provider } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Auth from "./components/Auth";
import UserInfo from "./components/UserInfo";
import Journal from "./components/Journal";
// import FixTimestamps from "./tools/FixTimestamps"; // adjust path if needed


export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto font-sans">
      <Auth user={user} />
      <UserInfo user={user} />
      {user && <Journal user={user} />}
    </div>
  );

  // return (
  //   <div className="p-4 max-w-2xl mx-auto font-sans">
  //     <Auth user={user} />
  //     <UserInfo user={user} />
  
  //     {/* 🔐 Run FixTimestamps tool ONLY for you */}
  //     {user?.email === "daniel.m.son21@gmail.com" ? (
  //       <FixTimestamps user={user} />
  //     ) : (
  //       user && <Journal user={user} />
  //     )}
  //   </div>
  // );
}