import AnalysisHistoryPanel from '../../components/AnalysisHistoryPanel/AnalysisHistoryPanel'
import ChatPanel from '../../components/ChatPanel/ChatPanel'
import DeveloperInfo from '../../components/DeveloperInfo/DeveloperInfo'

const Chat = () => {
  return (
    <div className="h-full w-full flex flex-row min-h-0">
      <aside className="w-64 md:w-72 shrink-0 border-r border-[var(--color-border)] bg-white/80 dark:bg-gray-900/50 backdrop-blur">
        <AnalysisHistoryPanel />
      </aside>
      <section className="flex-1 min-w-0 min-h-0 flex flex-col">
        <ChatPanel />
      </section>
      <aside className="flex w-80 shrink-0 flex-col border-l border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-6">
        <DeveloperInfo/>
      </aside>
      
    </div>
  )
}

export default Chat