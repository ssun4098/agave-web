import { Outlet } from 'react-router'
import Sidebar from './Sidebar'
import Header from './Header'

function RootLayout() {
  return (
    <div className="bg-background text-on-surface min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0 ml-64 min-h-screen relative flex flex-col">
        <Header />
        <main className="flex-1 pt-8 pb-12 px-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default RootLayout
