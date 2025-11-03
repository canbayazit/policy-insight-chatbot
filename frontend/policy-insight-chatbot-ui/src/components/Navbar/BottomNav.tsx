import { NavLink } from "react-router-dom";
import { TABS } from "../../global/interfaces/BottomTab";

const BottomNav = () => {
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
            <NavLink
              to={tab.to}
              type="button"
              className={({ isActive }) =>`w-full h-14 flex flex-col items-center justify-center gap-0.5
                          text-xs font-medium
                          ${
                            isActive
                              ? "text-accent"
                              : "text-gray-600 dark:text-gray-300"
                          }`}>
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
