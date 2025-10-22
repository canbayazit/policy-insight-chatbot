export type ChatRole = "user" | "assistant" | "system";
export interface ChatItem {
  role: ChatRole;
  text: string;
  pending?: boolean
}