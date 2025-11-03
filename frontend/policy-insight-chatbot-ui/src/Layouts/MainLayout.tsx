import AnalysisHistoryPanel from "../components/AnalysisHistoryPanel/AnalysisHistoryPanel";
import DeveloperInfo from "../components/DeveloperInfo/DeveloperInfo";
import BottomNav from "../components/Navbar/BottomNav";
import Header from "../components/Header/Header";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="lg:h-screen max-lg:h-dvh flex flex-col ">
      <Header />
      <main className="flex-1 min-h-0">
        <div className="h-full w-full flex flex-col">
          <div className="lg:hidden h-full">
            <div className="h-full">
              <Outlet />
            </div>
          </div>
          <div className="max-lg:hidden min-h-0 *:min-h-0 *:min-w-0 *:basis-0 flex h-full">
            <aside className="hidden lg:block flex-1 border-r border-border overflow-auto">
              <AnalysisHistoryPanel />
            </aside>
            <section className="hidden lg:block flex-2 overflow-auto bg-bg-alt">
              <Outlet />
            </section>
            <aside className="hidden lg:block flex-1 border-l border-border overflow-auto bg-bg-alt">
              <DeveloperInfo />
            </aside>
          </div>
          <div className="lg:hidden">
            <BottomNav />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
