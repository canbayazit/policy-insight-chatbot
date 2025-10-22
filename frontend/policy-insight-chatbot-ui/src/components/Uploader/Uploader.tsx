import React from "react";

const Uploader: React.FC = () => {
  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col items-center justify-center text-center py-10 min-h-[60vh] gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[oklch(85%_0.02_255)]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-4xl">
              smart_toy
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Merhaba, Ben Policy Insight Asistanı
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Poliçenizi analiz etmeye hazırım. Başlamak için PDF dosyanızı
              yükleyin.
            </p>
          </div>
        </div>

        <div className="w-full max-w-lg">
          <label
            className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed
                       border-gray-300 dark:border-gray-600 px-6 py-12 transition-all
                       hover:border-[var(--color-accent)]
                       hover:bg-[color-mix(in_oklab,_var(--color-accent)_/10%,_transparent)]
                       hover:shadow-md hover:scale-[1.01] cursor-pointer select-none"
          >
            <span
              className="material-symbols-outlined text-5xl text-gray-400 transition-colors
                             group-hover:text-[var(--color-accent)]"
            >
              cloud_upload
            </span>
            <span
              className="text-gray-700 dark:text-white font-semibold transition-colors
                          group-hover:text-[var(--color-accent)]"
            >
              Poliçe PDF'inizi buraya sürükleyip bırakın
            </span>
            <p className="text-gray-500 dark:text-gray-400 text-sm">veya</p>
            <span
              className="px-6 py-2.5 rounded-lg font-bold text-sm shadow-soft transition-all
                         bg-[var(--color-accent)] text-white hover:opacity-90 focus:outline-none
                         focus:ring-2 focus:ring-[var(--color-accent)]/40"
            >
              Dosya Seç
            </span>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              // accept="application/pdf"  // istersen sadece PDF
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Uploader;
