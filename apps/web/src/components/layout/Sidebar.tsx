import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowUpDown,
  BarChart3,
  Tag,
  LogOut,
  Plus,
  Settings,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/auth.store'
import { useTransactionModalStore } from '../../stores/transactionModal.store'
import { PorquinhoLogo } from '../ui/PorquinhoLogo'
import { ProfileModal } from '../profile/ProfileModal'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowUpDown, label: 'Movimentações' },
  { to: '/reports', icon: BarChart3, label: 'Relatórios' },
  { to: '/categories', icon: Tag, label: 'Categorias' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { openModal } = useTransactionModalStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <>
      {/* Top Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-[#DDD7C0] bg-[#FAF8F2]/95 px-4 backdrop-blur-md md:hidden">
        <PorquinhoLogo size="sm" subtitle="Finanças" />
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openModal()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] text-[#F1ECDA] active:scale-95 transition-all shadow-sm cursor-pointer touch-manipulation"
            aria-label="Nova movimentação"
          >
            <Plus size={19} className="stroke-[2.5]" />
          </button>
          <button
            onClick={() => setProfileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5EAEF] border border-[#DDD7C0] text-xs font-bold text-[#111111] hover:bg-[#DDD7C0] active:scale-95 transition-all cursor-pointer touch-manipulation"
            title="Meu Perfil"
            aria-label="Abrir perfil"
          >
            {initial}
          </button>
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#758695] hover:text-[#111111] hover:bg-[#EFE9D5] active:scale-95 transition-all cursor-pointer touch-manipulation"
            title="Sair"
            aria-label="Sair da conta"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>
    
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[var(--sidebar-width)] flex-col border-r border-[#DDD7C0] bg-[#FAF8F2] md:flex">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-[#DDD7C0] px-5 py-3">
          <PorquinhoLogo size="md"/>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 pt-4 pb-1">
          <button
            type="button"
            onClick={() => openModal()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111111] px-4 py-2.5 text-xs font-bold text-[#F1ECDA] shadow-sm hover:bg-[#222222] active:bg-black active:scale-[0.98] transition-all cursor-pointer ring-1 ring-[#111111]"
          >
            <Plus size={15} className="text-[#F1ECDA] stroke-[2.5]" />
            <span>Nova movimentação</span>
            <kbd className="ml-auto hidden xl:inline-block rounded bg-[#222222] px-1.5 py-0.5 text-[10px] font-mono text-[#758695]">
              N
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#758695]">
              Menu Principal
            </span>
          </div>
          <ul className="flex flex-col gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-[#111111] text-[#F1ECDA] shadow-sm'
                        : 'text-[#5C6D7C] hover:bg-[#EFE9D5] hover:text-[#111111] active:scale-[0.98]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        className={cn(
                          'transition-colors shrink-0',
                          isActive ? 'text-[#F1ECDA]' : 'text-[#758695] group-hover:text-[#111111]'
                        )}
                      />
                      <span className="flex-1">{label}</span>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#758695] shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User profile footer */}
        <div className="border-t border-[#DDD7C0] p-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-[#DDD7C0] bg-[#F1ECDA] p-2.5">
            <button
              onClick={() => setProfileOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111111] text-xs font-bold text-[#F1ECDA] shadow-xs ring-1 ring-[#758695]/30 hover:bg-[#222222] active:scale-95 transition-all cursor-pointer"
              title="Editar Perfil"
              aria-label="Editar Perfil"
            >
              {initial}
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer"
              title="Clique para editar seu perfil"
            >
              <p className="truncate text-xs font-bold text-[#111111] leading-tight">
                {user?.name || 'Usuário'}
              </p>
              <p className="truncate text-[11px] text-[#758695] font-medium mt-0.5">
                {user?.email || 'usuario@exemplo.com'}
              </p>
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#758695] hover:text-[#111111] hover:bg-[#EAE2CA] transition-colors cursor-pointer"
              title="Editar Perfil"
              aria-label="Editar Perfil"
            >
              <Settings size={15} />
            </button>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#758695] hover:text-[#C94A4A] hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sair"
              aria-label="Sair da conta"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      {/* Mobile Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[#DDD7C0] bg-[#FAF8F2]/95 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden shadow-lg">
        {navItems.slice(0, 2).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 text-[10px] font-semibold transition-all active:scale-95 touch-manipulation',
                isActive ? 'text-[#111111] font-bold' : 'text-[#758695] hover:text-[#111111]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'flex items-center justify-center rounded-xl p-1.5 transition-all',
                    isActive ? 'bg-[#111111] text-[#F1ECDA] shadow-xs' : 'text-[#758695]'
                  )}
                >
                  <Icon size={18} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Central Mobile Action Button */}
        <div className="-mt-6 flex flex-col items-center">
          <button
            onClick={() => openModal()}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-[#F1ECDA] shadow-elevated ring-4 ring-[#FAF8F2] active:scale-90 transition-all cursor-pointer touch-manipulation"
            aria-label="Nova movimentação"
          >
            <Plus size={22} className="stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-bold text-[#758695] mt-0.5">Novo</span>
        </div>

        {navItems.slice(2, 4).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 text-[10px] font-semibold transition-all active:scale-95 touch-manipulation',
                isActive ? 'text-[#111111] font-bold' : 'text-[#758695] hover:text-[#111111]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'flex items-center justify-center rounded-xl p-1.5 transition-all',
                    isActive ? 'bg-[#111111] text-[#F1ECDA] shadow-xs' : 'text-[#758695]'
                  )}
                >
                  <Icon size={18} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
