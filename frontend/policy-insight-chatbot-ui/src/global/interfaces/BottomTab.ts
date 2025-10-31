export type BottomTab = "chat" | "history" | "dev";

export const TABS: { key: BottomTab; label: string; icon: string }[] = [
  { key: "history", label: "Dokümanlar", icon: "article" },
  { key: "chat",    label: "Sohbetler",  icon: "chat"    },
  { key: "dev",     label: "Geliştirici",     icon: "person"  },
];
