import { useEffect, useState } from "react";
import { getInitials, nameColor } from "@/lib/store";
import { getPhoto } from "@/lib/photoStore";

interface AvatarProps {
  name: string;
  personId?: string;
  size?: "sm" | "md";
}

export function Avatar({ name, personId, size = "md" }: AvatarProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(name);
  const color = nameColor(name);
  const sizeClasses = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";

  useEffect(() => {
    if (!personId) return;
    setSrc(null);
    setImgFailed(false);

    let cancelled = false;
    getPhoto(personId).then((dataUrl) => {
      if (cancelled) return;
      if (dataUrl) {
        setSrc(dataUrl);
      } else {
        // Fall back to server-hosted image
        setSrc(`/images/${personId}.jpg`);
      }
    });
    return () => { cancelled = true; };
  }, [personId]);

  if (personId && src && !imgFailed) {
    return (
      <img
        src={src}
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
