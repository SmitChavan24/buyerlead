"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("email", { email, callbackUrl: "/buyers" });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded-xl shadow-md w-80"
      >
        <h1 className="text-xl font-bold mb-4 text-center">
          Login via Magic Link
        </h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="border border-slate-300 rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring focus:ring-slate-200"
          required
        />

        <button
          type="submit"
          className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
        >
          Send Magic Link
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="w-full mt-3 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
        >
          Back
        </button>
      </form>
    </div>
  );
}
