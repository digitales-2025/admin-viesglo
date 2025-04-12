"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface User {
  id: string;
  name: string;
}

interface AvatarStackProps {
  users: User[];
  limit?: number;
  size?: "sm" | "md" | "lg";
}

// Colores de Tailwind en una secuencia de degradado
const colors = [
  "bg-green-400",
  "bg-emerald-400",
  "bg-teal-400",
  "bg-cyan-400",
  "bg-sky-400",
  "bg-blue-400",
  "bg-indigo-400",
  "bg-violet-400",
  "bg-purple-400",
  "bg-fuchsia-400",
  "bg-pink-400",
  "bg-rose-400",
];

export default function AvatarStack({ users, limit = 5, size = "md" }: AvatarStackProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const visibleUsers = users.slice(0, limit);
  const remainingCount = users.length - limit;

  const sizeClasses = {
    sm: "h-8 w-8 border-2",
    md: "h-10 w-10 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <TooltipProvider>
      <div className="flex items-center">
        <div className="flex -space-x-3 relative">
          {visibleUsers.map((user, index) => {
            const isHovered = hoveredId === user.id;
            const firstLetter = user.name.charAt(0).toUpperCase();

            return (
              <Tooltip key={user.id}>
                <TooltipTrigger asChild>
                  <Avatar
                    className={`${sizeClasses[size]} border-background rounded-full transition-all duration-200 ${
                      isHovered ? "z-10 transform scale-110 shadow-md" : "z-0"
                    }`}
                    onMouseEnter={() => setHoveredId(user.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <AvatarFallback className={`${colors[index % colors.length]} text-white font-medium`}>
                      {firstLetter}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="capitalize">{user.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar
                  className={`${sizeClasses[size]} border-muted rounded-full transition-all duration-200 ${
                    hoveredId === "more" ? "z-10 transform scale-110 shadow-md" : "z-0"
                  }`}
                  onMouseEnter={() => setHoveredId("more")}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                    +{remainingCount}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  {remainingCount} más {remainingCount === 1 ? "elemento" : "elementos"}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
