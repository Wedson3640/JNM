import Image from "next/image";

export function LeafDecoration() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-[105px] opacity-[0.45] sm:w-[150px] xl:w-[195px]"
      aria-hidden="true"
    >
      <Image
        src="/images/arvore_efeito.png"
        alt=""
        fill
        sizes="(min-width: 1280px) 195px, (min-width: 640px) 150px, 105px"
        className="object-contain object-right"
        priority
      />
    </div>
  );
}
