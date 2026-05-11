import { NavLink, useLocation } from 'react-router'
import wordmark from '../../assets/wordmark.svg'
import logo from '../../assets/logo.png'

const activeClass = "flex items-center gap-3 bg-[#ffffff] dark:bg-slate-800 text-[#2b3896] rounded-lg px-4 py-3 shadow-[0_12px_32px_-4px_rgba(43,56,150,0.08)] scale-[0.98] transition-transform duration-300 ease-in-out"
const inactiveClass = "flex items-center gap-3 text-[#454652] dark:text-slate-400 px-4 py-3 hover:bg-[#ffffff]/50 dark:hover:bg-slate-800/50 transition-colors"
const subActiveClass = "flex items-center gap-2 text-[#2b3896] font-bold px-4 py-2 rounded-lg bg-[#2b3896]/8 text-sm transition-colors"
const subInactiveClass = "flex items-center gap-2 text-[#454652] dark:text-slate-400 px-4 py-2 rounded-lg hover:bg-[#ffffff]/50 text-sm transition-colors"

function Sidebar() {
    const location = useLocation()
    const questionOpen = location.pathname.startsWith('/question')
    const workbookOpen = location.pathname.startsWith('/workbook')

    return (
        <>
            <div className='bg-background text-on-surface min-h-screen flex'>
    <nav
      className="fixed left-0 top-0 h-full sidebar-fixed flex flex-col p-6 z-40 bg-[#f4f2fc] dark:bg-slate-900 font-manrope text-base font-semibold border-r border-outline-variant/10"
      id="sidebar"
    >
      <div className="mb-1 px-2">
        <div className="flex items-center">
          <img src={logo} alt="logo" className="h-16 w-16 object-contain" />
          <img src={wordmark} alt="AGAVE" className="h-8 object-contain object-left" />
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <NavLink
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
          to="/"
          end
        >
          <span className="material-symbols-outlined">home</span>
          <span>홈</span>
        </NavLink>
        <div>
          <NavLink
            className={({ isActive }) => isActive ? activeClass : inactiveClass}
            to="/question"
            end
          >
            <span className="material-symbols-outlined">quiz</span>
            <span>문제</span>
          </NavLink>
          {questionOpen && (
            <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-[#2b3896]/15 pl-3">
              <NavLink
                className={({ isActive }) => isActive ? subActiveClass : subInactiveClass}
                to="/question"
                end
              >
                목록
              </NavLink>
              <NavLink
                className={({ isActive }) => isActive ? subActiveClass : subInactiveClass}
                to="/question/new"
              >
                등록
              </NavLink>
            </div>
          )}
        </div>
        <div>
          <NavLink
            className={({ isActive }) => isActive ? activeClass : inactiveClass}
            to="/workbook"
            end
          >
            <span className="material-symbols-outlined">menu_book</span>
            <span>문제집</span>
          </NavLink>
          {workbookOpen && (
            <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-[#2b3896]/15 pl-3">
              <NavLink
                className={({ isActive }) => isActive ? subActiveClass : subInactiveClass}
                to="/workbook"
                end
              >
                목록
              </NavLink>
              <NavLink
                className={({ isActive }) => isActive ? subActiveClass : subInactiveClass}
                to="/workbook/new"
              >
                등록
              </NavLink>
            </div>
          )}
        </div>
        <NavLink
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
          to="/attempts"
        >
          <span className="material-symbols-outlined">edit_document</span>
          <span>시험보기</span>
        </NavLink>
        <a
          className="flex items-center gap-3 text-[#454652] dark:text-slate-400 px-4 py-3 hover:bg-[#ffffff]/50 dark:hover:bg-slate-800/50 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined">group</span>
          <span>커뮤니티</span>
        </a>
        <a
          className="flex items-center gap-3 text-[#454652] dark:text-slate-400 px-4 py-3 hover:bg-[#ffffff]/50 dark:hover:bg-slate-800/50 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined">inventory_2</span>
          <span>아카이브</span>
        </a>
      </div>
      <div className="mt-auto space-y-2 pt-6">
        <div
          className="bg-gradient-to-r from-transparent via-[#c5c5d4]/20 to-transparent h-[1px] mb-4"
        ></div>
        <a
          className="flex items-center gap-3 text-[#454652] px-4 py-2 hover:text-[#2b3896] transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined">help</span>
          <span>도움말</span>
        </a>
        <a
          className="flex items-center gap-3 text-[#454652] px-4 py-2 hover:text-[#2b3896] transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>로그아웃</span>
        </a>
      </div>
    </nav>
      </div>
        </>
    )
}

export default Sidebar;