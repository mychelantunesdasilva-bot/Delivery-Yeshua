"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/Components/Header";
import ProductCard from "@/Components/ProductCard";

type ProdutoCarrinho = {
  nome: string;
  preco: number;
  quantidade: number;
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

export default function Home() {
  const [produtos, setProdutos] = useState<ProdutoCardapio[]>([]);
  const [carrinho, setCarrinho] = useState<ProdutoCarrinho[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pagamento, setPagamento] = useState("Pix");
  const [numeroPedido, setNumeroPedido] = useState("");
  const [observacao, setObservacao] = useState("");
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

            return {
              id: documento.id,
              ...dados,
            };
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
      const salvo = window.localStorage.getItem("delivery-yeshua-carrinho");

      if (salvo) {
        setCarrinho(JSON.parse(salvo));
      }
    } catch (error) {
      console.error("Erro ao restaurar carrinho:", error);
    } finally {
      setCarrinhoCarregado(true);
    }
  }, []);

  useEffect(() => {
    if (!carrinhoCarregado) return;

    window.localStorage.setItem(
      "delivery-yeshua-carrinho",
      JSON.stringify(carrinho)
    );
  }, [carrinho, carrinhoCarregado]);

  useEffect(() => {
    return () => {
      if (avisoCarrinhoTimer.current) {
        clearTimeout(avisoCarrinhoTimer.current);
      }
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

  const categorias = [
    "Lanches",
    "Combos",
    "Porções",
    "Bebidas",
    "Ala-Minutas",
  ];

  function selecionarBairro(nomeBairro: string) {
    setBairro(nomeBairro);

    const taxas: Record<string, number> = {
      Guajuviras: 5,
      "Mato Grande": 7,
      Olaria: 6,
      Niterói: 8,
      Centro: 4,
    };

    setTaxaEntrega(taxas[nomeBairro] ?? 0);
  }

  function adicionarAoCarrinho(nome: string, preco: number) {
    setCarrinho((carrinhoAtual) => {
      const produtoExistente = carrinhoAtual.find(
        (produto) => produto.nome === nome
      );

      if (produtoExistente) {
        return carrinhoAtual.map((produto) =>
          produto.nome === nome
            ? { ...produto, quantidade: produto.quantidade + 1 }
            : produto
        );
      }

      return [...carrinhoAtual, { nome, preco, quantidade: 1 }];
    });

    setAvisoCarrinho(`${nome} foi adicionado ao carrinho.`);

    if (avisoCarrinhoTimer.current) {
      clearTimeout(avisoCarrinhoTimer.current);
    }

    avisoCarrinhoTimer.current = setTimeout(() => {
      setAvisoCarrinho("");
    }, 2500);
  }

  function diminuirQuantidade(nome: string) {
    setCarrinho((carrinhoAtual) =>
      carrinhoAtual
        .map((produto) =>
          produto.nome === nome
            ? { ...produto, quantidade: produto.quantidade - 1 }
            : produto
        )
        .filter((produto) => produto.quantidade > 0)
    );
  }

  function removerProduto(nome: string) {
    setCarrinho((carrinhoAtual) =>
      carrinhoAtual.filter((produto) => produto.nome !== nome)
    );
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
  const tempoEntrega =
    tipoEntrega === "entrega" ? "40–60 minutos" : "20–35 minutos";

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
      alert("Seu carrinho está vazio.");
      return;
    }

    const numero = Math.floor(1000 + Math.random() * 9000);
    setNumeroPedido(numero.toString());
    setCheckoutAberto(false);
    setPedidoConfirmado(true);
  }

  function enviarWhatsApp() {
    if (!numeroPedido || carrinho.length === 0) return;

    const itens = carrinho
      .map(
        (produto) =>
          `${produto.quantidade}x ${produto.nome} - R$ ${(
            produto.preco * produto.quantidade
          )
            .toFixed(2)
            .replace(".", ",")}`
      )
      .join("\n");

    const mensagem = `Pedido #${numeroPedido}

Cliente: ${nome}
Telefone: ${telefone}
Tipo: ${tipoEntrega === "entrega" ? "Entrega" : "Retirada no local"}
Endereço: ${tipoEntrega === "entrega" ? endereco : "Retirada no local"}
Complemento: ${tipoEntrega === "entrega" ? complemento.trim() || "Nenhum" : "-"}
Bairro: ${tipoEntrega === "entrega" ? bairro : "-"}
Tempo estimado: ${tempoEntrega}
Pagamento: ${pagamento}
${pagamento === "Dinheiro" ? `Troco para: ${trocoPara.trim() || "Não informado"}` : ""}

Itens:
${itens}

Observações: ${observacao.trim() || "Nenhuma"}

Subtotal: R$ ${valorTotal.toFixed(2).replace(".", ",")}
Taxa de entrega: R$ ${taxaAplicada.toFixed(2).replace(".", ",")}
Total: R$ ${totalComEntrega.toFixed(2).replace(".", ",")}`;

    const telefoneLoja = "5551994154447";
    const link = `https://wa.me/${telefoneLoja}?text=${encodeURIComponent(
      mensagem
    )}`;

    window.open(link, "_blank", "noopener,noreferrer");

    setCarrinho([]);
    setPedidoConfirmado(false);
    setNome("");
    setTelefone("");
    setEndereco("");
    setComplemento("");
    setBairro("");
    setTaxaEntrega(0);
    setObservacao("");
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
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                  <img
                    src="/produtos/DELIVERY.png"
                    alt="Delivery Yeshua"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="pb-1">
                  <h2 className="text-2xl font-black text-zinc-900 sm:text-3xl">
                    Delivery Yeshua
                  </h2>
                  <p className="text-sm text-zinc-500">Lanches • Combos • Porções</p>
                </div>
              </div>

              <span
                className={`mb-1 rounded-full px-3 py-1 text-xs font-bold ${
                  lojaAberta
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {lojaAberta ? "Aberto" : "Fechado"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 divide-x divide-zinc-200 rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-center">
              <div>
                <p className="text-xs text-zinc-500">Entrega</p>
                <p className="mt-1 text-sm font-bold text-zinc-900">40–60 min</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Pedido mínimo</p>
                <p className="mt-1 text-sm font-bold text-zinc-900">Sem mínimo</p>
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
            type="text"
            placeholder="🔎 Buscar no cardápio..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 shadow-sm outline-none placeholder:text-zinc-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
          />
        </div>

        {carregandoProdutos && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl border border-zinc-200 bg-white"
              />
            ))}
          </div>
        )}

        {!carregandoProdutos && erroProdutos && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {erroProdutos}
          </div>
        )}

        {!carregandoProdutos && !erroProdutos && !busca.trim() && produtosDestaque.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-black text-zinc-900">
              ⭐ Mais pedidos
            </h2>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {produtosDestaque.map((produto) => (
                <ProductCard
                  key={`destaque-${produto.nome}`}
                  nome={produto.nome}
                  descricao={produto.descricao}
                  preco={produto.preco.toFixed(2).replace(".", ",")}
                  imagem={produto.imagem}
                  adicionarAoCarrinho={() =>
                    adicionarAoCarrinho(produto.nome, produto.preco)
                  }
                />
              ))}
            </div>
          </div>
        )}

        <div className="sticky top-[76px] z-30 -mx-4 mt-7 border-y border-zinc-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categorias.map((categoria, index) => (
              <button
                key={categoria}
                onClick={() =>
                  document.getElementById(categoria)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className={`shrink-0 rounded-full px-5 py-2 font-bold transition ${
                  index === 0
                    ? "bg-red-600 text-white hover:bg-red-500"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>

        {produtosFiltrados.length === 0 && (
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
            <div
              key={categoria}
              id={categoria}
              className="mt-8 scroll-mt-40"
            >
              <h2 className="text-2xl font-black text-zinc-900">
                {categoria}
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {produtosDaCategoria.map((produto) => (
                  <ProductCard
                    key={produto.nome}
                    nome={produto.nome}
                    descricao={produto.descricao}
                    preco={produto.preco.toFixed(2).replace(".", ",")}
                    imagem={produto.imagem}
                    adicionarAoCarrinho={() =>
                      adicionarAoCarrinho(produto.nome, produto.preco)
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>


      {avisoCarrinho && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-24 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 shadow-2xl"
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
              Ver carrinho
            </button>
          </div>
        </div>
      )}

      {quantidadeTotal > 0 && !carrinhoAberto && !checkoutAberto && !pedidoConfirmado && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setCarrinhoAberto(true)}
            className="mx-auto flex w-full max-w-lg items-center justify-between gap-4 rounded-xl bg-red-600 px-5 py-3.5 text-left text-white shadow-lg transition active:scale-[0.99]"
          >
            <div>
              <p className="text-sm font-black">
                🛒 {quantidadeTotal} {quantidadeTotal === 1 ? "item" : "itens"} no carrinho
              </p>
              <p className="text-xs font-bold opacity-80">
                R$ {valorTotal.toFixed(2).replace(".", ",")}
              </p>
            </div>
            <span className="font-black">Ver carrinho →</span>
          </button>
        </div>
      )}

      {carrinhoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-black">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Seu carrinho</h2>
              <button
                onClick={() => setCarrinhoAberto(false)}
                className="text-2xl"
                aria-label="Fechar carrinho"
              >
                ✕
              </button>
            </div>

            {carrinho.length === 0 ? (
              <p className="mt-6 text-zinc-500">Seu carrinho está vazio.</p>
            ) : (
              <>
                <div className="mt-6 space-y-4">
                  {carrinho.map((produto) => (
                    <div
                      key={produto.nome}
                      className="border-b border-zinc-200 pb-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{produto.nome}</p>
                          <p className="text-sm text-zinc-500">
                            R$ {produto.preco.toFixed(2).replace(".", ",")} cada
                          </p>
                        </div>

                        <button
                          onClick={() => removerProduto(produto.nome)}
                          className="text-sm text-red-600"
                        >
                          Remover
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => diminuirQuantidade(produto.nome)}
                            className="h-8 w-8 rounded-full bg-zinc-200 font-bold"
                          >
                            -
                          </button>

                          <span className="font-semibold">
                            {produto.quantidade}
                          </span>

                          <button
                            onClick={() =>
                              adicionarAoCarrinho(produto.nome, produto.preco)
                            }
                            className="h-8 w-8 rounded-full bg-black font-bold text-zinc-900"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold">
                          R$ {(produto.preco * produto.quantidade)
                            .toFixed(2)
                            .replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between text-xl font-bold">
                  <span>Subtotal</span>
                  <span>R$ {valorTotal.toFixed(2).replace(".", ",")}</span>
                </div>

                <button
                  onClick={() => {
                    setCarrinhoAberto(false);
                    setCheckoutAberto(true);
                  }}
                  className="mt-6 w-full rounded-xl bg-red-600 py-3 font-bold text-white"
                >
                  Finalizar pedido
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {checkoutAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-black">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Finalizar pedido</h2>
              <button
                onClick={() => setCheckoutAberto(false)}
                className="text-2xl"
                aria-label="Fechar checkout"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block font-medium">Nome</label>
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">Telefone</label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(event) => setTelefone(event.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Como você quer receber?</label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoEntrega("entrega")}
                    className={`rounded-xl border px-4 py-3 font-bold ${
                      tipoEntrega === "entrega"
                        ? "border-red-600 bg-red-600 text-black"
                        : "border-zinc-300 bg-white text-black"
                    }`}
                  >
                    🛵 Entrega
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTipoEntrega("retirada");
                      setTaxaEntrega(0);
                    }}
                    className={`rounded-xl border px-4 py-3 font-bold ${
                      tipoEntrega === "retirada"
                        ? "border-red-600 bg-red-600 text-black"
                        : "border-zinc-300 bg-white text-black"
                    }`}
                  >
                    🏪 Retirada
                  </button>
                </div>
              </div>

              {tipoEntrega === "entrega" && (
                <>
              <div>
                <label className="mb-1 block font-medium">Endereço</label>
                <input
                  type="text"
                  placeholder="Rua e número"
                  value={endereco}
                  onChange={(event) => setEndereco(event.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">Bairro</label>
                <select
                  value={bairro}
                  onChange={(event) => selecionarBairro(event.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-black outline-none focus:border-red-500"
                >
                  <option value="">Selecione seu bairro</option>
                  <option value="Guajuviras">Guajuviras — R$ 5,00</option>
                  <option value="Mato Grande">Mato Grande — R$ 7,00</option>
                  <option value="Olaria">Olaria — R$ 6,00</option>
                  <option value="Niterói">Niterói — R$ 8,00</option>
                  <option value="Centro">Centro — R$ 4,00</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium">Complemento</label>
                <input
                  type="text"
                  placeholder="Apto, bloco, referência..."
                  value={complemento}
                  onChange={(event) => setComplemento(event.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>
                </>
              )}

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-medium text-zinc-900">
                  🛵 Tempo estimado de entrega
                </p>
                <p className="mt-1 text-sm text-zinc-500">{tempoEntrega}</p>
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Observações do pedido
                </label>
                <textarea
                  placeholder="Ex: sem tomate, sem cebola..."
                  value={observacao}
                  onChange={(event) => setObservacao(event.target.value)}
                  maxLength={300}
                  className="min-h-24 w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
                <p className="mt-1 text-right text-xs text-zinc-500">
                  {observacao.length}/300
                </p>
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Forma de pagamento
                </label>
                <select
                  value={pagamento}
                  onChange={(event) => setPagamento(event.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão na entrega">Cartão na entrega</option>
                </select>
              </div>

              {pagamento === "Dinheiro" && (
                <div>
                  <label className="mb-1 block font-medium">Troco para quanto?</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex: 100,00"
                    value={trocoPara}
                    onChange={(event) => setTrocoPara(event.target.value)}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <h3 className="text-lg font-bold text-zinc-900">
                  Resumo do pedido
                </h3>

                <div className="mt-4 space-y-3">
                  {carrinho.map((produto) => (
                    <div
                      key={produto.nome}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="text-zinc-700">
                        {produto.quantidade}x {produto.nome}
                      </span>
                      <span className="font-medium text-zinc-900">
                        R$ {(produto.preco * produto.quantidade)
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="my-4 border-t border-zinc-200" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span>R$ {valorTotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Taxa de entrega</span>
                    <span>R$ {taxaAplicada.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-zinc-900">
                    <span>Total</span>
                    <span>
                      R$ {totalComEntrega.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={confirmarPedido}
                className="w-full rounded-xl bg-red-600 py-3 font-bold text-white"
              >
                Confirmar pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {pedidoConfirmado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-black">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Pedido confirmado</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Pedido #{numeroPedido}
                </p>
              </div>

              <button
                onClick={() => setPedidoConfirmado(false)}
                className="text-2xl"
                aria-label="Fechar confirmação"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <p><strong>Nome:</strong> {nome}</p>
              <p><strong>Telefone:</strong> {telefone}</p>
              <p>
                <strong>Tipo:</strong>{" "}
                {tipoEntrega === "entrega" ? "Entrega" : "Retirada no local"}
              </p>
              {tipoEntrega === "entrega" && (
                <>
                  <p><strong>Endereço:</strong> {endereco}</p>
                  <p><strong>Complemento:</strong> {complemento.trim() || "Nenhum"}</p>
                  <p><strong>Bairro:</strong> {bairro}</p>
                </>
              )}
              <p><strong>Pagamento:</strong> {pagamento}</p>
              {pagamento === "Dinheiro" && (
                <p><strong>Troco para:</strong> {trocoPara.trim() || "Não informado"}</p>
              )}
              <p><strong>Tempo estimado:</strong> {tempoEntrega}</p>
              <p>
                <strong>Observações:</strong>{" "}
                {observacao.trim() || "Nenhuma"}
              </p>
            </div>

            <div className="mt-6 border-t border-zinc-200 pt-4">
              <h3 className="font-bold">Itens</h3>
              <div className="mt-3 space-y-2">
                {carrinho.map((produto) => (
                  <div key={produto.nome} className="flex justify-between gap-4">
                    <span>
                      {produto.quantidade}x {produto.nome}
                    </span>
                    <span>
                      R$ {(produto.preco * produto.quantidade)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-zinc-200 pt-4">
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Subtotal</span>
                <span>R$ {valorTotal.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Taxa de entrega</span>
                <span>R$ {taxaAplicada.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>R$ {totalComEntrega.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            <button
              onClick={enviarWhatsApp}
              className="mt-6 w-full rounded-xl bg-green-600 py-3 font-bold text-white"
            >
              Enviar pedido pelo WhatsApp
            </button>
          </div>
        </div>
      )}
      <a
  href="https://wa.me/5551994154447"
  target="_blank"
  rel="noopener noreferrer"
  className={`fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl shadow-xl transition hover:scale-110 hover:bg-green-500 ${
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
        <h3 className="text-xl font-black text-zinc-900">
          Delivery Yeshua
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          Seu lanche favorito, direto até você.
        </p>
      </div>

      <div>
        <h4 className="font-bold text-zinc-900">
          Horário
        </h4>

        <p className="mt-2 text-sm text-zinc-500">
          Todos os dias
        </p>

        <p className="text-sm text-zinc-500">
          19:00 às 01:00
        </p>
      </div>

      <div>
        <h4 className="font-bold text-zinc-900">
          Formas de pagamento
        </h4>

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
