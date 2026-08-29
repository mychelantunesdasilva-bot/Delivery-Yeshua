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
    <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
      <div className="flex items-center gap-3">
  <Image
    src="/produtos/DELIVERY.png"
    alt="Delivery Yeshua"
    width={75}
    height={75}
    className="rounded-full object-cover"
  />

  <div>
    <h1 className="text-2xl font-bold text-black">
      Delivery Yeshua
    </h1>

    <p className="text-sm text-zinc-500">
      Delivery de lanches
    </p>
  </div>
</div>

      <button
        onClick={abrirCarrinho}
        className="rounded-full bg-black px-5 py-2 font-medium text-white transition hover:bg-zinc-800"
      >
        🛒 Carrinho ({quantidadeCarrinho})
      </button>
    </header>
  );
}