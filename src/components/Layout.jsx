// src/components/Layout.jsx
import React from "react";

export default function Layout({ children }) {
  return (
    <div className="p-4 max-w-2xl mx-auto font-sans min-h-screen">
      {children}
    </div>
  );
}
