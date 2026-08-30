"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Adicional = {
  nome: string;
  preco: number;
};

type GrupoOpcao = {
  titulo: string;
  opcoes: Adicional[];
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

type FormProduto = {
  nome: string;
  descricao: string;
  preco: string;
  categoria: string;
  imagem: string;
  destaque: boolean;
  esgotado: boolean;
  ordem: string;
  ingredientes: string;
  adicionais: string;
  opcoesObrigatorias: string;
};

const categorias = [
  "Lanches",
  "Combos",
  "Porções",
  "Bebidas",
  "Ala-Minutas",
];

const formularioVazio: FormProduto = {
  nome: "",
  descricao: "",
  preco: "",
  categoria: "Lanches",
  imagem: "/produtos/DELIVERY.png",
  destaque: false,
  esgotado: false,
  ordem: "",
  ingredientes: "",
  adicionais: "",
  opcoesObrigatorias: "",
};

export default function PainelPage() {
  const [carregando, setCarregando] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [formulario, setFormulario] = useState<FormProduto>(formularioVazio);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroProdutos, setErroProdutos] = useState("");

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (usuario) => {
      if (!usuario) {
        window.location.href = "/admin";
        return;
      }

      setCarregando(false);
    });

    return () => cancelar();
  }, []);

  useEffect(() => {
    const cancelar = onSnapshot(
      collection(db, "produtos"),
      (snapshot) => {
        const lista = snapshot.docs
          .map((documento) => ({
            id: documento.id,
            ...documento.data(),
          }))
          .sort((a, b) => {
            const produtoA = a as Produto;
            const produtoB = b as Produto;
            const ordemA = produtoA.ordem ?? 9999;
            const ordemB = produtoB.ordem ?? 9999;

            if (ordemA !== ordemB) return ordemA - ordemB;
            return produtoA.nome.localeCompare(produtoB.nome, "pt-BR");
          }) as Produto[];

        setProdutos(lista);
        setErroProdutos("");
      },
      (error) => {
        console.error("Erro ao carregar produtos:", error);
        setErroProdutos("Não foi possível carregar os produtos.");
      }
    );

    return () => cancelar();
  }, []);

  const produtosAtivos = produtos.filter((produto) => produto.ativo).length;
  const produtosInativos = produtos.length - produtosAtivos;
  const produtosDestaque = produtos.filter((produto) => produto.destaque).length;
  const produtosEsgotados = produtos.filter((produto) => produto.esgotado).length;

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return produtos.filter((produto) => {
      const combinaBusca =
        !termo ||
        `${produto.nome} ${produto.descricao} ${produto.categoria}`
          .toLowerCase()
          .includes(termo);

      const combinaFiltro =
        filtro === "Todos" ||
        (filtro === "Ativos" && produto.ativo) ||
        (filtro === "Inativos" && !produto.ativo) ||
        (filtro === "Destaques" && produto.destaque) ||
        (filtro === "Esgotados" && produto.esgotado) ||
        produto.categoria === filtro;

      return combinaBusca && combinaFiltro;
    });
  }, [produtos, busca, filtro]);

  function atualizarCampo<K extends keyof FormProduto>(
    campo: K,
    valor: FormProduto[K]
  ) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function limparFormulario() {
    setFormulario(formularioVazio);
    setProdutoEditando(null);
  }

  function iniciarEdicao(produto: Produto) {
    setProdutoEditando(produto);
    setFormulario({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco.toString().replace(".", ","),
      categoria: produto.categoria,
      imagem: produto.imagem || "/produtos/DELIVERY.png",
      destaque: produto.destaque ?? false,
      esgotado: produto.esgotado ?? false,
      ordem: produto.ordem?.toString() ?? "",
      ingredientes: (produto.ingredientes || []).join("\n"),
      adicionais: (produto.adicionais || [])
        .map((adicional) => `${adicional.nome}|${adicional.preco.toFixed(2).replace(".", ",")}`)
        .join("\n"),
      opcoesObrigatorias: (produto.opcoesObrigatorias || [])
        .flatMap((grupo) =>
          grupo.opcoes.map(
            (opcao) =>
              `${grupo.titulo}|${opcao.nome}|${opcao.preco.toFixed(2).replace(".", ",")}`
          )
        )
        .join("\n"),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }


  function lerIngredientes(texto: string) {
    return [...new Set(
      texto
        .split("\n")
        .map((linha) => linha.trim())
        .filter(Boolean)
    )];
  }

  function lerAdicionais(texto: string): Adicional[] {
    const linhas = texto
      .split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean);

    return linhas.map((linha, indice) => {
      const [nomeBruto, precoBruto] = linha.split("|");
      const nome = (nomeBruto || "").trim();
      const preco = Number((precoBruto || "").trim().replace(",", "."));

      if (!nome || Number.isNaN(preco) || preco < 0) {
        throw new Error(
          `Adicional inválido na linha ${indice + 1}. Use o formato Nome|Preço, por exemplo: Bacon|5,00`
        );
      }

      return { nome, preco };
    });
  }


  function lerOpcoesObrigatorias(texto: string): GrupoOpcao[] {
    const grupos = new Map<string, Adicional[]>();
    const linhas = texto
      .split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean);

    linhas.forEach((linha, indice) => {
      const [tituloBruto, nomeBruto, precoBruto] = linha.split("|");
      const titulo = (tituloBruto || "").trim();
      const nome = (nomeBruto || "").trim();
      const preco = Number((precoBruto || "").trim().replace(",", "."));

      if (!titulo || !nome || Number.isNaN(preco) || preco < 0) {
        throw new Error(
          `Opção obrigatória inválida na linha ${indice + 1}. Use Grupo|Opção|Preço. Ex: Tamanho|Grande|5,00`
        );
      }

      const atuais = grupos.get(titulo) || [];
      atuais.push({ nome, preco });
      grupos.set(titulo, atuais);
    });

    return Array.from(grupos.entries()).map(([titulo, opcoes]) => ({
      titulo,
      opcoes,
    }));
  }

  async function salvarProduto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const preco = Number(formulario.preco.replace(",", "."));
    const ordem = formulario.ordem.trim()
      ? Number(formulario.ordem)
      : undefined;

    let ingredientes: string[] = [];
    let adicionais: Adicional[] = [];
    let opcoesObrigatorias: GrupoOpcao[] = [];

    try {
      ingredientes = lerIngredientes(formulario.ingredientes);
      adicionais = lerAdicionais(formulario.adicionais);
      opcoesObrigatorias = lerOpcoesObrigatorias(formulario.opcoesObrigatorias);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Revise os adicionais.");
      return;
    }

    if (
      !formulario.nome.trim() ||
      !formulario.descricao.trim() ||
      !formulario.categoria ||
      Number.isNaN(preco) ||
      preco <= 0
    ) {
      alert("Preencha nome, descrição, categoria e um preço válido.");
      return;
    }

    if (ordem !== undefined && (Number.isNaN(ordem) || ordem < 0)) {
      alert("A ordem precisa ser um número igual ou maior que zero.");
      return;
    }

    const dados = {
      nome: formulario.nome.trim(),
      descricao: formulario.descricao.trim(),
      preco,
      categoria: formulario.categoria,
      imagem: formulario.imagem.trim() || "/produtos/DELIVERY.png",
      destaque: formulario.destaque,
      esgotado: formulario.esgotado,
      ingredientes,
      adicionais,
      opcoesObrigatorias,
      ...(ordem !== undefined ? { ordem } : {}),
    };

    setSalvando(true);

    try {
      if (produtoEditando) {
        await updateDoc(doc(db, "produtos", produtoEditando.id), dados);
      } else {
        await addDoc(collection(db, "produtos"), {
          ...dados,
          ativo: true,
        });
      }

      limparFormulario();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Não foi possível salvar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatusProduto(produto: Produto) {
    try {
      await updateDoc(doc(db, "produtos", produto.id), {
        ativo: !produto.ativo,
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao alterar o status do produto.");
    }
  }

  async function alterarDestaque(produto: Produto) {
    try {
      await updateDoc(doc(db, "produtos", produto.id), {
        destaque: !(produto.destaque ?? false),
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao alterar o destaque do produto.");
    }
  }

  async function alterarEsgotado(produto: Produto) {
    try {
      await updateDoc(doc(db, "produtos", produto.id), {
        esgotado: !(produto.esgotado ?? false),
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao alterar a disponibilidade do produto.");
    }
  }

  async function excluirProduto(produto: Produto) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir "${produto.nome}"? Essa ação não pode ser desfeita.`
    );

    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "produtos", produto.id));

      if (produtoEditando?.id === produto.id) {
        limparFormulario();
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir produto.");
    }
  }

  async function sair() {
    await signOut(auth);
    window.location.href = "/admin";
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-amber-500" />
          <p className="mt-4 text-sm text-zinc-400">Verificando acesso...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-5 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500">
              Delivery Yeshua
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Painel administrativo
            </h1>
            <p className="mt-2 text-zinc-400">
              Gerencie seu cardápio em tempo real.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-bold transition hover:bg-zinc-800"
            >
              Ver cardápio ↗
            </a>
            <button
              onClick={sair}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold transition hover:bg-red-500"
            >
              Sair
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <CardResumo titulo="Produtos" valor={produtos.length} detalhe="Cadastrados" />
          <CardResumo titulo="Ativos" valor={produtosAtivos} detalhe="Visíveis no site" />
          <CardResumo titulo="Inativos" valor={produtosInativos} detalhe="Ocultos do site" />
          <CardResumo titulo="Destaques" valor={produtosDestaque} detalhe="Mais pedidos" />
          <CardResumo titulo="Esgotados" valor={produtosEsgotados} detalhe="Visíveis, sem compra" />
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl sm:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-black">
                {produtoEditando ? "Editar produto" : "Adicionar produto"}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {produtoEditando
                  ? `Editando: ${produtoEditando.nome}`
                  : "Cadastre um novo item no cardápio."}
              </p>
            </div>

            {produtoEditando && (
              <button
                type="button"
                onClick={limparFormulario}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar edição
              </button>
            )}
          </div>

          <form onSubmit={salvarProduto} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Campo label="Nome">
                <input
                  value={formulario.nome}
                  onChange={(event) => atualizarCampo("nome", event.target.value)}
                  placeholder="Ex: X Bacon"
                  className={classeCampo}
                />
              </Campo>

              <Campo label="Categoria">
                <select
                  value={formulario.categoria}
                  onChange={(event) =>
                    atualizarCampo("categoria", event.target.value)
                  }
                  className={classeCampo}
                >
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Preço">
                <input
                  inputMode="decimal"
                  value={formulario.preco}
                  onChange={(event) => atualizarCampo("preco", event.target.value)}
                  placeholder="Ex: 29,99"
                  className={classeCampo}
                />
              </Campo>

              <Campo label="Ordem no cardápio">
                <input
                  type="number"
                  min="0"
                  value={formulario.ordem}
                  onChange={(event) => atualizarCampo("ordem", event.target.value)}
                  placeholder="Ex: 1"
                  className={classeCampo}
                />
              </Campo>

              <Campo label="Caminho da imagem">
                <input
                  value={formulario.imagem}
                  onChange={(event) => atualizarCampo("imagem", event.target.value)}
                  placeholder="/produtos/x-bacon.jpg"
                  className={classeCampo}
                />
              </Campo>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formulario.destaque}
                  onChange={(event) =>
                    atualizarCampo("destaque", event.target.checked)
                  }
                  className="h-5 w-5 accent-amber-500"
                />
                <span>
                  <span className="block font-bold">Produto em destaque</span>
                  <span className="text-xs text-zinc-500">
                    Aparece na área “Mais pedidos”.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formulario.esgotado}
                  onChange={(event) =>
                    atualizarCampo("esgotado", event.target.checked)
                  }
                  className="h-5 w-5 accent-red-500"
                />
                <span>
                  <span className="block font-bold">Marcar como esgotado</span>
                  <span className="text-xs text-zinc-500">
                    Continua aparecendo no cardápio, mas não pode ser pedido.
                  </span>
                </span>
              </label>

              <div className="md:col-span-2 grid gap-4 lg:grid-cols-2">
                <Campo label="Ingredientes que o cliente pode remover">
                  <textarea
                    value={formulario.ingredientes}
                    onChange={(event) =>
                      atualizarCampo("ingredientes", event.target.value)
                    }
                    placeholder={"Um por linha. Ex:\nAlface\nTomate\nCebola"}
                    className={`${classeCampo} min-h-36 resize-y`}
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Deixe vazio em bebidas ou produtos sem personalização.
                  </p>
                </Campo>

                <Campo label="Adicionais e preços">
                  <textarea
                    value={formulario.adicionais}
                    onChange={(event) =>
                      atualizarCampo("adicionais", event.target.value)
                    }
                    placeholder={"Um por linha no formato Nome|Preço. Ex:\nBacon|5,00\nQueijo extra|3,00"}
                    className={`${classeCampo} min-h-36 resize-y`}
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Use uma barra vertical | entre o nome e o preço.
                  </p>
                </Campo>

                <Campo label="Opções obrigatórias">
                  <textarea
                    value={formulario.opcoesObrigatorias}
                    onChange={(event) =>
                      atualizarCampo("opcoesObrigatorias", event.target.value)
                    }
                    placeholder={"Uma opção por linha: Grupo|Opção|Preço. Ex:\nTamanho|Normal|0\nTamanho|Grande|5,00\nPonto|Bem passado|0"}
                    className={`${classeCampo} min-h-36 resize-y`}
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    O cliente terá que escolher 1 opção de cada grupo antes de adicionar.
                  </p>
                </Campo>
              </div>

              <div className="md:col-span-2">
                <Campo label="Descrição">
                  <textarea
                    value={formulario.descricao}
                    onChange={(event) =>
                      atualizarCampo("descricao", event.target.value)
                    }
                    placeholder="Descrição do produto..."
                    maxLength={300}
                    className={`${classeCampo} min-h-28 resize-y`}
                  />
                </Campo>
                <p className="mt-1 text-right text-xs text-zinc-500">
                  {formulario.descricao.length}/300
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="mt-6 rounded-xl bg-amber-500 px-6 py-3 font-black text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando
                ? "Salvando..."
                : produtoEditando
                  ? "Salvar alterações"
                  : "Adicionar produto"}
            </button>
          </form>
        </section>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-2xl font-black">Produtos cadastrados</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {produtosFiltrados.length} produto(s) exibido(s).
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar produto..."
                className={`${classeCampo} sm:w-72`}
              />

              <select
                value={filtro}
                onChange={(event) => setFiltro(event.target.value)}
                className={`${classeCampo} sm:w-48`}
              >
                <option>Todos</option>
                <option>Ativos</option>
                <option>Inativos</option>
                <option>Destaques</option>
                <option>Esgotados</option>
                {categorias.map((categoria) => (
                  <option key={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
          </div>

          {erroProdutos && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              {erroProdutos}
            </div>
          )}

          <div className="mt-5 grid gap-4">
            {produtosFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
                Nenhum produto encontrado.
              </div>
            ) : (
              produtosFiltrados.map((produto) => (
                <article
                  key={produto.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black">{produto.nome}</h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            produto.ativo
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </span>

                        {produto.destaque && (
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
                            ⭐ Destaque
                          </span>
                        )}
                        {produto.esgotado && (
                          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
                            Esgotado
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm font-medium text-zinc-400">
                        {produto.categoria}
                        {produto.ordem !== undefined
                          ? ` • Ordem ${produto.ordem}`
                          : ""}
                      </p>

                      {((produto.adicionais || []).length > 0 ||
                        (produto.ingredientes || []).length > 0) && (
                        <p className="mt-2 text-xs text-zinc-500">
                          {(produto.adicionais || []).length} adicional(is) • {" "}
                          {(produto.ingredientes || []).length} ingrediente(s) removível(is)
                        </p>
                      )}

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                        {produto.descricao}
                      </p>

                      <p className="mt-3 text-lg font-black text-amber-400">
                        R$ {produto.preco.toFixed(2).replace(".", ",")}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => iniciarEdicao(produto)}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold transition hover:bg-blue-500"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => alterarDestaque(produto)}
                        className="rounded-xl bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-400 transition hover:bg-amber-500/20"
                      >
                        {produto.destaque ? "Tirar destaque" : "Destacar"}
                      </button>

                      <button
                        onClick={() => alterarStatusProduto(produto)}
                        className="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-bold transition hover:bg-zinc-600"
                      >
                        {produto.ativo ? "Desativar" : "Ativar"}
                      </button>

                      <button
                        onClick={() => excluirProduto(produto)}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold transition hover:bg-red-500"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

const classeCampo =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10";

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

function CardResumo({
  titulo,
  valor,
  detalhe,
}: {
  titulo: string;
  valor: number;
  detalhe: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm font-bold text-zinc-400">{titulo}</p>
      <p className="mt-2 text-3xl font-black text-white">{valor}</p>
      <p className="mt-1 text-xs text-zinc-500">{detalhe}</p>
    </div>
  );
}
