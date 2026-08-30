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
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl">
      <div className="relative h-52 w-full overflow-hidden bg-zinc-800">
        <Image
          src={imagem}
          alt={nome}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-zinc-900 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-xl font-black leading-tight text-white sm:text-2xl">
          {nome}
        </h2>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
          {descricao}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              A partir de
            </p>

            <span className="text-2xl font-black text-amber-400">
              R$ {preco}
            </span>
          </div>

          <button
            type="button"
            onClick={adicionarAoCarrinho}
            className="flex h-12 items-center gap-2 rounded-full bg-amber-500 px-5 font-black text-black shadow-lg transition hover:bg-amber-400 active:scale-95"
            aria-label={`Adicionar ${nome} ao carrinho`}
          >
            <span className="text-xl">+</span>
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>
      </div>
    </article>
  );
}