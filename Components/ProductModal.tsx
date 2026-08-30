"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem: string;
  ativo: boolean;
  destaque?: boolean;
  ordem?: number;
};

type ProductModalProps = {
  produto: Produto;
  fechar: () => void;
  adicionar: (produto: Produto, quantidade: number, observacao: string) => void;
};

function moeda(valor: number) {
  return valor.toFixed(2).replace(".", ",");
}

export default function ProductModal({
  produto,
  fechar,
  adicionar,
}: ProductModalProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    setQuantidade(1);
    setObservacao("");
  }, [produto.id]);

  const total = produto.preco * quantidade;

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes de ${produto.nome}`}
    >
      <div className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white text-zinc-900 shadow-2xl sm:rounded-3xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 sm:rounded-t-3xl">
          <Image
            src={produto.imagem}
            alt={produto.nome}
            fill
            sizes="(max-width: 640px) 100vw, 576px"
            className="object-cover"
            priority
          />
          <button
            type="button"
            onClick={fechar}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-xl font-bold text-zinc-900 shadow-md backdrop-blur"
            aria-label="Fechar detalhes"
          >
            ✕
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                {produto.categoria}
              </p>
              <h2 className="mt-1 text-2xl font-black leading-tight text-zinc-900">
                {produto.nome}
              </h2>
            </div>
            <p className="shrink-0 text-xl font-black text-zinc-900">
              R$ {moeda(produto.preco)}
            </p>
          </div>

          <p className="mt-3 leading-6 text-zinc-600">{produto.descricao}</p>

          <div className="my-6 border-t border-zinc-100" />

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-black">Alguma observação?</h3>
                <p className="text-sm text-zinc-500">Opcional</p>
              </div>
              <span className="text-xs text-zinc-400">{observacao.length}/200</span>
            </div>
            <textarea
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              maxLength={200}
              placeholder="Ex: sem cebola, sem tomate, maionese separada..."
              className="mt-3 min-h-24 w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex shrink-0 items-center rounded-xl border border-zinc-200 bg-white">
              <button
                type="button"
                onClick={() => setQuantidade((atual) => Math.max(1, atual - 1))}
                className="flex h-12 w-12 items-center justify-center text-2xl font-bold text-red-600 disabled:text-zinc-300"
                disabled={quantidade <= 1}
                aria-label="Diminuir quantidade"
              >
                −
              </button>
              <span className="min-w-9 text-center font-black">{quantidade}</span>
              <button
                type="button"
                onClick={() => setQuantidade((atual) => Math.min(99, atual + 1))}
                className="flex h-12 w-12 items-center justify-center text-2xl font-bold text-red-600"
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => adicionar(produto, quantidade, observacao)}
              className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-500 active:scale-[0.99]"
            >
              <span>Adicionar</span>
              <span>R$ {moeda(total)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
