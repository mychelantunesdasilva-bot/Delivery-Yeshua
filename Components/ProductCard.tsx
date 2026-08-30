"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ProductCardProps = {
  nome: string;
  descricao?: string;
  preco: string;
  imagem: string;
  esgotado?: boolean;
  abrirDetalhes: () => void;
};

export default function ProductCard({
  nome,
  descricao: _descricao,
  preco,
  imagem,
  esgotado = false,
  abrirDetalhes,
}: ProductCardProps) {
  const [imagemAtual, setImagemAtual] = useState(imagem || "/produtos/DELIVERY.png");

  useEffect(() => {
    setImagemAtual(imagem || "/produtos/DELIVERY.png");
  }, [imagem]);

  return (
    <article className={`group relative flex min-h-[154px] w-full overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition ${
      esgotado ? "border-zinc-200 opacity-75" : "border-zinc-200 hover:border-zinc-300 hover:shadow-md"
    }`}>
      <button
        type="button"
        onClick={abrirDetalhes}
        disabled={esgotado}
        className="flex min-w-0 flex-1 text-left disabled:cursor-not-allowed"
        aria-label={esgotado ? `${nome} esgotado` : `Ver detalhes de ${nome}`}
      >
        <div className="flex min-w-0 flex-1 flex-col pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 sm:text-lg">
              {nome}
            </h3>
            {esgotado && (
              <span className="rounded-full bg-zinc-200 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-zinc-700">
                Esgotado
              </span>
            )}
          </div>
          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <p className="text-lg font-extrabold text-zinc-900">R$ {preco}</p>
            <span className={`flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-xl font-black ${
              esgotado
                ? "border-zinc-200 bg-zinc-100 text-zinc-400"
                : "border-red-200 bg-white text-red-600 transition group-hover:bg-red-50"
            }`}>
              {esgotado ? "—" : "+"}
            </span>
          </div>
        </div>

        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-32 sm:w-32">
          <Image
            src={imagemAtual}
            alt={nome}
            fill
            sizes="(max-width: 640px) 112px, 128px"
            className={`object-cover transition duration-300 ${!esgotado ? "group-hover:scale-105" : "grayscale"}`}
            onError={() => {
              if (imagemAtual !== "/produtos/DELIVERY.png") {
                setImagemAtual("/produtos/DELIVERY.png");
              }
            }}
          />
        </div>
      </button>
    </article>
  );
}
