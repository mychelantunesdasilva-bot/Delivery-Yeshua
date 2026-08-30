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
    <article className="group flex min-h-[154px] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="flex min-w-0 flex-1 flex-col pr-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 sm:text-lg">
          {nome}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-500">
          {descricao}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-xs text-zinc-500">a partir de</p>
            <p className="text-lg font-extrabold text-zinc-900">
              R$ {preco}
            </p>
          </div>

          <button
            type="button"
            onClick={adicionarAoCarrinho}
            className="flex h-10 min-w-10 items-center justify-center rounded-full border border-red-200 bg-white px-3 font-black text-red-600 transition hover:bg-red-50 active:scale-95"
            aria-label={`Adicionar ${nome} ao carrinho`}
          >
            +
          </button>
        </div>
      </div>

      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-32 sm:w-32">
        <Image
          src={imagem}
          alt={nome}
          fill
          sizes="(max-width: 640px) 112px, 128px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
    </article>
  );
}
