import { useState } from "react";
import { getInitials, nameColor } from "@/lib/store";

interface AvatarProps {
  name: string;
  personId?: string;
  size?: "sm" | "md";
}

export function Avatar({ name, personId, size = "md" }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(name);
  const color = nameColor(name);
  const sizeClasses = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";

  if (personId && !imgFailed) {
    return (
      <img
        src={`/images/${personId}.jpg`}
        alt={name}
        onError={() => setImgFailed(true)}
        className={`${sizeClasses} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} ${color} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
}
