import React from "react";

const Chat: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="max-w-[75%] rounded-lg bg-bot-bubble dark:bg-gray-800 p-4 md:p-6 shadow-card">
            <p className="text-sm dark:text-gray-300">
              Merhaba! Poliçenizle ilgili sorularınızı bekliyorum.
            </p>
          </div>

          <div className="ml-auto max-w-[75%] rounded-lg bg-user-bubble dark:bg-gray-800 p-4 md:p-6">
            <p className="text-sm dark:text-gray-200">Cam hasarı kapsamı nedir?</p>
          </div>

          <div className="max-w-[75%] rounded-lg bg-bot-bubble dark:bg-gray-800 p-4 md:p-6 shadow-card">
            <p className="text-sm dark:text-gray-300">
              Cam hasarı yılda bir defa %100 karşılanır. Detay için bkz. [1], [2].
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] bg-white/90 dark:bg-gray-800/60 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-none">
            {["Teminatlarım neler?", "Muafiyetim ne kadar?", "Poliçe bitiş tarihi?"].map((t) => (
              <button
                key={t}
                className="px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative flex items-end">
            <input
              placeholder="Bir mesaj yazın..."
              className="w-full max-h-[200px] py-3 pl-12 pr-14 rounded-full bg-gray-100 dark:bg-gray-700
                         border border-transparent focus:ring-2 focus:ring-[var(--color-accent)]
                         focus:border-transparent text-[var(--color-text)]
                         placeholder-gray-500 dark:placeholder-gray-400 resize-none overflow-y-auto"
            />            
            <button
              className="absolute right-0 p-3 flex justify-center items-center rounded-full bg-[var(--color-accent)] text-white hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              aria-label="Gönder"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Yanıtlar poliçenizdeki ifadelere dayanır. Kaynak alıntıları mesaj içinde gösterilir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
