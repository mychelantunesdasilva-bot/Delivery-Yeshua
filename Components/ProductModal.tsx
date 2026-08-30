"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Adicional = {
  nome: string;
  preco: number;
};

type GrupoOpcao = {
  titulo: string;
  opcoes: Adicional[];
};

type EscolhaObrigatoria = {
  titulo: string;
  escolha: Adicional;
};

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
  adicionais?: Adicional[];
  ingredientes?: string[];
  opcoesObrigatorias?: GrupoOpcao[];
  esgotado?: boolean;
};

type ItemInicial = {
  quantidade: number;
  observacao: string;
  adicionais: Adicional[];
  removidos: string[];
  escolhasObrigatorias: EscolhaObrigatoria[];
};

type ProductModalProps = {
  produto: Produto;
  fechar: () => void;
  salvar: (
    produto: Produto,
    quantidade: number,
    observacao: string,
    adicionais: Adicional[],
    removidos: string[],
    escolhasObrigatorias: EscolhaObrigatoria[]
  ) => void;
  itemInicial?: ItemInicial;
};

function moeda(valor: number) {
  return valor.toFixed(2).replace(".", ",");
}

export default function ProductModal({
  produto,
  fechar,
  salvar,
  itemInicial,
}: ProductModalProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<string[]>([]);
  const [removidos, setRemovidos] = useState<string[]>([]);
  const [escolhas, setEscolhas] = useState<Record<string, string>>({});
  const [imagemAtual, setImagemAtual] = useState(produto.imagem || "/produtos/DELIVERY.png");
  const [erroObrigatorio, setErroObrigatorio] = useState("");

  useEffect(() => {
    setQuantidade(itemInicial?.quantidade ?? 1);
    setObservacao(itemInicial?.observacao ?? "");
    setAdicionaisSelecionados(
      itemInicial?.adicionais.map((adicional) => adicional.nome) ?? []
    );
    setRemovidos(itemInicial?.removidos ?? []);
    setEscolhas(
      Object.fromEntries(
        (itemInicial?.escolhasObrigatorias || []).map((grupo) => [
          grupo.titulo,
          grupo.escolha.nome,
        ])
      )
    );
    setImagemAtual(produto.imagem || "/produtos/DELIVERY.png");
    setErroObrigatorio("");
  }, [produto.id, produto.imagem, itemInicial]);

  const adicionaisDisponiveis = useMemo(
    () =>
      (produto.adicionais || []).filter(
        (adicional) =>
          adicional &&
          typeof adicional.nome === "string" &&
          adicional.nome.trim() &&
          typeof adicional.preco === "number" &&
          adicional.preco >= 0
      ),
    [produto.adicionais]
  );

  const ingredientesDisponiveis = useMemo(
    () =>
      (produto.ingredientes || []).filter(
        (ingrediente) => typeof ingrediente === "string" && ingrediente.trim()
      ),
    [produto.ingredientes]
  );

  const gruposObrigatorios = useMemo(
    () =>
      (produto.opcoesObrigatorias || [])
        .filter(
          (grupo) =>
            grupo &&
            typeof grupo.titulo === "string" &&
            grupo.titulo.trim() &&
            Array.isArray(grupo.opcoes)
        )
        .map((grupo) => ({
          ...grupo,
          opcoes: grupo.opcoes.filter(
            (opcao) =>
              opcao &&
              typeof opcao.nome === "string" &&
              opcao.nome.trim() &&
              typeof opcao.preco === "number" &&
              opcao.preco >= 0
          ),
        }))
        .filter((grupo) => grupo.opcoes.length > 0),
    [produto.opcoesObrigatorias]
  );

  const adicionaisEscolhidos = adicionaisDisponiveis.filter((adicional) =>
    adicionaisSelecionados.includes(adicional.nome)
  );

  const escolhasObrigatorias: EscolhaObrigatoria[] = gruposObrigatorios
    .map((grupo) => {
      const nomeEscolhido = escolhas[grupo.titulo];
      const escolha = grupo.opcoes.find((opcao) => opcao.nome === nomeEscolhido);
      return escolha ? { titulo: grupo.titulo, escolha } : null;
    })
    .filter((item): item is EscolhaObrigatoria => item !== null);

  const valorAdicionais = adicionaisEscolhidos.reduce(
    (total, adicional) => total + adicional.preco,
    0
  );

  const valorObrigatorios = escolhasObrigatorias.reduce(
    (total, grupo) => total + grupo.escolha.preco,
    0
  );

  const total = (produto.preco + valorAdicionais + valorObrigatorios) * quantidade;

  function alternarAdicional(nome: string) {
    setAdicionaisSelecionados((atual) =>
      atual.includes(nome)
        ? atual.filter((item) => item !== nome)
        : [...atual, nome]
    );
  }

  function alternarRemocao(nome: string) {
    setRemovidos((atual) =>
      atual.includes(nome)
        ? atual.filter((item) => item !== nome)
        : [...atual, nome]
    );
  }

  function confirmar() {
    const faltando = gruposObrigatorios.find((grupo) => !escolhas[grupo.titulo]);
    if (faltando) {
      setErroObrigatorio(`Escolha uma opção em “${faltando.titulo}”.`);
      return;
    }

    setErroObrigatorio("");
    salvar(
      produto,
      quantidade,
      observacao,
      adicionaisEscolhidos,
      removidos,
      escolhasObrigatorias
    );
  }

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
            src={imagemAtual}
            alt={produto.nome}
            fill
            sizes="(max-width: 640px) 100vw, 576px"
            className="object-cover"
            priority
            onError={() => {
              if (imagemAtual !== "/produtos/DELIVERY.png") {
                setImagemAtual("/produtos/DELIVERY.png");
              }
            }}
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

          {gruposObrigatorios.map((grupo) => (
            <section key={grupo.titulo} className="mt-6 border-t border-zinc-100 pt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black">{grupo.titulo}</h3>
                  <p className="text-sm text-zinc-500">Escolha 1 opção.</p>
                </div>
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-black text-red-600">
                  Obrigatório
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {grupo.opcoes.map((opcao) => {
                  const selecionado = escolhas[grupo.titulo] === opcao.nome;
                  return (
                    <label
                      key={`${grupo.titulo}-${opcao.nome}`}
                      className={`flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3 transition ${
                        selecionado
                          ? "border-red-500 bg-red-50"
                          : "border-zinc-200 bg-white"
                      }`}
                    >
                      <span className="font-bold text-zinc-900">
                        {opcao.nome}
                        {opcao.preco > 0 && (
                          <span className="ml-2 text-sm font-medium text-zinc-500">
                            + R$ {moeda(opcao.preco)}
                          </span>
                        )}
                      </span>
                      <input
                        type="radio"
                        name={`grupo-${grupo.titulo}`}
                        checked={selecionado}
                        onChange={() => {
                          setEscolhas((atual) => ({
                            ...atual,
                            [grupo.titulo]: opcao.nome,
                          }));
                          setErroObrigatorio("");
                        }}
                        className="h-5 w-5 accent-red-600"
                      />
                    </label>
                  );
                })}
              </div>
            </section>
          ))}

          {adicionaisDisponiveis.length > 0 && (
            <section className="mt-6 border-t border-zinc-100 pt-6">
              <h3 className="font-black">Adicionais</h3>
              <p className="text-sm text-zinc-500">Escolha quantos quiser.</p>
              <div className="mt-3 space-y-2">
                {adicionaisDisponiveis.map((adicional) => {
                  const selecionado = adicionaisSelecionados.includes(adicional.nome);
                  return (
                    <label
                      key={adicional.nome}
                      className={`flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3 transition ${
                        selecionado ? "border-red-500 bg-red-50" : "border-zinc-200 bg-white"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block font-bold text-zinc-900">{adicional.nome}</span>
                        <span className="text-sm text-zinc-500">+ R$ {moeda(adicional.preco)}</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={selecionado}
                        onChange={() => alternarAdicional(adicional.nome)}
                        className="h-5 w-5 accent-red-600"
                      />
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {ingredientesDisponiveis.length > 0 && (
            <section className="mt-6 border-t border-zinc-100 pt-6">
              <h3 className="font-black">Remover ingredientes</h3>
              <p className="text-sm text-zinc-500">Marque o que você não quer.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {ingredientesDisponiveis.map((ingrediente) => {
                  const selecionado = removidos.includes(ingrediente);
                  return (
                    <label
                      key={ingrediente}
                      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                        selecionado
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-zinc-200 bg-white text-zinc-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selecionado}
                        onChange={() => alternarRemocao(ingrediente)}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className="min-w-0">Sem {ingrediente}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-6 border-t border-zinc-100 pt-6">
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
              placeholder="Ex: maionese separada, bem passado..."
              className="mt-3 min-h-24 w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
            />
          </section>

          {erroObrigatorio && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {erroObrigatorio}
            </p>
          )}

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
              onClick={confirmar}
              className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-500 active:scale-[0.99]"
            >
              <span>{itemInicial ? "Salvar" : "Adicionar"}</span>
              <span>R$ {moeda(total)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
