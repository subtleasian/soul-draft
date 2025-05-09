// src/components/Layout.jsx
import React from "react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 font-sans">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">🦒 Emotigraf</h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Explore what shapes you. Reflect deeply. Watch your identity map grow.
          </p>
        </header>

        {children}
      </div>
    </div>
  );
}
