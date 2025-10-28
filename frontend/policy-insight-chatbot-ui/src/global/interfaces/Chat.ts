export const Role = {
  user: "user",
  assistant: "assistant",
  system: "system",
} as const;

export type ChatRole = typeof Role[keyof typeof Role];
export interface ChatItem {
  role: ChatRole;
  text: string;
  pending?: boolean
}
export interface ChatItem {
  role: ChatRole;
  text: string;
  pending?: boolean;
}
export const ROLE_CONFIG: Record<
  ChatRole,
  {
    label: string;
    positionClass: string;
    messageClass: string;    
    labelClass: string;    
    icon?: string;
  }
> = {
  user: {
    label: "Siz",
    positionClass:"ml-auto",
    messageClass: "bg-user-bubble shadow-card",    
    labelClass: "text-right",    
    icon: "person",
  },
  assistant: {
    label: "Poliçe Asistanı",
    positionClass:"mr-auto",
    messageClass: "bg-bot-bubble shadow-card",    
    labelClass: "text-left",    
    icon: "support_agent",
  },
  system: {
    label: "Poliçe Asistanı",
    positionClass:"mr-auto",
    messageClass: "bg-bot-bubble shadow-card",    
    labelClass: "text-left",    
    icon: "support_agent",
  },
};
