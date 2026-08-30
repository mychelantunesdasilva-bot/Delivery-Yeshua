"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (usuario) => {
      if (usuario) {
        window.location.href = "/admin/painel";
        return;
      }

      setVerificandoSessao(false);
    });

    return () => cancelar();
  }, []);

  async function fazerLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !senha) return;

    setErro("");
    setCarregando(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
      window.location.href = "/admin/painel";
    } catch (error: unknown) {
      console.error("Erro no login administrativo:", error);

      setErro("E-mail ou senha incorretos.");
    } finally {
      setCarregando(false);
    }
  }

  if (verificandoSessao) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-amber-500" />

          <p className="mt-4 text-sm text-zinc-400">
            Verificando acesso...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-5">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-2xl shadow-lg">
            🔐
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-amber-500">
            Delivery Yeshua
          </p>

          <h1 className="mt-2 text-3xl font-black text-white">
            Área administrativa
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Entre com sua conta para gerenciar o Delivery Yeshua.
          </p>
        </div>

        <form onSubmit={fazerLogin} className="space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-bold text-zinc-300"
            >
              E-mail
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErro("");
              }}
              placeholder="Seu e-mail"
              autoComplete="email"
              required
              disabled={carregando}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 disabled:opacity-60"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="admin-senha"
                className="text-sm font-bold text-zinc-300"
              >
                Senha
              </label>
            </div>

            <div className="relative">
              <input
                id="admin-senha"
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(event) => {
                  setSenha(event.target.value);
                  setErro("");
                }}
                placeholder="Sua senha"
                autoComplete="current-password"
                required
                disabled={carregando}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 pr-20 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha((valor) => !valor)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400 transition hover:text-white"
              >
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {erro && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="flex w-full items-center justify-center rounded-xl bg-amber-500 py-3.5 font-black text-black shadow-lg transition hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-800 pt-5 text-center">
          <a
            href="/"
            className="text-sm font-medium text-zinc-400 transition hover:text-amber-400"
          >
            ← Voltar para o cardápio
          </a>
        </div>
      </div>
    </main>
  );
}