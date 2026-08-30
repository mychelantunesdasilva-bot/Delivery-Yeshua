import Image from "next/image";

type HeaderProps = {
  quantidadeCarrinho: number;
  abrirCarrinho: () => void;
};

export default function Header({
  quantidadeCarrinho,
  abrirCarrinho,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src="/produtos/DELIVERY.png"
            alt="Logo da Delivery Yeshua"
            width={60}
            height={60}
            priority
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-amber-500 sm:h-14 sm:w-14"
          />

          <div className="min-w-0">
            <h1 className="truncate text-lg font-black text-white sm:text-2xl">
              Delivery Yeshua
            </h1>

            <p className="hidden text-sm text-zinc-400 sm:block">
              Seu lanche favorito, direto até você
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={abrirCarrinho}
          className="relative flex shrink-0 items-center gap-2 rounded-full bg-amber-500 px-4 py-3 font-bold text-black shadow-lg transition hover:bg-amber-400 active:scale-95 sm:px-5"
          aria-label={`Abrir carrinho com ${quantidadeCarrinho} itens`}
        >
          <span className="text-xl" aria-hidden="true">
            🛒
          </span>

          <span className="hidden sm:inline">Carrinho</span>

          {quantidadeCarrinho > 0 && (
            <span className="flex min-w-6 items-center justify-center rounded-full bg-black px-1.5 py-0.5 text-xs font-black text-white">
              {quantidadeCarrinho > 99 ? "99+" : quantidadeCarrinho}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}