import React, { useRef, useState, type FormEvent } from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import axios from "axios";
import type { ChatItem } from "../../global/interfaces/Chat";

const Chat: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const generateBotResponse = async (history: ChatItem[]) => {
    // Gemini payload’ına çevirme
    const contents = history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    try {
      const response = await axios.post(
        import.meta.env.VITE_GOOGLE_API_URL,
        {contents }
      );

      const botText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

      return botText;
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
     e.preventDefault();
    const el = inputRef.current;
    if (!el) return;

    const userMessage = el.value.trim();
    if (!userMessage) return;

    // Kullanıcı mesajını önce state'e ekle
    const newHistory = [...chatHistory, { role: "user" as const, text: userMessage }];
    setChatHistory(newHistory);
    el.value = "";

    // düşünme aşaması
    setIsThinking(true);    
    setChatHistory((prev) => [
      ...prev,
      { role: "assistant", text: "", pending: true },
    ]);

    // Bot yanıtını al ve ekle
    const botText = await generateBotResponse(newHistory);
    // if (botText) {
    //   setChatHistory((history) => [...history, { role: "assistant", text: botText }]);
    // }
    setChatHistory((history) => {
      const copy = [...history];
      // son mesaj pending assistant ise onu güncelle
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === "assistant" && copy[i].pending) {
          copy[i] = { role: "assistant", text: botText }; // pending kaldır
          break;
        }
      }
      return copy;
    });
    setIsThinking(false);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="max-w-[75%] rounded-lg bg-bot-bubble dark:bg-gray-800 p-4 md:p-6 shadow-card">
            <p className="text-sm dark:text-gray-300">
              Merhaba! Poliçenizle ilgili sorularınızı bekliyorum.
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
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

          <div className="relative flex items-center">
            <form id="chat-form" onSubmit={handleFormSubmit} className="contents">
              <input
                ref={inputRef}
                name="message"
                type="text"
                placeholder={isThinking ? "Asistan yazıyor..." : "Bir mesaj yazın..."}
                autoComplete="off"
                disabled={isThinking}
                className="w-full max-h-[200px] py-3 pl-12 pr-14 rounded-full bg-gray-100 dark:bg-gray-700
                 border border-transparent focus:ring-2 focus:ring-[var(--color-accent)]
                 focus:border-transparent text-[var(--color-text)]
                 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-70"
              />
              <button
                type="submit"
                form="chat-form"
                disabled={isThinking}
                className="absolute right-1 p-2 flex justify-center items-center rounded-full bg-[var(--color-accent)] text-white hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                aria-label="Gönder"
              >
                <span className="material-symbols-outlined">{isThinking ? "schedule" : "send"}</span>
              </button>
            </form>
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
