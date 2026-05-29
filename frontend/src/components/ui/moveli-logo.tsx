import { useId } from "react";

interface MoveliLogoProps {
  size?: number;
  wordmark?: boolean;
  className?: string;
}

export function MoveliLogo({
  size = 28,
  wordmark = true,
  className,
}: MoveliLogoProps) {
  const gradId = useId();
  return (
    <span
      className={`inline-flex items-center gap-2 ${className ?? ""}`}
    >
      <svg
        width={size * 1.1}
        height={size * 1.1}
        viewBox="0 0 44 44"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="44" y2="44">
            <stop offset="0" stopColor="#9B8EE5" />
            <stop offset="1" stopColor="#7DCEEA" />
          </linearGradient>
        </defs>
        <path
          d="M6 30 C 6 16, 38 16, 38 30"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M26 14 C 26 11, 32 11, 32 14"
          stroke={`url(#${gradId})`}
          strokeWidth="1.6"
          fill="none"
        />
        <rect
          x="23"
          y="14"
          width="12"
          height="14"
          rx="2.5"
          fill={`url(#${gradId})`}
        />
      </svg>
      {wordmark && (
        <span
          className="text-moveli-gradient font-extrabold tracking-tight"
          style={{ fontSize: Math.round(size * 0.92) }}
        >
          MOVELI
        </span>
      )}
    </span>
  );
}
