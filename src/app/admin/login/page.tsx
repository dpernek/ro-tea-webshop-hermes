"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") || "";
  const callbackUrl = rawCallback.startsWith("/") && !rawCallback.startsWith("//") ? rawCallback : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Neispravan email ili lozinka.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          <p className="font-medium">Prijava nije uspjela</p>
          <p className="mt-0.5 text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@ro-tea.hr"
          required
          autoComplete="email"
        />
        <Input
          label="Lozinka"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          Prijava
        </Button>
      </form>
    </>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0055a8] shadow-lg shadow-blue-500/20">
            <span className="text-xl font-bold text-white">RT</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            RO-TEA Admin
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Prijavite se za pristup admin panelu
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Suspense
            fallback={
              <div className="py-4 text-center text-sm text-slate-500">
                Učitavanje...
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} RO-TEA d.o.o. Sva prava pridržana.
        </p>
      </div>
    </div>
  );
}
