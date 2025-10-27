import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-white/90 dark:bg-gray-800/60 backdrop-blur">
      <Link
        to="/"
        className="flex items-center gap-1 min-w-0 md:text-3xl"
      >
        <span className="material-symbols-outlined text-accent icon-2xl" aria-hidden="true">
          policy
        </span>
        <h2
          className="font-bold leading-tight tracking-tight text-text
                   text-base md:text-lg"
        >         
          PolicyInsight
        </h2>
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
