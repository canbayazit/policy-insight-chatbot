import React from 'react'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Chat from './components/Chat/Chat';
import Uploader from './components/Uploader/Uploader';

const App = () => {
  const hasPdf = false;
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {hasPdf && <Sidebar />}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto">
            {hasPdf ? <Chat /> : <Uploader />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App