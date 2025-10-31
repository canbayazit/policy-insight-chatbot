import { TABS, type BottomTab } from "../../global/interfaces/BottomTab";

interface IProps {
  active: BottomTab;
  onChange: (t: BottomTab) => void;
}

const BottomNav = ({ active, onChange }: IProps) => {
  return (
    <nav
      className="bg-white/95 dark:bg-gray-900/95 border-t border-border
                 backdrop-blur supports-[padding:max(0px)]:
                 pb-[max(env(safe-area-inset-bottom),0px)]"
      aria-label="Alt gezinme"
    >
      <ul className="grid grid-cols-3">
        {TABS.map((tab) => (
          <li key={tab.key}>
            <button
              type="button"
              onClick={() => onChange(tab.key)}
              className={`w-full h-14 flex flex-col items-center justify-center gap-0.5
                          text-xs font-medium
                          ${
                            active === tab.key
                              ? "text-accent"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
              aria-current={active === tab.key ? "page" : undefined}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
