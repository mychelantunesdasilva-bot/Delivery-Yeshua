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
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src="/produtos/DELIVERY.png"
            alt="Delivery Yeshua"
            width={48}
            height={48}
            priority
            className="h-11 w-11 shrink-0 rounded-xl object-cover"
          />

          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500">Entregar em</p>
            <p className="truncate text-sm font-bold text-zinc-900 sm:text-base">
              Escolha seu bairro
              <span className="ml-1 text-red-600">⌄</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={abrirCarrinho}
          className="relative flex h-11 shrink-0 items-center gap-2 rounded-xl px-3 font-bold text-red-600 transition hover:bg-red-50 sm:px-4"
          aria-label={`Abrir carrinho com ${quantidadeCarrinho} itens`}
        >
          <span className="text-xl" aria-hidden="true">🛒</span>
          <span className="hidden sm:inline">Carrinho</span>

          {quantidadeCarrinho > 0 && (
            <span className="flex min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-black text-white">
              {quantidadeCarrinho > 99 ? "99+" : quantidadeCarrinho}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
