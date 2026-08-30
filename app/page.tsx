"use client";

import { useEffect, useState } from "react";
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
  .filter((produto) => produto.ativo !== false);

        setProdutos(lista);
      },
      (error) => {
        console.error("Erro ao carregar o cardápio:", error);
      }
    );

    return () => cancelar();
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

  const produtosFiltrados = produtos.filter((produto) =>
    `${produto.nome} ${produto.descricao}`
      .toLowerCase()
      .includes(busca.trim().toLowerCase())
  );

  const produtosDestaque = produtos.filter((produto) =>
    ["Xis Salada", "X Frango", "X Calabresa"].includes(produto.nome)
  );

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

  const totalComEntrega = valorTotal + taxaEntrega;
  const tempoEntrega = "40–60 minutos";

  function confirmarPedido() {
    if (!nome.trim() || !telefone.trim() || !endereco.trim() || !bairro) {
      alert("Preencha nome, telefone, endereço e bairro.");
      return;
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
Endereço: ${endereco}
Bairro: ${bairro}
Tempo estimado: ${tempoEntrega}
Pagamento: ${pagamento}

Itens:
${itens}

Observações: ${observacao.trim() || "Nenhuma"}

Subtotal: R$ ${valorTotal.toFixed(2).replace(".", ",")}
Taxa de entrega: R$ ${taxaEntrega.toFixed(2).replace(".", ",")}
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
    setBairro("");
    setTaxaEntrega(0);
    setObservacao("");
    setPagamento("Pix");
    setNumeroPedido("");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Header
        quantidadeCarrinho={quantidadeTotal}
        abrirCarrinho={() => setCarrinhoAberto(true)}
      />

      <section className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-black shadow-xl sm:p-8">
          <h2 className="text-4xl font-black">Delivery Yeshua</h2>
          <p className="mt-2 text-lg font-medium">
            Seu lanche favorito, do nosso jeito, direto até você.
          </p>
        </div>

        <div
          className={`mt-4 rounded-2xl border p-4 ${
            lojaAberta
              ? "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                lojaAberta ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <div>
              <p
                className={`font-bold ${
                  lojaAberta ? "text-green-400" : "text-red-400"
                }`}
              >
                {lojaAberta ? "Aberto agora" : "Fechado agora"}
              </p>
              <p className="text-sm text-zinc-400">
                Todos os dias • 19:00 às 01:00
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-lg text-zinc-400">
          O sabor que chega até você.
        </p>

        <div className="mt-6">
          <input
            type="text"
            placeholder="🔎 Buscar no cardápio..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-amber-500"
          />
        </div>

        {!busca.trim() && (
          <div className="mt-10">
            <h2 className="border-l-4 border-amber-500 pl-3 text-3xl font-black text-white">
              ⭐ Mais pedidos
            </h2>

            <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-8 flex flex-wrap gap-3">
          {categorias.map((categoria, index) => (
            <button
              key={categoria}
              onClick={() =>
                document.getElementById(categoria)?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className={`rounded-full px-5 py-2 font-bold ${
                index === 0
                  ? "bg-amber-500 text-black"
                  : "bg-white text-black"
              }`}
            >
              {categoria}
            </button>
          ))}
        </div>

        {produtosFiltrados.length === 0 && (
          <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center text-zinc-400">
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
              className="mt-10 scroll-mt-24"
            >
              <h2 className="border-l-4 border-amber-500 pl-3 text-3xl font-black text-white">
                {categoria}
              </h2>

              <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                            className="h-8 w-8 rounded-full bg-black font-bold text-white"
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
                  className="mt-6 w-full rounded-xl bg-black py-3 font-bold text-white"
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
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">Telefone</label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(event) => setTelefone(event.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">Endereço</label>
                <input
                  type="text"
                  placeholder="Rua e número"
                  value={endereco}
                  onChange={(event) => setEndereco(event.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">Bairro</label>
                <select
                  value={bairro}
                  onChange={(event) => selecionarBairro(event.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-black outline-none focus:border-amber-500"
                >
                  <option value="">Selecione seu bairro</option>
                  <option value="Guajuviras">Guajuviras — R$ 5,00</option>
                  <option value="Mato Grande">Mato Grande — R$ 7,00</option>
                  <option value="Olaria">Olaria — R$ 6,00</option>
                  <option value="Niterói">Niterói — R$ 8,00</option>
                  <option value="Centro">Centro — R$ 4,00</option>
                </select>
              </div>

              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
                <p className="font-medium text-white">
                  🛵 Tempo estimado de entrega
                </p>
                <p className="mt-1 text-sm text-zinc-400">{tempoEntrega}</p>
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
                  className="min-h-24 w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-amber-500"
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
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-amber-500"
                >
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão na entrega">Cartão na entrega</option>
                </select>
              </div>

              <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
                <h3 className="text-lg font-bold text-white">
                  Resumo do pedido
                </h3>

                <div className="mt-4 space-y-3">
                  {carrinho.map((produto) => (
                    <div
                      key={produto.nome}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="text-zinc-300">
                        {produto.quantidade}x {produto.nome}
                      </span>
                      <span className="font-medium text-white">
                        R$ {(produto.preco * produto.quantidade)
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="my-4 border-t border-zinc-700" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>R$ {valorTotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Taxa de entrega</span>
                    <span>R$ {taxaEntrega.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total</span>
                    <span>
                      R$ {totalComEntrega.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={confirmarPedido}
                className="w-full rounded-xl bg-black py-3 font-bold text-white"
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
              <p><strong>Endereço:</strong> {endereco}</p>
              <p><strong>Bairro:</strong> {bairro}</p>
              <p><strong>Pagamento:</strong> {pagamento}</p>
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
                <span>R$ {taxaEntrega.toFixed(2).replace(".", ",")}</span>
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
  className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl shadow-xl transition hover:scale-110 hover:bg-green-500"
  aria-label="Falar com a Delivery Yeshua pelo WhatsApp"
  title="Fale conosco pelo WhatsApp"
>
  💬
</a>
      <footer className="mt-16 border-t border-zinc-800 bg-zinc-950 px-6 py-10">
  <div className="mx-auto max-w-6xl">
    <div className="grid gap-8 md:grid-cols-3">

      <div>
        <h3 className="text-xl font-black text-white">
          Delivery Yeshua
        </h3>

        <p className="mt-2 text-sm text-zinc-400">
          Seu lanche favorito, direto até você.
        </p>
      </div>

      <div>
        <h4 className="font-bold text-white">
          Horário
        </h4>

        <p className="mt-2 text-sm text-zinc-400">
          Todos os dias
        </p>

        <p className="text-sm text-zinc-400">
          19:00 às 01:00
        </p>
      </div>

      <div>
        <h4 className="font-bold text-white">
          Formas de pagamento
        </h4>

        <p className="mt-2 text-sm text-zinc-400">
          Pix • Dinheiro • Cartão na entrega
        </p>
      </div>

    </div>

    <div className="mt-8 border-t border-zinc-800 pt-6 text-center text-sm text-zinc-500">
      © 2026 Delivery Yeshua. Todos os direitos reservados.
    </div>
  </div>
</footer>
    </main>
  );
}
