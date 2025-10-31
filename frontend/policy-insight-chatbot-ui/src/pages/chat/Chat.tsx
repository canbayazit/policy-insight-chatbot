import { useState } from "react";
import AnalysisHistoryPanel from "../../components/AnalysisHistoryPanel/AnalysisHistoryPanel";
import ChatPanel from "../../components/ChatPanel/ChatPanel";
import DeveloperInfo from "../../components/DeveloperInfo/DeveloperInfo";
import type { BottomTab } from "../../global/interfaces/BottomTab";
import BottomNav from "../../components/Navbar/BottomNav";

const TAB_COMPONENTS: Record<BottomTab, React.ComponentType> = {
  chat: ChatPanel,
  history: AnalysisHistoryPanel,
  dev: DeveloperInfo,
};

const Chat = () => {
  const [tab, setTab] = useState<BottomTab>("chat");
  const ActivePanel = TAB_COMPONENTS[tab];
  return (
    <>
      <div className="h-full w-full flex flex-col">
        <div className="lg:hidden h-full">
          <div key={tab} className="h-full">
            <ActivePanel />
          </div>
        </div>
        <div className="max-lg:hidden min-h-0 *:min-w-0 *:basis-0 flex h-full">
          <aside className="hidden lg:block border-r flex-[1] border-border bg-white/80 dark:bg-gray-900/50 backdrop-blur">
            <AnalysisHistoryPanel />
          </aside>
          <section className="hidden lg:block flex-2">
            <ChatPanel />
          </section>
          <aside className="hidden lg:block flex-1 border-l border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark">
            <DeveloperInfo />
          </aside>
        </div>
        <div className="lg:hidden">
          <BottomNav active={tab} onChange={setTab} />
        </div>
      </div>
    </>
  );
};

export default Chat;
