// src/components/ui/data/Avatar.tsx
"use client";
export function Avatar({
  src,
  alt,
  size = "sm",
}: {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const s =
    size === "xs"
      ? "w-8"
      : size === "sm"
      ? "w-10"
      : size === "lg"
      ? "w-16"
      : "w-12";
  return (
    <div className="avatar">
      <div className={`${s} rounded-full`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
      </div>
    </div>
  );
}
