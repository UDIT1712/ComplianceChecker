import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { WorkspacePage } from './pages/WorkspacePage'
import { DocumentsPage } from './pages/DocumentsPage'
import { useEffect } from 'react'

function App() {
  // Check theme on mount
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<WorkspacePage />} />
        <Route path="documents" element={<DocumentsPage />} />
      </Route>
    </Routes>
  )
}

export default App
