import { Outlet } from 'react-router'
import './App.css'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'

function App() {
  return (
    <div className="bg-background text-on-surface min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen relative flex flex-col">
        <Header />
        <main className="flex-1 pt-8 pb-12 px-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default App
