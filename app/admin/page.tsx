"use client";

import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function fazerLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      window.location.href = "/admin/painel";
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro desconhecido ao fazer login.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-amber-500">
            Delivery Yeshua
          </p>

          <h1 className="mt-2 text-3xl font-black text-white">
            Painel Administrativo
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Entre com sua conta de administrador.
          </p>
        </div>

        <form onSubmit={fazerLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Seu e-mail"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Sua senha"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-500"
            />
          </div>

          {erro && (
            <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-xl bg-amber-500 py-3 font-bold text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}