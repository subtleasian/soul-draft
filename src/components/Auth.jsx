// components/Auth.jsx
import React from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";

export default function Auth({ user }) {
  return (
    <div>
      {!user ? (
        <button onClick={() => signInWithPopup(auth, provider)}>Sign In with Google</button>
      ) : (
        <button onClick={() => signOut(auth)}>Sign Out</button>
      )}
    </div>
  );
}