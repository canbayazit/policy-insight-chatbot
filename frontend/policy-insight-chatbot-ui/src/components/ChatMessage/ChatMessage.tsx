import React from "react";
import type { ChatItem, ChatRole } from "../../global/interfaces/Chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

const roleVariants: Record<ChatRole, string> = {
  user: "ml-auto bg-user-bubble shadow-card",
  assistant: "bg-bot-bubble shadow-card",
  system: "mx-auto bg-system-bubble text-gray-700 dark:text-gray-200",
} as const;
interface IProps {
  chat: ChatItem;
}

const ChatMessage: React.FC<IProps> = ({ chat }) => {
  return (
    <div
      className={`max-w-[75%] rounded-lg p-4 md:p-6 ${roleVariants[chat.role]}`}
    >
      {chat.pending ? (
        <div className="flex items-center gap-2">
          {/* <span className="material-symbols-outlined text-base opacity-60">
            smart_toy
          </span>
          <span>yazıyor</span> */}
          <span className="inline-flex gap-1 align-middle">
            <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
            <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
            <span className="size-1.5 rounded-full bg-current animate-bounce" />
          </span>
        </div>
      ) : (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {chat.text}
        </ReactMarkdown>
      )}
    </div>
  );
};

export default ChatMessage;
