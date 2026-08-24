"use client";

import { useState } from "react";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
}

export function UserAvatar({ name, image }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initial = name ? name.trim().charAt(0).toUpperCase() : "U";

  if (image && !imageError) {
    return (
      <img
        src={image}
        alt={name || "User Avatar"}
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
        className="h-9 w-9 rounded-full border border-blue-200 object-cover shadow-2xs"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-2xs">
      {initial}
    </div>
  );
}
