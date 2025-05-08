// components/Journal.jsx
import React from "react";
import Prompt from "./Prompt";
import EntryForm from "./EntryForm";
import EntryList from "./EntryList";

export default function Journal({ user }) {
  return (
    <div className="mt-4">
      <Prompt />
      <EntryForm user={user} />
      <EntryList user={user} />
    </div>
  );
}