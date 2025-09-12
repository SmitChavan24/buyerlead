import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/buyers");
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar session={session} />

      <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Buyer Lead Intake</h1>
        <p className="mb-6 text-slate-600 max-w-md">
          Manage and track your buyer leads effectively. Log in to access the
          buyer list, create new leads, and monitor all interactions.
        </p>
      </div>
    </main>
  );
}
