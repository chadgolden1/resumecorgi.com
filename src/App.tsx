import { useState } from 'react'
import './App.css'
import Landing from './views/Landing'
import Editor from '@/views/Editor'
import Button from './components/Button'
import Navbar from './components/Navbar'
import { ResumeProvider } from '@/lib/ResumeContext'

function App() {
  const [viewState, setViewState] = useState('landing')

  const handleStart = () => {
    setViewState('editor')
  };

  return (
    <ResumeProvider>
      <div className={"bg-gray-50 dark:bg-zinc-900 overflow-hidden"}>
        <div className={"antialiased lg:subpixel-antialiased relative flex flex-col justify-center items-center min-h-screen mx-auto xl:px-0"}>

          {viewState === 'landing' && (
            <>
              <Navbar />
              <Landing onStart={handleStart} />
            </>
          )}

          {viewState === 'editor' && (
            <>
              <Editor />
            </>
          )}

          {viewState === 'not-found' && (
            <>
              <p className={"text-xl dark:text-gray-100 mb-3"}>🤷 Not found</p>
              <Button onClick={() => { setViewState('landing') }} text="Start over 🔁" />
            </>
          )}

          
        </div>
      </div>
    </ResumeProvider>
  )
}

export default App
