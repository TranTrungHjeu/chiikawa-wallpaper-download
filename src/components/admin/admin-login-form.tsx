"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch, LockKey, SignIn } from "@phosphor-icons/react";

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
      className="space-y-5 border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(37,48,74,0.08)] backdrop-blur"
    >
      <div className="space-y-2">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
          Admin access
        </p>
        <h2 className="text-3xl font-black tracking-[-0.03em] text-[var(--color-ink)]">
          Đăng nhập quản trị
        </h2>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
          Email
        </span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 w-full border border-slate-200 bg-white px-4 outline-none transition focus:border-[var(--color-sakura)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
          Mật khẩu
        </span>
        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 w-full border border-slate-200 bg-white px-4 outline-none transition focus:border-[var(--color-sakura)]"
        />
      </label>

      {error ? (
        <div className="border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={pending || disabled}
        icon={
          pending ? (
            <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
          ) : (
            <SignIn className="h-4 w-4" weight="bold" />
          )
        }
      >
        {pending ? "Đang đăng nhập..." : "Đăng nhập admin"}
      </Button>
      <div className="flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        <LockKey className="h-4 w-4" weight="bold" />
        Chỉ tài khoản admin mới truy cập được.
      </div>
    </form>
  );
}
