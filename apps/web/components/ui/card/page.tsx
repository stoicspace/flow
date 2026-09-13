import React from "react";
import Link from "next/link";

interface CardProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    status?: {
        label: string;
        color: "success" | "warning" | "error";
    };
    footer?: React.ReactNode;
    button?: {
        label: string;
        color: "success" | "warning" | "error";
        icon?: React.ReactNode;
        onClick?: () => void;
    };
    variant?: "default" | "create";
    onClick?: () => void;
    href?: string; // ← add this
    // AI score/complexity/review-status badges — optional so existing
    // callers without AI data render exactly as before.
    aiBadges?: {
        complexity?: "low" | "medium" | "high";
        reviewStatus?: string;
        summary?: string;
    };
}

const statusDotClasses = {
    success: "bg-status-success",
    warning: "bg-status-warning",
    error: "bg-status-error",
};

const statusLabelClasses = {
    success: "text-status-success",
    warning: "text-status-warning",
    error: "text-status-error",
};

const buttonBgClasses = {
    success: "bg-status-success",
    warning: "bg-status-warning",
    error: "bg-status-error",
};

const complexityBadgeClasses: Record<string, string> = {
    low: "text-status-success border-status-success/30 bg-status-success/10",
    medium: "text-status-warning border-status-warning/30 bg-status-warning/10",
    high: "text-status-error border-status-error/30 bg-status-error/10",
};

export default function Card({
    title,
    description,
    icon,
    status,
    footer,
    button,
    variant = "default",
    onClick,
    href,
    aiBadges,
}: CardProps) {
    if (variant === "create") {
        return (
            <Link href={href || "/workflows"}>
                <div className="m-5 flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-transparent cursor-pointer hover:bg-surface-2 transition-colors min-h-[200px]">
                    <div className="flex flex-col items-center gap-3 text-inactive">
                        <span className="text-4xl font-light leading-none">⊕</span>
                        <span className="text-sm font-medium">Import New</span>
                    </div>
                </div>
            </Link>
        );
    }

    const cardContent = (
        <div className="m-5 flex flex-col rounded-lg border border-border bg-surface-2 p-6 shadow-xs transition-colors hover:bg-surface-3 cursor-pointer">
            {status && (
                <div className="mb-4 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusDotClasses[status.color]}`} />
                    <span className={`text-xs font-semibold tracking-widest uppercase ${statusLabelClasses[status.color]}`}>
                        {status.label}
                    </span>
                </div>
            )}

            {icon && <div className="mb-4">{icon}</div>}

            {title && (
                <h2 className="mb-1 text-xl font-semibold text-text-primary">{title}</h2>
            )}

            {description && (
                <p className="text-sm text-inactive">{description}</p>
            )}

            {aiBadges && (aiBadges.complexity || aiBadges.reviewStatus) && (
                <div className="flex items-center gap-1.5 mt-2">
                    {aiBadges.complexity && (
                        <span className={`text-[10px] font-medium uppercase border rounded-full px-2 py-0.5 ${complexityBadgeClasses[aiBadges.complexity]}`}>
                            {aiBadges.complexity}
                        </span>
                    )}
                    {aiBadges.reviewStatus && (
                        <span className="text-[10px] font-medium text-brand-orange border border-brand-orange/25 bg-brand-orange/10 rounded-full px-2 py-0.5">
                            {aiBadges.reviewStatus}
                        </span>
                    )}
                </div>
            )}
            {aiBadges?.summary && (
                <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{aiBadges.summary}</p>
            )}

            <div className="flex-1" />

            {footer && (
                <div className="mt-5 flex items-center gap-2 text-inactive">
                    <span className="text-sm">{footer}</span>
                </div>
            )}

            {button && (
                <button
                    onClick={e => {
                        e.preventDefault(); // stop Link from firing when button clicked
                        e.stopPropagation();
                        button.onClick?.();
                    }}
                    className={`mt-5 w-full flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-text-primary transition hover:opacity-90 ${buttonBgClasses[button.color]}`}
                >
                    {button.icon && <span>{button.icon}</span>}
                    {button.label}
                </button>
            )}
        </div>
    );

    // Wrap with Link only if href provided
    if (href) {
        return <Link href={href}>{cardContent}</Link>;
    }

    return <div onClick={onClick}>{cardContent}</div>;
}