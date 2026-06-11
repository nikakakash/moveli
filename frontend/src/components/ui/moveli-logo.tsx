import Image from "next/image";

// Source image is 597x160 (transparent background).
const LOGO_ASPECT = 597 / 160;

interface MoveliLogoProps {
  size?: number;
  className?: string;
}

export function MoveliLogo({ size = 28, className }: MoveliLogoProps) {
  const height = Math.round(size * 1.1);
  return (
    <Image
      src="/images/logo.png"
      alt="Moveli"
      width={Math.round(height * LOGO_ASPECT)}
      height={height}
      priority
      className={`object-contain ${className ?? ""}`}
    />
  );
}
