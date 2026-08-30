"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/Components/Header";
import ProductCard from "@/Components/ProductCard";
import ProductModal from "@/Components/ProductModal";

type ProdutoCarrinho = {
  id: string;
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
  observacao?: string;
};

type ProdutoCardapio = {
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

const CARRINHO_KEY = "delivery-yeshua-carrinho";
const TELEFONE_LOJA = "5551994154447";

const TAXAS: Record<string, number> = {
  Guajuviras: 5,
  "Mato Grande": 7,
  Olaria: 6,
  Niterói: 8,
  Centro: 4,
};

function moeda(valor: number) {
  return valor.toFixed(2).replace(".", ",");
}

function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function Home() {
  const [produtos, setProdutos] = useState<ProdutoCardapio[]>([]);
  const [produtoAberto, setProdutoAberto] = useState<ProdutoCardapio | null>(null);
  const [carrinho, setCarrinho] = useState<ProdutoCarrinho[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pagamento, setPagamento] = useState("Pix");
  const [numeroPedido, setNumeroPedido] = useState("");
  const [observacaoPedido, setObservacaoPedido] = useState("");
  const [busca, setBusca] = useState("");
  const [bairro, setBairro] = useState("");
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [lojaAberta, setLojaAberta] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [erroProdutos, setErroProdutos] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<"entrega" | "retirada">("entrega");
  const [complemento, setComplemento] = useState("");
  const [trocoPara, setTrocoPara] = useState("");
  const [carrinhoCarregado, setCarrinhoCarregado] = useState(false);
  const [avisoCarrinho, setAvisoCarrinho] = useState("");
  const avisoCarrinhoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cancelar = onSnapshot(
      collection(db, "produtos"),
      (snapshot) => {
        const lista = snapshot.docs
          .map((documento) => {
            const dados = documento.data() as Omit<ProdutoCardapio, "id">;
            return { id: documento.id, ...dados };
          })
          .filter((produto) => produto.ativo !== false)
          .sort((a, b) => {
            const ordemA = a.ordem ?? 9999;
            const ordemB = b.ordem ?? 9999;
            if (ordemA !== ordemB) return ordemA - ordemB;
            return a.nome.localeCompare(b.nome, "pt-BR");
          });

        setProdutos(lista);
        setErroProdutos("");
        setCarregandoProdutos(false);
      },
      (error) => {
        console.error("Erro ao carregar o cardápio:", error);
        setErroProdutos("Não foi possível carregar o cardápio agora.");
        setCarregandoProdutos(false);
      }
    );

    return () => cancelar();
  }, []);

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(CARRINHO_KEY);
      if (!salvo) return;

      const dados = JSON.parse(salvo) as Array<Partial<ProdutoCarrinho>>;
      if (!Array.isArray(dados)) return;

      const normalizado = dados
        .filter(
          (item) =>
            typeof item.nome === "string" &&
            typeof item.preco === "number" &&
            typeof item.quantidade === "number" &&
            item.quantidade > 0
        )
        .map((item) => ({
          id: typeof item.id === "string" ? item.id : gerarId(),
          produtoId:
            typeof item.produtoId === "string" ? item.produtoId : item.nome || gerarId(),
          nome: item.nome || "Produto",
          preco: item.preco || 0,
          quantidade: Math.max(1, Math.floor(item.quantidade || 1)),
          observacao: typeof item.observacao === "string" ? item.observacao : "",
        }));

      setCarrinho(normalizado);
    } catch (error) {
      console.error("Erro ao restaurar carrinho:", error);
    } finally {
      setCarrinhoCarregado(true);
    }
  }, []);

  useEffect(() => {
    if (!carrinhoCarregado) return;
    window.localStorage.setItem(CARRINHO_KEY, JSON.stringify(carrinho));
  }, [carrinho, carrinhoCarregado]);

  useEffect(() => {
    return () => {
      if (avisoCarrinhoTimer.current) clearTimeout(avisoCarrinhoTimer.current);
    };
  }, []);

  useEffect(() => {
    function atualizarStatusLoja() {
      const horaBrasilia = Number(
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          hourCycle: "h23",
        }).format(new Date())
      );

      setLojaAberta(horaBrasilia >= 19 || horaBrasilia < 1);
    }

    atualizarStatusLoja();
    const intervalo = window.setInterval(atualizarStatusLoja, 60_000);
    return () => window.clearInterval(intervalo);
  }, []);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return produtos;

    return produtos.filter((produto) =>
      `${produto.nome} ${produto.descricao} ${produto.categoria}`
        .toLowerCase()
        .includes(termo)
    );
  }, [produtos, busca]);

  const produtosDestaque = useMemo(() => {
    const destacados = produtos.filter((produto) => produto.destaque === true);
    if (destacados.length > 0) return destacados.slice(0, 6);

    return produtos
      .filter((produto) =>
        ["Xis Salada", "X Frango", "X Calabresa"].includes(produto.nome)
      )
      .slice(0, 6);
  }, [produtos]);

  const categorias = ["Lanches", "Combos", "Porções", "Bebidas", "Ala-Minutas"];

  function selecionarBairro(nomeBairro: string) {
    setBairro(nomeBairro);
    setTaxaEntrega(TAXAS[nomeBairro] ?? 0);
  }

  function mostrarAviso(nomeProduto: string) {
    setAvisoCarrinho(`${nomeProduto} foi adicionado à sacola.`);

    if (avisoCarrinhoTimer.current) clearTimeout(avisoCarrinhoTimer.current);
    avisoCarrinhoTimer.current = setTimeout(() => setAvisoCarrinho(""), 2500);
  }

  function adicionarProduto(
    produto: ProdutoCardapio,
    quantidade: number,
    observacao: string
  ) {
    const obs = observacao.trim();

    setCarrinho((atual) => {
      const existente = atual.find(
        (item) => item.produtoId === produto.id && (item.observacao || "") === obs
      );

      if (existente) {
        return atual.map((item) =>
          item.id === existente.id
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        );
      }

      return [
        ...atual,
        {
          id: gerarId(),
          produtoId: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade,
          observacao: obs,
        },
      ];
    });

    setProdutoAberto(null);
    mostrarAviso(produto.nome);
  }

  function alterarQuantidade(itemId: string, delta: number) {
    setCarrinho((atual) =>
      atual
        .map((item) =>
          item.id === itemId
            ? { ...item, quantidade: item.quantidade + delta }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  function removerProduto(itemId: string) {
    setCarrinho((atual) => atual.filter((item) => item.id !== itemId));
  }

  const quantidadeTotal = carrinho.reduce(
    (total, produto) => total + produto.quantidade,
    0
  );

  const valorTotal = carrinho.reduce(
    (total, produto) => total + produto.preco * produto.quantidade,
    0
  );

  const taxaAplicada = tipoEntrega === "entrega" ? taxaEntrega : 0;
  const totalComEntrega = valorTotal + taxaAplicada;
  const tempoEntrega = tipoEntrega === "entrega" ? "40–60 minutos" : "20–35 minutos";

  function abrirCheckout() {
    if (carrinho.length === 0) return;
    setCarrinhoAberto(false);
    setCheckoutAberto(true);
  }

  function confirmarPedido() {
    if (!nome.trim() || !telefone.trim()) {
      alert("Preencha nome e telefone.");
      return;
    }

    if (tipoEntrega === "entrega" && (!endereco.trim() || !bairro)) {
      alert("Preencha endereço e bairro para entrega.");
      return;
    }

    if (pagamento === "Dinheiro" && trocoPara.trim()) {
      const valorTroco = Number(trocoPara.replace(",", "."));
      if (Number.isNaN(valorTroco) || valorTroco < totalComEntrega) {
        alert("O valor para troco precisa ser maior ou igual ao total do pedido.");
        return;
      }
    }

    if (carrinho.length === 0) {
      alert("Sua sacola está vazia.");
      return;
    }

    setNumeroPedido(String(Math.floor(1000 + Math.random() * 9000)));
    setCheckoutAberto(false);
    setPedidoConfirmado(true);
  }

  function enviarWhatsApp() {
    if (!numeroPedido || carrinho.length === 0) return;

    const itens = carrinho
      .map((produto) => {
        const subtotal = produto.preco * produto.quantidade;
        const obs = produto.observacao ? `\n   Obs.: ${produto.observacao}` : "";
        return `${produto.quantidade}x ${produto.nome} — R$ ${moeda(subtotal)}${obs}`;
      })
      .join("\n\n");

    const mensagem = `🍔 NOVO PEDIDO — DELIVERY YESHUA
Pedido #${numeroPedido}

👤 Cliente: ${nome.trim()}
📱 Telefone: ${telefone.trim()}
🚚 Tipo: ${tipoEntrega === "entrega" ? "Entrega" : "Retirada no local"}
${
      tipoEntrega === "entrega"
        ? `📍 Endereço: ${endereco.trim()}\n🏠 Complemento: ${
            complemento.trim() || "Nenhum"
          }\n🗺️ Bairro: ${bairro}`
        : "📍 Retirada no local"
    }
⏱️ Estimativa: ${tempoEntrega}
💳 Pagamento: ${pagamento}${
      pagamento === "Dinheiro"
        ? `\n💵 Troco para: ${trocoPara.trim() || "Não informado"}`
        : ""
    }

🧾 ITENS
${itens}

📝 Observação geral: ${observacaoPedido.trim() || "Nenhuma"}

Subtotal: R$ ${moeda(valorTotal)}
Taxa de entrega: R$ ${moeda(taxaAplicada)}
*TOTAL: R$ ${moeda(totalComEntrega)}*`;

    const link = `https://wa.me/${TELEFONE_LOJA}?text=${encodeURIComponent(mensagem)}`;
    window.open(link, "_blank", "noopener,noreferrer");

    setCarrinho([]);
    setPedidoConfirmado(false);
    setNome("");
    setTelefone("");
    setEndereco("");
    setComplemento("");
    setBairro("");
    setTaxaEntrega(0);
    setObservacaoPedido("");
    setPagamento("Pix");
    setTrocoPara("");
    setTipoEntrega("entrega");
    setNumeroPedido("");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-24 text-zinc-900">
      <Header
        quantidadeCarrinho={quantidadeTotal}
        abrirCarrinho={() => setCarrinhoAberto(true)}
      />

      <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-red-600 via-red-500 to-orange-400 sm:h-32" />

          <div className="relative px-5 pb-5 sm:px-6">
            <div className="-mt-10 flex items-end justify-between gap-4">
              <div className="flex min-w-0 items-end gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/produtos/DELIVERY.png"
                    alt="Delivery Yeshua"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 pb-1">
                  <h1 className="truncate text-2xl font-black text-zinc-900 sm:text-3xl">
                    Delivery Yeshua
                  </h1>
                  <p className="truncate text-sm text-zinc-500">
                    Lanches • Combos • Porções
                  </p>
                </div>
              </div>

              <span
                className={`mb-1 shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                  lojaAberta
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {lojaAberta ? "Aberto" : "Fechado"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 divide-x divide-zinc-200 rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-center sm:grid-cols-3">
              <div>
                <p className="text-xs text-zinc-500">Entrega</p>
                <p className="mt-1 text-sm font-bold text-zinc-900">40–60 min</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-zinc-500">Funcionamento</p>
                <p className="mt-1 text-sm font-bold text-zinc-900">Todos os dias</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Horário</p>
                <p className="mt-1 text-sm font-bold text-zinc-900">19h–01h</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <input
            type="search"
            placeholder="Buscar no cardápio..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 shadow-sm outline-none placeholder:text-zinc-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
          />
        </div>

        {carregandoProdutos && (
          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-white"
              />
            ))}
          </div>
        )}

        {!carregandoProdutos && erroProdutos && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {erroProdutos}
          </div>
        )}

        {!carregandoProdutos &&
          !erroProdutos &&
          !busca.trim() &&
          produtosDestaque.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-black text-zinc-900">Mais pedidos</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {produtosDestaque.map((produto) => (
                  <ProductCard
                    key={`destaque-${produto.id}`}
                    nome={produto.nome}
                    descricao={produto.descricao}
                    preco={moeda(produto.preco)}
                    imagem={produto.imagem}
                    abrirDetalhes={() => setProdutoAberto(produto)}
                  />
                ))}
              </div>
            </div>
          )}

        <div className="sticky top-[76px] z-30 -mx-4 mt-7 border-y border-zinc-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                type="button"
                onClick={() =>
                  document.getElementById(categoria)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="shrink-0 rounded-full bg-zinc-100 px-5 py-2 font-bold text-zinc-700 transition hover:bg-red-50 hover:text-red-600"
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>

        {produtosFiltrados.length === 0 && !carregandoProdutos && (
          <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 text-center text-zinc-500">
            Nenhum produto encontrado para “{busca}”.
          </div>
        )}

        {categorias.map((categoria) => {
          const produtosDaCategoria = produtosFiltrados.filter(
            (produto) => produto.categoria === categoria
          );
          if (produtosDaCategoria.length === 0) return null;

          return (
            <div key={categoria} id={categoria} className="mt-8 scroll-mt-40">
              <h2 className="text-2xl font-black text-zinc-900">{categoria}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {produtosDaCategoria.map((produto) => (
                  <ProductCard
                    key={produto.id}
                    nome={produto.nome}
                    descricao={produto.descricao}
                    preco={moeda(produto.preco)}
                    imagem={produto.imagem}
                    abrirDetalhes={() => setProdutoAberto(produto)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {produtoAberto && (
        <ProductModal
          produto={produtoAberto}
          fechar={() => setProdutoAberto(null)}
          adicionar={adicionarProduto}
        />
      )}

      {avisoCarrinho && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-24 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-emerald-600">✓ Adicionado!</p>
              <p className="truncate text-sm text-zinc-500">{avisoCarrinho}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCarrinhoAberto(true);
                setAvisoCarrinho("");
              }}
              className="shrink-0 rounded-xl bg-red-600 px-3 py-2 text-sm font-black text-white transition hover:bg-red-500"
            >
              Ver sacola
            </button>
          </div>
        </div>
      )}

      {quantidadeTotal > 0 &&
        !carrinhoAberto &&
        !checkoutAberto &&
        !pedidoConfirmado &&
        !produtoAberto && (
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
            <button
              type="button"
              onClick={() => setCarrinhoAberto(true)}
              className="mx-auto flex w-full max-w-lg items-center justify-between gap-4 rounded-xl bg-red-600 px-5 py-3.5 text-left text-white shadow-lg transition active:scale-[0.99]"
            >
              <div>
                <p className="text-sm font-black">
                  {quantidadeTotal} {quantidadeTotal === 1 ? "item" : "itens"} na sacola
                </p>
                <p className="text-xs font-bold opacity-85">R$ {moeda(valorTotal)}</p>
              </div>
              <span className="font-black">Ver sacola →</span>
            </button>
          </div>
        )}

      {carrinhoAberto && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white text-zinc-900 shadow-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-black">Sua sacola</h2>
                <p className="text-sm text-zinc-500">
                  {quantidadeTotal} {quantidadeTotal === 1 ? "item" : "itens"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCarrinhoAberto(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl"
                aria-label="Fechar sacola"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              {carrinho.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-lg font-bold">Sua sacola está vazia</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Escolha um produto do cardápio para começar.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-5">
                    {carrinho.map((produto) => (
                      <div key={produto.id} className="border-b border-zinc-100 pb-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-900">{produto.nome}</p>
                            <p className="mt-1 text-sm text-zinc-500">
                              R$ {moeda(produto.preco)} cada
                            </p>
                            {produto.observacao && (
                              <p className="mt-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                                Obs.: {produto.observacao}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removerProduto(produto.id)}
                            className="shrink-0 text-sm font-bold text-red-600"
                          >
                            Remover
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="flex items-center rounded-full border border-zinc-200 bg-white">
                            <button
                              type="button"
                              onClick={() => alterarQuantidade(produto.id, -1)}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold text-red-600"
                              aria-label={`Diminuir ${produto.nome}`}
                            >
                              −
                            </button>
                            <span className="min-w-8 text-center font-bold">
                              {produto.quantidade}
                            </span>
                            <button
                              type="button"
                              onClick={() => alterarQuantidade(produto.id, 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold text-red-600"
                              aria-label={`Aumentar ${produto.nome}`}
                            >
                              +
                            </button>
                          </div>

                          <span className="font-black text-zinc-900">
                            R$ {moeda(produto.preco * produto.quantidade)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between text-lg font-black">
                    <span>Subtotal</span>
                    <span>R$ {moeda(valorTotal)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={abrirCheckout}
                    className="mt-6 w-full rounded-xl bg-red-600 py-3.5 font-black text-white transition hover:bg-red-500"
                  >
                    Continuar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {checkoutAberto && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white text-zinc-900 shadow-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-black">Finalizar pedido</h2>
                <p className="text-sm text-zinc-500">Revise os dados antes de enviar</p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutAberto(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl"
                aria-label="Fechar checkout"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 p-5">
              <section>
                <h3 className="font-black">Seus dados</h3>
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                  />
                  <input
                    type="tel"
                    placeholder="Seu telefone"
                    value={telefone}
                    onChange={(event) => setTelefone(event.target.value)}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>
              </section>

              <section>
                <h3 className="font-black">Como você quer receber?</h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoEntrega("entrega")}
                    className={`rounded-xl border px-4 py-3 font-bold transition ${
                      tipoEntrega === "entrega"
                        ? "border-red-600 bg-red-50 text-red-600"
                        : "border-zinc-300 bg-white text-zinc-700"
                    }`}
                  >
                    🛵 Entrega
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoEntrega("retirada")}
                    className={`rounded-xl border px-4 py-3 font-bold transition ${
                      tipoEntrega === "retirada"
                        ? "border-red-600 bg-red-50 text-red-600"
                        : "border-zinc-300 bg-white text-zinc-700"
                    }`}
                  >
                    🏪 Retirada
                  </button>
                </div>
              </section>

              {tipoEntrega === "entrega" && (
                <section>
                  <h3 className="font-black">Endereço de entrega</h3>
                  <div className="mt-3 space-y-3">
                    <input
                      type="text"
                      placeholder="Rua e número"
                      value={endereco}
                      onChange={(event) => setEndereco(event.target.value)}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                    />
                    <select
                      value={bairro}
                      onChange={(event) => selecionarBairro(event.target.value)}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                    >
                      <option value="">Selecione seu bairro</option>
                      {Object.entries(TAXAS).map(([nomeBairro, taxa]) => (
                        <option key={nomeBairro} value={nomeBairro}>
                          {nomeBairro} — R$ {moeda(taxa)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Complemento ou referência (opcional)"
                      value={complemento}
                      onChange={(event) => setComplemento(event.target.value)}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                    />
                  </div>
                </section>
              )}

              <section>
                <h3 className="font-black">Pagamento</h3>
                <select
                  value={pagamento}
                  onChange={(event) => setPagamento(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão na entrega">Cartão na entrega</option>
                </select>

                {pagamento === "Dinheiro" && (
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Troco para quanto? Ex: 100,00"
                    value={trocoPara}
                    onChange={(event) => setTrocoPara(event.target.value)}
                    className="mt-3 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                  />
                )}
              </section>

              <section>
                <h3 className="font-black">Observação geral</h3>
                <textarea
                  placeholder="Ex: chamar no portão, não tocar campainha..."
                  value={observacaoPedido}
                  onChange={(event) => setObservacaoPedido(event.target.value)}
                  maxLength={300}
                  className="mt-3 min-h-24 w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
                <p className="mt-1 text-right text-xs text-zinc-500">
                  {observacaoPedido.length}/300
                </p>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <h3 className="font-black">Resumo</h3>
                <div className="mt-3 space-y-2 text-sm">
                  {carrinho.map((produto) => (
                    <div key={produto.id} className="flex justify-between gap-4">
                      <span className="text-zinc-700">
                        {produto.quantidade}x {produto.nome}
                      </span>
                      <span className="font-semibold">
                        R$ {moeda(produto.preco * produto.quantidade)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="my-4 border-t border-zinc-200" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span>R$ {moeda(valorTotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Taxa de entrega</span>
                    <span>
                      {tipoEntrega === "retirada"
                        ? "Grátis"
                        : bairro
                        ? `R$ ${moeda(taxaAplicada)}`
                        : "Selecione o bairro"}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-zinc-900">
                    <span>Total</span>
                    <span>R$ {moeda(totalComEntrega)}</span>
                  </div>
                  <p className="pt-1 text-xs text-zinc-500">Estimativa: {tempoEntrega}</p>
                </div>
              </section>

              <button
                type="button"
                onClick={confirmarPedido}
                className="w-full rounded-xl bg-red-600 py-3.5 font-black text-white transition hover:bg-red-500"
              >
                Revisar e confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {pedidoConfirmado && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 text-zinc-900 shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-600">Tudo certo ✓</p>
                <h2 className="mt-1 text-2xl font-black">Confirmar pedido</h2>
                <p className="mt-1 text-sm text-zinc-500">Pedido #{numeroPedido}</p>
              </div>
              <button
                type="button"
                onClick={() => setPedidoConfirmado(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl"
                aria-label="Fechar confirmação"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-zinc-50 p-4 text-sm">
              <p><strong>{nome}</strong> • {telefone}</p>
              <p className="mt-2">
                {tipoEntrega === "entrega"
                  ? `${endereco}${complemento.trim() ? `, ${complemento}` : ""} — ${bairro}`
                  : "Retirada no local"}
              </p>
              <p className="mt-2">Pagamento: <strong>{pagamento}</strong></p>
              {pagamento === "Dinheiro" && trocoPara.trim() && (
                <p className="mt-1">Troco para: R$ {trocoPara}</p>
              )}
            </div>

            <div className="mt-5 space-y-4">
              {carrinho.map((produto) => (
                <div key={produto.id} className="border-b border-zinc-100 pb-4">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold">
                      {produto.quantidade}x {produto.nome}
                    </span>
                    <span className="font-bold">
                      R$ {moeda(produto.preco * produto.quantidade)}
                    </span>
                  </div>
                  {produto.observacao && (
                    <p className="mt-1 text-sm text-zinc-500">Obs.: {produto.observacao}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Subtotal</span>
                <span>R$ {moeda(valorTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Taxa de entrega</span>
                <span>R$ {moeda(taxaAplicada)}</span>
              </div>
              <div className="flex justify-between text-xl font-black">
                <span>Total</span>
                <span>R$ {moeda(totalComEntrega)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={enviarWhatsApp}
              className="mt-6 w-full rounded-xl bg-green-600 py-3.5 font-black text-white transition hover:bg-green-500"
            >
              Enviar pedido no WhatsApp
            </button>
            <p className="mt-2 text-center text-xs text-zinc-500">
              O WhatsApp abrirá com o pedido completo pronto para enviar.
            </p>
          </div>
        </div>
      )}

      <a
        href={`https://wa.me/${TELEFONE_LOJA}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl shadow-xl transition hover:scale-105 hover:bg-green-500 ${
          quantidadeTotal > 0 ? "bottom-24 md:bottom-5" : "bottom-5"
        }`}
        aria-label="Falar com a Delivery Yeshua pelo WhatsApp"
        title="Fale conosco pelo WhatsApp"
      >
        💬
      </a>

      <footer className="mt-14 border-t border-zinc-200 bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-black text-zinc-900">Delivery Yeshua</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Seu lanche favorito, direto até você.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900">Horário</h4>
              <p className="mt-2 text-sm text-zinc-500">Todos os dias</p>
              <p className="text-sm text-zinc-500">19:00 às 01:00</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900">Formas de pagamento</h4>
              <p className="mt-2 text-sm text-zinc-500">
                Pix • Dinheiro • Cartão na entrega
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-200 pt-6 text-center text-sm text-zinc-500">
            © 2026 Delivery Yeshua. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
