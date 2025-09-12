"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface NavbarProps {
  session: any; // pass session from server
}

export default function Navbar({ session }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      <h1 className="text-lg font-bold text-slate-900">BLI</h1>

      <div>
        {session ? (
          <Button onClick={() => signOut({ callbackUrl: "/" })}>Logout</Button>
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
