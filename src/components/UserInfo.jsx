// components/UserInfo.jsx
import React from "react";

export default function UserInfo({ user }) {
  return <p className="mt-2">{user ? `Signed in as: ${user.displayName}` : "Not signed in"}</p>;
}
