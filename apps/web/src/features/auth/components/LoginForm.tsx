"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { httpClient } from "@/lib/http-client";

export const LoginForm = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();
      
      // Fetch user context
      const userRes = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v1/auth/me", {
        headers: {
          "Authorization": `Bearer ${data.access_token}`
        }
      });
      const userData = await userRes.json();
      
      login(data.access_token, userData);
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h1 className="mb-2 text-3xl font-bold text-white">MARG v2</h1>
        <p className="mb-8 text-slate-400">Emergency Operating System</p>
        
        {error && (
          <div className="mb-4 rounded bg-red-900/50 p-3 text-red-200 border border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 p-3 font-semibold text-white transition-colors hover:bg-sky-500 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Command Login"}
          </button>
        </form>
      </div>
    </div>
  );
};
