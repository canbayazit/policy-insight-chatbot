import {
  Role,
  ROLE_CONFIG,
  type ChatItem,
} from "../../global/interfaces/Chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface IProps {
  chat: ChatItem;
}

const ChatMessage = ({ chat }: IProps) => {
  const chatRoleConfig = ROLE_CONFIG[chat.role] ?? ROLE_CONFIG.system;;
  return (
    <div className="flex items-end gap-3">
      {chat.role !== Role.user && <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
        <span className="material-symbols-outlined text-text">
          {chatRoleConfig.icon}
        </span>
      </div>}
      <div className={`flex flex-1 flex-col gap-1 ${chatRoleConfig.positionClass}`}>
        <div>
          <p
            className={`mb-1 text-text-secondary-light dark:text-text-secondary-dark text-xs ${chatRoleConfig.labelClass}`}
          >
            {chatRoleConfig.label}
          </p>
        </div>
        <div
          className={`max-w-[75%] max-md:max-w-full rounded-lg p-4 md:p-6 ${chatRoleConfig.positionClass} ${chatRoleConfig.messageClass}`}
        >
          {chat.pending ? (
            <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
};

export default ChatMessage;
