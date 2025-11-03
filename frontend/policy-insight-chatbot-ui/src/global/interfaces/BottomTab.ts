export type BottomTab = "home" | "history" | "dev";

export const TABS: {
  to: string;
  key: BottomTab;
  label: string;
  icon: string;
}[] = [
  { to: "/history", key: "history", label: "Dokümanlar", icon: "article" },
  { to: "/", key: "home", label: "Ana Sayfa", icon: "home" },
  { to: "/dev", key: "dev", label: "Geliştirici", icon: "person" },
];
