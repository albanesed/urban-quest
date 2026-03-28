"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/games", label: "Giochi", icon: "🎮" },
  { href: "/sessions", label: "Sessioni", icon: "👥" },
  { href: "/settings", label: "Impostazioni", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 min-h-screen p-4 flex flex-col">
      <h1 className="text-lg font-bold mb-8 px-2">Urban Quest</h1>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                active
                  ? "bg-indigo-600/20 text-indigo-300"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
