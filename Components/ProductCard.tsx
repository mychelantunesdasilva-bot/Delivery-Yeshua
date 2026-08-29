import Image from "next/image";

type ProductCardProps = {
  nome: string;
  descricao: string;
  preco: string;
  imagem: string;
  adicionarAoCarrinho: () => void;
};

export default function ProductCard({
  nome,
  descricao,
  preco,
  imagem,
  adicionarAoCarrinho,
}: ProductCardProps) {
  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">

      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl bg-zinc-800">
        <Image
          src={imagem}
          alt={nome}
          fill
          className="object-cover"
        />
      </div>

      <h2 className="text-2xl font-bold text-white">
        {nome}
      </h2>

      <p className="mt-2 text-zinc-400">
        {descricao}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xl font-bold text-amber-400">
          R$ {preco}
        </span>

        <button
          onClick={adicionarAoCarrinho}
          className="rounded-full bg-amber-500 px-5 py-2 font-bold text-black transition hover:bg-amber-400"
        >
          Adicionar
        </button>
      </div>

    </div>
  );
}