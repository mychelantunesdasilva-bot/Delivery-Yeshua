"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem: string;
  ativo: boolean;
};

export default function PainelPage() {
  const [carregando, setCarregando] = useState(true);

  const [nomeProduto, setNomeProduto] = useState("");
  const [descricaoProduto, setDescricaoProduto] = useState("");
  const [precoProduto, setPrecoProduto] = useState("");
  const [categoriaProduto, setCategoriaProduto] = useState("");

  const [produtos, setProdutos] = useState<Produto[]>([]);

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
        const lista = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        })) as Produto[];

        setProdutos(lista);
      },
      (error) => {
        console.error("Erro ao carregar produtos:", error);
      }
    );

    return () => cancelar();
  }, []);

  async function sair() {
    await signOut(auth);
    window.location.href = "/admin";
  }

  async function adicionarProduto() {
    if (
      !nomeProduto.trim() ||
      !descricaoProduto.trim() ||
      !precoProduto.trim() ||
      !categoriaProduto.trim()
    ) {
      alert("Preencha todos os campos.");
      return;
    }

    const preco = Number(precoProduto);

    if (Number.isNaN(preco) || preco <= 0) {
      alert("Digite um preço válido.");
      return;
    }

    try {
      await addDoc(collection(db, "produtos"), {
        nome: nomeProduto.trim(),
        descricao: descricaoProduto.trim(),
        preco,
        categoria: categoriaProduto.trim(),
        imagem: "/produtos/DELIVERY.png",
        ativo: true,
      });

      setNomeProduto("");
      setDescricaoProduto("");
      setPrecoProduto("");
      setCategoriaProduto("");

      alert("Produto adicionado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar produto.");
    }
  }

  async function excluirProduto(produto: Produto) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir "${produto.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await deleteDoc(doc(db, "produtos", produto.id));
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir produto.");
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

  async function editarProduto(produto: Produto) {
    const novoNome = window.prompt("Nome do produto:", produto.nome);

    if (novoNome === null) {
      return;
    }

    const novaDescricao = window.prompt(
      "Descrição do produto:",
      produto.descricao
    );

    if (novaDescricao === null) {
      return;
    }

    const novoPrecoTexto = window.prompt(
      "Preço do produto:",
      produto.preco.toString()
    );

    if (novoPrecoTexto === null) {
      return;
    }

    const novaCategoria = window.prompt(
      "Categoria do produto:",
      produto.categoria
    );

    if (novaCategoria === null) {
      return;
    }

    const novoPreco = Number(novoPrecoTexto.replace(",", "."));

    if (
      !novoNome.trim() ||
      !novaDescricao.trim() ||
      !novaCategoria.trim() ||
      Number.isNaN(novoPreco) ||
      novoPreco <= 0
    ) {
      alert("Os dados informados são inválidos.");
      return;
    }

    try {
      await updateDoc(doc(db, "produtos", produto.id), {
        nome: novoNome.trim(),
        descricao: novaDescricao.trim(),
        preco: novoPreco,
        categoria: novaCategoria.trim(),
      });

      alert("Produto atualizado!");
    } catch (error) {
      console.error(error);
      alert("Erro ao editar produto.");
    }
  }

  async function importarCardapioAtual() {
    const confirmar = window.confirm(
      "Importar todo o cardápio atual para o Firestore?"
    );

    if (!confirmar) return;

    const cardapioAtual = [
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

    try {
      const batch = writeBatch(db);

      cardapioAtual.forEach((produto) => {
        const referencia = doc(collection(db, "produtos"));

        batch.set(referencia, {
          ...produto,
          ativo: true,
        });
      });

      await batch.commit();
      alert("Cardápio importado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao importar o cardápio.");
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Verificando login...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">
              Painel Delivery Yeshua
            </h1>

            <p className="mt-2 text-zinc-400">
              Área administrativa.
            </p>
          </div>

          <button
            onClick={sair}
            className="rounded-xl bg-red-600 px-5 py-2 font-bold transition hover:bg-red-500"
          >
            Sair
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold">
            Adicionar produto
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={nomeProduto}
              onChange={(event) => setNomeProduto(event.target.value)}
              placeholder="Nome do produto"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-500"
            />

            <input
              type="text"
              value={categoriaProduto}
              onChange={(event) => setCategoriaProduto(event.target.value)}
              placeholder="Categoria"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-500"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={precoProduto}
              onChange={(event) => setPrecoProduto(event.target.value)}
              placeholder="Preço"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-500"
            />

            <input
              type="text"
              value={descricaoProduto}
              onChange={(event) => setDescricaoProduto(event.target.value)}
              placeholder="Descrição"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={adicionarProduto}
            className="mt-6 rounded-xl bg-amber-500 px-5 py-3 font-bold text-black transition hover:bg-amber-400"
          >
            Adicionar produto
          </button>

          <button
            onClick={importarCardapioAtual}
            className="ml-3 mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-500"
          >
            Importar cardápio atual
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold">
            Produtos cadastrados
          </h2>

          <div className="mt-5 grid gap-4">
            {produtos.length === 0 ? (
              <p className="text-zinc-400">
                Nenhum produto cadastrado.
              </p>
            ) : (
              produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-white">
                          {produto.nome}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            produto.ativo
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {produto.ativo ? "Ativo" : "Desativado"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-zinc-400">
                        {produto.categoria}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {produto.descricao}
                      </p>

                      <p className="mt-3 font-bold text-amber-400">
                        R$ {produto.preco.toFixed(2).replace(".", ",")}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => editarProduto(produto)}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold transition hover:bg-blue-500"
                      >
                        Editar
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}