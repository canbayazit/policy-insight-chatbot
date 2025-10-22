// src/components/Sidebar.tsx
import React from "react";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-72 shrink-0 bg-white dark:bg-gray-800 border-r border-[var(--color-border)] h-full overflow-y-auto">
      <div className="p-4">
        <button
          type="button"
          className="flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-bold text-sm hover:opacity-90 transition-colors shadow-soft focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
          aria-label="Yeni analiz başlat"
        >
          <span className="material-symbols-outlined">add</span>
          Yeni Analiz Başlat
        </button>

        <nav className="mt-6" aria-label="Son analizler">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
            Recent Analyses
          </h2>
          <ul className="mt-2 space-y-1">
            {["kasko_police_2023.pdf", "hayat_sigortasi.pdf", "ev_konut_police.pdf"].map(
              (n, i) => (
                <li key={n}>
                  <a
                    className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 ${
                      i === 0 ? "bg-gray-100 dark:bg-gray-700" : ""
                    }`}
                    href="#"
                  >
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-base">
                      description
                    </span>
                    <span className="truncate">{n}</span>
                  </a>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
