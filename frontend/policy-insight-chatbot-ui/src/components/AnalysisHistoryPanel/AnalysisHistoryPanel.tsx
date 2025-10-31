import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { IUpload } from "../../global/interfaces/Upload";
import moment from "moment";

const AnalysisHistoryPanel = () => {
  const [recent, setRecent] = useState<IUpload[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("recentAnalyses");
      setRecent(raw ? (JSON.parse(raw) as IUpload[]) : []);
    } catch {
      setRecent([]);
    }
  }, []);
  return (
    <div className="bg-white dark:bg-gray-800 border-r border-border h-full overflow-y-auto">
      <div className="p-4">
        <Link
          to="/"
          className="flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-bold text-sm hover:opacity-90 transition-colors shadow-soft focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
          aria-label="Yeni analiz başlat"
        >
          <span className="material-symbols-outlined">add</span>
          Yeni Analiz Başlat
        </Link>
        <nav className="mt-6" aria-label="Son analizler">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider px-2">
            ANALİZ GEÇMİŞİ
          </h2>
          <ul className="mt-2 space-y-1">
            {recent.length === 0 && (
              <li className="px-2 py-2 text-sm text-gray-500">
                Henüz kayıt yok
              </li>
            )}
            {recent.map((r) => (
              <li key={r.policy_id}>
                <a className="flex items-center justify-between gap-3 px-2 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-base">
                      description
                    </span>
                    <span className="truncate ml-1" title={r.filename}>
                      {r.filename}
                    </span>
                  </div>
                  <span className="text-right text-[11px] text-gray-500 dark:text-gray-400 tnum">
                    {moment(r.created_at.toString())
                      .locale('tr')
                      .startOf("seconds")
                      .fromNow()}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AnalysisHistoryPanel;
