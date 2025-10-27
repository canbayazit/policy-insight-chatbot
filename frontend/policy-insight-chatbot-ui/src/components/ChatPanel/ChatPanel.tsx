import { useEffect, useRef, useState, type FormEvent } from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import type { ChatItem } from "../../global/interfaces/Chat";
import { api } from "../../global/lib/axios";
import { useParams } from "react-router-dom";

const quickPrompts: string[] = [
  "Teminatlarım neler?",
  "Muafiyet ile ilgili durumlarım neler?",
  "Poliçe bitiş tarihi?",
  "Primim ne kadar?",
];

const ChatPanel = () => {
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const { policy_id } = useParams();

  const generateBotResponse = async (question: string): Promise<string> => {
    try {
      if (!policy_id) {
        return "Önce bir poliçe PDF’i yüklemelisiniz.";
      }
      const collection_name = `policy_${policy_id}`;

      // düşünme aşamasındaki sohbeti GÖNDERME
      const historyForServer = chatHistory
        .filter((m) => !(m as any).pending)
        .map((m) =>
          m.role === "user"
            ? { role: "human", content: m.text }
            : { role: "ai", content: m.text }
      );      
      const { data } = await api.post("/chat", {
        question,
        lang: "tr",
        policy_id,
        collection_name,  
        historyForServer      
      });
      console.log(data);
      return (data?.answer ?? "").toString().trim();
    } catch (e) {
      console.error(e);
      return "Üzgünüm, şu an yanıt veremiyorum. Lütfen tekrar deneyin.";
    }
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage || isThinking) return;

    // Kullanıcı mesajını önce state'e ekle
    const newHistory: ChatItem[] = [
      ...chatHistory,
      { role: "user", text: userMessage },
    ];
    setChatHistory(newHistory);

    // düşünme aşaması
    setIsThinking(true);
    setChatHistory((history) => [
      ...history,
      { role: "assistant", text: "", pending: true },
    ]);

    // Bot yanıtını al ve ekle
    const botText = await generateBotResponse(userMessage);
    setChatHistory((history) => {
      const copy = [...history];
      for (let i = copy.length - 1; i >= 0; i--) {
        // keep simple backward loop (works in older TS targets too)
        const msg = copy[i] as ChatItem & { pending?: boolean };
        if (msg.role === "assistant" && msg.pending) {
          copy[i] = { role: "assistant", text: botText };
          break;
        }
      }
      return copy;
    });
    setIsThinking(false);
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const el = inputRef.current;
    if (!el) return;
    const value = el.value.trim();
    if (!value) return;
    el.value = "";
    await sendMessage(value);
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current?.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      <div ref={chatRef} className="flex-1 overflow-y-auto p-6 md:p-8">
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
            {quickPrompts.map((message, index) => (
              <button
                key={index}
                onClick={() => sendMessage(message)}
                disabled={isThinking}
                className="px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors whitespace-nowrap disabled:opacity-60"
                title={message}
              >
                {message}
              </button>
            ))}
          </div>
          <div className="relative flex items-center">
            <form
              id="chat-form"
              onSubmit={handleFormSubmit}
              className="contents"
            >
              <input
                ref={inputRef}
                name="message"
                type="text"
                placeholder={
                  isThinking ? "Asistan yazıyor..." : "Bir mesaj yazın..."
                }
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
                <span className="material-symbols-outlined">
                  {isThinking ? "schedule" : "send"}
                </span>
              </button>
            </form>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Yanıtlar poliçenizdeki ifadelere dayanır. Kaynak alıntıları mesaj
            içinde gösterilir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
