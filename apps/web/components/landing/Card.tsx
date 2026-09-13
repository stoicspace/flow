import { LucideIcon } from "lucide-react";

interface CardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  tone?: "brand" | "success";
}

const iconToneClasses: Record<NonNullable<CardProps["tone"]>, string> = {
  brand: "bg-brand-orange/10 text-brand",
  success: "bg-success/10 text-success",
};

export default function Card({
  icon: Icon,
  title,
  description,
  tone = "brand",
}: CardProps) {
  return (
    <div className="group rounded-3xl border border-border bg-surface p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:border-brand/40 hover:shadow-[0_0_40px_rgba(110,231,183,.15)]">
      {Icon && (
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110 ${iconToneClasses[tone]} text-brand-orange`}
        >
          <Icon size={28} />
        </div>
      )}

      <h3 className="mt-6 sm:mt-8 text-xl sm:text-2xl font-semibold">
        {title}
      </h3>

      {description && (
        <p className="mt-4 text-sm sm:text-base leading-7 text-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
