import { Link } from "react-router-dom";
import avatar from "../../assets/img/Gemini_Generated_Image_5tj98t5tj98t5tj9.png";

const DeveloperInfo = () => {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <img
        alt="Developer Avatar"
        className="size-24 rounded-full border-2 border-primary shadow-md"        
        src={avatar}
      />
      <div className="flex flex-col items-center gap-1">
        <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
          Can Bayazit
        </h2>
        <span className="inline-flex items-center font-bold rounded-full bg-accent/20  px-3 py-1 text-xs text-text shadow-sm">
          Full Stack Developer
        </span>
      </div>
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
        Policy Insight uygulamasını tasarlayan ve geliştiren yazılımcı
      </p>
      <div className="mt-2 flex gap-6">
        <Link
          aria-label="GitHub profili"
          className="text-github dark:text-text-secondary-dark hover:opacity-80 dark:hover:text-text"
          to="https://github.com/canbayazit"
          target="_blank"
        >
          <i className="fab fa-github fa-3x"></i>
        </Link>
        <Link
          aria-label="LinkedIn profili"
          className="text-linkedin dark:text-text-secondary-dark hover:opacity-80 dark:hover:text-text"
          to="https://www.linkedin.com/in/canbayazit/"
          target="_blank"
        >
          <i className="fab fa-linkedin-in fa-3x"></i>
        </Link>
      </div>
    </div>
  );
};

export default DeveloperInfo;
