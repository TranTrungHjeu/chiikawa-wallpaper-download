"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminLoginForm({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) return;

    setPending(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      startTransition(() => {
        router.push("/admin/submissions");
        router.refresh();
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Đăng nhập thất bại.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[2rem] bg-white/85 p-6 shadow-cute backdrop-blur"
    >
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
          Admin access
        </p>
        <h2 className="headline-display text-3xl text-[var(--color-ink)]">
          Duyệt contribution trong một nơi gọn gàng.
        </h2>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-700">Email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[var(--color-sky)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-700">Mật khẩu</span>
        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[var(--color-sky)]"
        />
      </label>

      {error ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={pending || disabled}
        icon={pending ? <LockKeyhole className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
      >
        {pending ? "Đang đăng nhập..." : "Đăng nhập admin"}
      </Button>
    </form>
  );
}
