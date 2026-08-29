"use client";

import { useState } from "react";
import Header from "@/Components/Header";
import ProductCard from "@/Components/ProductCard";

type Produto = {
  nome: string;
  preco: number;
  quantidade: number;

};

const produtos = [
  // LANCHES
  {
    nome: "Batata Frita Pequena",
    descricao: "Batata frita crocante e sequinha, feita na hora!",
    preco: 29.99,
    categoria: "Porções",
    imagem: "/produtos/batata-pequena.jpg",
  },
  {
    nome: "Batata Frita Grande",
    descricao: "Batata frita crocante e sequinha, feita na hora!",
    preco: 56.99,
    categoria: "Porções",
    imagem: "/produtos/batata-grande.jpg",
  },
  {
    nome: "Batata Frita Média",
    descricao: "Batata frita crocante e sequinha, feita na hora!",
    preco: 39.99,
    categoria: "Porções",
    imagem: "/produtos/batata-media.jpg",
  },
  {
    nome: "X Calabresa",
    descricao: "Pão macio, calabresa bem temperada, queijo derretido, tomate e alface.",
    preco: 24.99,
    categoria: "Lanches",
    imagem: "/produtos/x-calabresa.jpg",
  },
  {
    nome: "X Frango",
    descricao: "Frango bem temperado, queijo derretido, tomate, alface e molho especial.",
    preco: 24.99,
    categoria: "Lanches",
    imagem: "/produtos/x-frango.jpg",
  },
  {
    nome: "Maionese Caseira",
    descricao: "Maionese caseira da casa.",
    preco: 5,
    categoria: "Lanches",
    imagem: "/produtos/maionese.jpg",
  },
  {
    nome: "X Intreveiro",
    descricao: "Hambúrguer suculento, queijo derretido e muito sabor.",
    preco: 35.99,
    categoria: "Lanches",
    imagem: "/produtos/x-intreveiro.jpg",
  },
  {
    nome: "X Bacon",
    descricao: "Hambúrguer suculento, queijo derretido e muito bacon.",
    preco: 29.99,
    categoria: "Lanches",
    imagem: "/produtos/x-bacon.jpg",
  },
  {
    nome: "X Coração",
    descricao: "Lanche de coração de frango cheio de sabor.",
    preco: 29.99,
    categoria: "Lanches",
    imagem: "/produtos/x-coracao.jpg",
  },
  {
    nome: "X Tudo",
    descricao: "O lanche que mata a fome de verdade!",
    preco: 39.99,
    categoria: "Lanches",
    imagem: "/produtos/x-tudo.jpg",
  },
  {
    nome: "X Vegetariano",
    descricao: "Leve no nome, mas cheio de sabor.",
    preco: 20.99,
    categoria: "Lanches",
    imagem: "/produtos/x-vegetariano.jpg",
  },
  {
    nome: "X Acebolado",
    descricao: "Hambúrguer suculento, queijo derretido e muita cebola.",
    preco: 23.99,
    categoria: "Lanches",
    imagem: "/produtos/x-acebolado.jpg",
  },
  {
    nome: "Combo Solteiro",
    descricao: "X-Salada acompanhado de bebida.",
    preco: 46.99,
    categoria: "Combos",
    imagem: "/produtos/combo-solteiro.jpg",
  },
  {
    nome: "Combo Casal",
    descricao: "Combo perfeito para compartilhar.",
    preco: 69.99,
    categoria: "Combos",
    imagem: "/produtos/combo-casal.jpg",
  },
  {
    nome: "Combo Casal - 2 X-Salada",
    descricao: "Dois X-Saladas acompanhados de porção e bebida.",
    preco: 69.99,
    categoria: "Combos",
    imagem: "/produtos/combo-casal-salada.jpg",
  },
  {
    nome: "Combo Triângulo Delicioso",
    descricao: "3 burgers, bebida e porção.",
    preco: 89.99,
    categoria: "Combos",
    imagem: "/produtos/combo-triangulo.jpg",
  },
  {
    nome: "Xis Salada",
    descricao: "Xis com maionese, alface, milho, ervilha e tomate.",
    preco: 21.99,
    categoria: "Lanches",
    imagem: "/produtos/x-salada.jpg",
  },

  // BEBIDAS
  {
    nome: "Coca-Cola 2L",
    descricao: "Garrafa 2 litros.",
    preco: 15,
    categoria: "Bebidas",
    imagem: "/produtos/coca-2l.jpg",
  },
  {
    nome: "Coca-Cola 350ml",
    descricao: "Lata 350ml.",
    preco: 7,
    categoria: "Bebidas",
    imagem: "/produtos/coca-350.jpg",
  },
  {
    nome: "Pepsi 350ml",
    descricao: "Lata 350ml.",
    preco: 7,
    categoria: "Bebidas",
    imagem: "/produtos/pepsi-350.jpg",
  },
  {
    nome: "Guaraná Antarctica 350ml",
    descricao: "Lata 350ml.",
    preco: 7,
    categoria: "Bebidas",
    imagem: "/produtos/guarana-350.jpg",
  },
  {
    nome: "Pepsi Black 350ml",
    descricao: "Lata 350ml.",
    preco: 7,
    categoria: "Bebidas",
    imagem: "/produtos/pepsi-black.jpg",
  },
  {
    nome: "Charrua Guaraná 2L",
    descricao: "Garrafa 2 litros.",
    preco: 14,
    categoria: "Bebidas",
    imagem: "/produtos/charrua-2l.jpg",
  },
  {
    nome: "Pepsi 2 Litros",
    descricao: "Garrafa 2 litros.",
    preco: 14,
    categoria: "Bebidas",
    imagem: "/produtos/pepsi-2l.jpg",
  },
  {
    nome: "Sprite Original 2L",
    descricao: "Garrafa 2 litros.",
    preco: 14,
    categoria: "Bebidas",
    imagem: "/produtos/sprite-2l.jpg",
  },

  // ALA-MINUTAS
  {
    nome: "Ala-Minuta de Filé de Frango Grelhado na Chapa",
    descricao: "Filé de frango suculento e bem grelhado na chapa.",
    preco: 26.99,
    categoria: "Ala-Minutas",
    imagem: "/produtos/ala-frango-grelhado.jpg",
  },
  {
    nome: "Ala-Minuta de Bife Bovino Acebolado",
    descricao: "Bife bovino macio e saboroso acompanhado de cebola.",
    preco: 32.99,
    categoria: "Ala-Minutas",
    imagem: "/produtos/ala-bife-acebolado.jpg",
  },
  {
    nome: "Ala-Minuta de Bife Bovino Crocante à Milanesa",
    descricao: "Bife empanado e frito até ficar dourado e crocante.",
    preco: 32.99,
    categoria: "Ala-Minutas",
    imagem: "/produtos/ala-bife-milanesa.jpg",
  },
  {
    nome: "Ala-Minuta de Bife Bovino Grelhado na Chapa",
    descricao: "Bife bovino grelhado na chapa, macio e suculento.",
    preco: 28.99,
    categoria: "Ala-Minutas",
    imagem: "/produtos/ala-bife-grelhado.jpg",
  },
  {
    nome: "Ala-Minuta de Filé de Frango Acebolado",
    descricao: "Filé de frango grelhado coberto com cebola.",
    preco: 30.99,
    categoria: "Ala-Minutas",
    imagem: "/produtos/ala-frango-acebolado.jpg",
  },
  {
    nome: "Ala-Minuta de Filé de Frango Crocante à Milanesa",
    descricao: "Filé de frango empanado com casquinha dourada e crocante.",
    preco: 30.99,
    categoria: "Ala-Minutas",
    imagem: "/produtos/ala-frango-milanesa.jpg",
  },
  {
    nome: "Ala-Minuta de Bife Bovino à Parmegiana",
    descricao: "Bife empanado coberto com molho e queijo.",
    preco: 34.99,
    categoria: "Ala-Minutas",
    imagem: "/produtos/ala-bife-parmegiana.jpg",
  },
  {
    nome: "Ala-Minuta de Filé de Frango à Parmegiana",
    descricao: "Filé de frango empanado coberto com molho e queijo.",
    preco: 34.99,
    categoria: "Ala-Minutas",
    imagem: "/produtos/ala-frango-parmegiana.jpg",
  },
];

export default function Home() {
  const [carrinho, setCarrinho] = useState<Produto[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  const [nome, setNome] = useState("");
const [telefone, setTelefone] = useState("");
const [endereco, setEndereco] = useState("");
const [pagamento, setPagamento] = useState("Pix");
const [numeroPedido, setNumeroPedido] = useState("");
const [observacao, setObservacao] = useState("");

  function adicionarAoCarrinho(nome: string, preco: number) {
    const produtoExistente = carrinho.find(
      (produto) => produto.nome === nome
    );

    if (produtoExistente) {
      const novoCarrinho = carrinho.map((produto) =>
        produto.nome === nome
          ? { ...produto, quantidade: produto.quantidade + 1 }
          : produto
      );

      setCarrinho(novoCarrinho);
    } else {
      const novoProduto = {
        nome,
        preco,
        quantidade: 1,
      };

      setCarrinho([...carrinho, novoProduto]);
    }
  }

  function diminuirQuantidade(nome: string) {
    const novoCarrinho = carrinho
      .map((produto) =>
        produto.nome === nome
          ? { ...produto, quantidade: produto.quantidade - 1 }
          : produto
      )
      .filter((produto) => produto.quantidade > 0);

    setCarrinho(novoCarrinho);
  }

  function removerProduto(nome: string) {
    const novoCarrinho = carrinho.filter(
      (produto) => produto.nome !== nome
    );

    setCarrinho(novoCarrinho);
  }

  const quantidadeTotal = carrinho.reduce(
    (total, produto) => total + produto.quantidade,
    0
  );

  const valorTotal = carrinho.reduce(
    (total, produto) =>
      total + produto.preco * produto.quantidade,
    0
  );

  function confirmarPedido() {
  if (!nome || !telefone || !endereco) {
    alert("Preencha nome, telefone e endereço.");
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

  const mensagem = `
Pedido #${numeroPedido}

Cliente: ${nome}
Telefone: ${telefone}
Endereço: ${endereco}
Pagamento: ${pagamento}

Itens:
${itens}

Observações: ${observacao.trim() || "Nenhuma"}

Total: R$ ${valorTotal.toFixed(2).replace(".", ",")}
`;

  const telefoneLoja = "5551994154447";

  const link = `https://wa.me/${telefoneLoja}?text=${encodeURIComponent(
    mensagem
  )}`;

  window.open(link, "_blank");

setCarrinho([]);
setPedidoConfirmado(false);

setNome("");
setTelefone("");
setEndereco("");
setObservacao("");
setPagamento("Pix");

}
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Header
        quantidadeCarrinho={quantidadeTotal}
        abrirCarrinho={() => setCarrinhoAberto(true)}
      />

      <section className="p-8">
        

        <div className="mb-10 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-black shadow-xl">
  <h2 className="text-4xl font-black">
    Delivery Yeshua
  </h2>

  <p className="mt-2 text-lg font-medium">
    Seu lanche favorito, do nosso jeito, direto até você.
  </p>
</div>

        <p className="mt-2 text-lg text-zinc-600">
          O sabor que chega até você.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
  <button
    onClick={() =>
      document.getElementById("Lanches")?.scrollIntoView({
        behavior: "smooth",
      })
    }
    className="rounded-full bg-amber-500 px-5 py-2 font-bold text-black"
  >
    Lanches
  </button>

  <button
    onClick={() =>
      document.getElementById("Combos")?.scrollIntoView({
        behavior: "smooth",
      })
    }
    className="rounded-full bg-white px-5 py-2 text-black"
  >
    Combos
  </button>

  <button
    onClick={() =>
      document.getElementById("Bebidas")?.scrollIntoView({
        behavior: "smooth",
      })
    }
    className="rounded-full bg-white px-5 py-2 text-black"
  >
    Bebidas
  </button>

  <button
    onClick={() =>
      document.getElementById("Porções")?.scrollIntoView({
        behavior: "smooth",
      })
    }
    className="rounded-full bg-white px-5 py-2 text-black"
  >
    Porções
  </button>

  <button
    onClick={() =>
      document.getElementById("Ala-Minutas")?.scrollIntoView({
        behavior: "smooth",
      })
    }
    className="rounded-full bg-white px-5 py-2 text-black"
  >
    Ala-Minutas
  </button>
</div>

        {["Lanches", "Combos", "Porções", "Bebidas", "Ala-Minutas"].map(
  (categoria) => (
    <div
  key={categoria}
  id={categoria}
  className="mt-10 scroll-mt-24"
>
      <h2 className="border-l-4 border-amber-500 pl-3 text-3xl font-black text-white">
  {categoria}
</h2>

      <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {produtos
          .filter((produto) => produto.categoria === categoria)
          .map((produto) => (
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
  )
)}
      </section>

      {carrinhoAberto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black">
                Seu carrinho
              </h2>

              <button
                onClick={() => setCarrinhoAberto(false)}
                className="text-2xl text-black"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {carrinho.map((produto) => (
                <div
                  key={produto.nome}
                  className="border-b border-zinc-200 pb-4 text-black"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {produto.nome}
                      </p>

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
                        onClick={() =>
                          diminuirQuantidade(produto.nome)
                        }
                        className="h-8 w-8 rounded-full bg-zinc-200 font-bold"
                      >
                        -
                      </button>

                      <span className="font-semibold">
                        {produto.quantidade}
                      </span>

                      <button
                        onClick={() =>
                          adicionarAoCarrinho(
                            produto.nome,
                            produto.preco
                          )
                        }
                        className="h-8 w-8 rounded-full bg-black font-bold text-white"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold">
                      R${" "}
                      {(produto.preco * produto.quantidade)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between text-xl font-bold text-black">
              <span>Total</span>

              <span>
                R$ {valorTotal.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <button
  onClick={enviarWhatsApp}
  className="mt-6 w-full rounded-xl bg-green-600 py-3 font-bold text-white"
>
  Enviar pedido pelo WhatsApp
</button>

            <button
  onClick={() => {
    setCarrinhoAberto(false);
    setCheckoutAberto(true);
  }}
  className="mt-6 w-full rounded-xl bg-black py-3 font-bold text-white"
>
  Finalizar pedido
</button>
          </div>
        </div>
      )}
      {checkoutAberto && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-black">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Finalizar pedido
        </h2>

        <button
          onClick={() => setCheckoutAberto(false)}
          className="text-2xl"
        >
          ✕
        </button>
      </div>

      <div className="mt-6 space-y-4">
  <div>
    <label className="mb-1 block font-medium">
      Nome
    </label>

   <input
  type="text"
  placeholder="Digite seu nome"
  value={nome}
  onChange={(event) => setNome(event.target.value)}
  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none"
/>
  </div>

  <div>
    <label className="mb-1 block font-medium">
      Telefone
    </label>

    <input
  type="tel"
  placeholder="(00) 00000-0000"
  value={telefone}
  onChange={(event) => setTelefone(event.target.value)}
  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none"
/>
  </div>

  <div>
    <label className="mb-1 block font-medium">
      Endereço
    </label>

    <input
  type="text"
  placeholder="Rua, número e bairro"
  value={endereco}
  onChange={(event) => setEndereco(event.target.value)}
  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none"
/>
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
    className="min-h-24 w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 outline-none"
  />
</div>

  <div>
    <label className="mb-1 block font-medium">
      Forma de pagamento
    </label>

    <select
  value={pagamento}
  onChange={(event) => setPagamento(event.target.value)}
  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none"
>
  <option value="Pix">Pix</option>
  <option value="Dinheiro">Dinheiro</option>
  <option value="Cartão na entrega">
    Cartão na entrega
  </option>
</select>
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
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-black">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Pedido confirmado
        </h2>
<p className="mt-1 text-sm text-zinc-500">
  Pedido #{numeroPedido}
</p>

        <button
          onClick={() => setPedidoConfirmado(false)}
          className="text-2xl"
        >
          ✕
        </button>
      </div>

      <div className="mt-6 space-y-2">
        <p>
          <strong>Nome:</strong> {nome}
        </p>

        <p>
          <strong>Telefone:</strong> {telefone}
        </p>

        <p>
          <strong>Endereço:</strong> {endereco}
        </p>

        <p>
          <strong>Pagamento:</strong> {pagamento}
        </p>
      </div>

      <div className="mt-6 border-t border-zinc-200 pt-4">
        <h3 className="font-bold">
          Itens
        </h3>

        <div className="mt-3 space-y-2">
          {carrinho.map((produto) => (
            <div
              key={produto.nome}
              className="flex justify-between"
            >
              <span>
                {produto.quantidade}x {produto.nome}
              </span>

              <span>
                R${" "}
                {(produto.preco * produto.quantidade)
                  .toFixed(2)
                  .replace(".", ",")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-between text-xl font-bold">
        <span>Total</span>

        <span>
          R$ {valorTotal.toFixed(2).replace(".", ",")}
        </span>
      </div>
    </div>
  </div>
)}
    </main>
  );
}