import React from 'react'
import Sidebar from '../Sidebar/Sidebar'
import Chat from '../Chat/Chat'

const ChatLayout = () => {
  return (
    <div className="h-full w-full flex flex-row min-h-0">
      <aside className="w-64 md:w-72 shrink-0 border-r border-[var(--color-border)] bg-white/80 dark:bg-gray-900/50 backdrop-blur">
        <Sidebar />
      </aside>
      <section className="flex-1 min-w-0 min-h-0 flex flex-col">
        <Chat />
      </section>
    </div>
  )
}

export default ChatLayout