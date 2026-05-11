import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import useAuthStore from '../../store/auth'
import { AuthService } from '../../services/auth'
import Button from '../ui/Button'

function Header() {
  const user = useAuthStore(s => s.user)
  const clear = useAuthStore(s => s.clear)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutModal, setLogoutModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await AuthService.logout().catch(() => {})
    clear()
    setMenuOpen(false)
    setLogoutModal(true)
  }

  return (
    <>
      {logoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 p-8 w-80 flex flex-col items-center gap-5">
            <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            <p className="text-base font-bold text-on-surface">로그아웃이 완료되었습니다.</p>
            <Button variant="primary" className="w-full text-center" onClick={() => navigate('/login')}>확인</Button>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-50 flex justify-between items-center px-8 h-16 bg-[#fbf8ff]/80 backdrop-blur-md dark:bg-slate-950/80 font-manrope text-sm font-medium border-b border-outline-variant/10">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-[#2b3896] tracking-tight">AGAVE</span>
          <nav className="hidden md:flex gap-6">
            <a className="text-[#454652] hover:text-[#2b3896] transition-colors" href="#">Dashboard</a>
            <a className="text-[#454652] hover:text-[#2b3896] transition-colors" href="#">Workbooks</a>
            <a className="text-[#454652] hover:text-[#2b3896] transition-colors" href="#">Resources</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined p-2 hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">notifications</span>
            <span className="material-symbols-outlined p-2 hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">settings</span>
          </div>
          <button className="primary-gradient text-white px-5 py-2 rounded-md font-semibold text-xs transition-all active:opacity-80">
            Start Practice
          </button>

          {/* Avatar + Dropdown */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden ring-1 ring-outline-variant/20 hover:ring-primary/40 transition-all cursor-pointer"
            >
              {user?.avatarLink ? (
                <img src={user.avatarLink} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant flex items-center justify-center w-full h-full" style={{ fontVariationSettings: '"FILL" 1' }}>
                  account_circle
                </span>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/20 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-outline-variant/10">
                  <p className="text-xs font-bold text-on-surface truncate">{user?.name}</p>
                  <p className="text-[11px] text-outline truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { navigate('/mypage'); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                  내 정보 수정
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-error hover:bg-error/5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
