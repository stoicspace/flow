interface EyebrowProps {
  children: React.ReactNode;
  tone?: "brand" | "success";
}

const toneClasses: Record<NonNullable<EyebrowProps["tone"]>, string> = {
  brand: "border-brand/20 bg-brand-orange/10 text-brand",
  success: "border-success/20 bg-success/10 text-success",
};

export default function Eyebrow({ children, tone = "brand" }: EyebrowProps) {
  return (
    <span
      className={`inline-block rounded-full border px-4 py-2 text-sm sm:text-base font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
