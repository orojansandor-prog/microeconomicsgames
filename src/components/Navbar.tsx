import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'

export default function Navbar() {
  const { session, signOut } = useAuth()
  const { t, lang, setLang } = useI18n()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const LangToggle = ({ size = 'xs' }: { size?: string }) => (
    <div className={`flex gap-1 bg-slate-100 rounded-lg p-1 text-${size}`}>
      <button
        onClick={() => setLang('hu')}
        className={`px-2.5 py-2 rounded-md font-semibold transition-colors ${lang === 'hu' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
      >HU</button>
      <button
        onClick={() => setLang('en')}
        className={`px-2.5 py-2 rounded-md font-semibold transition-colors ${lang === 'en' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
      >EN</button>
    </div>
  )

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/microeconomicsgameslogo1.png" alt="MicroeconomicsGames" className="h-12 w-auto" />
          <div className="hidden sm:flex flex-col justify-center">
            <span className="font-black text-sm tracking-widest text-slate-800 uppercase leading-tight">PLAY · LEARN · MASTER!</span>
            <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">AI powered microeconomics games · by Sándor Oroján, professor of Nyíregyháza University</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          <LangToggle />
          {session && (
            <>
              <span className="text-xs text-slate-400 truncate max-w-[140px]">{session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {t('Kilépés', 'Sign out')}
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 w-11 h-11 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menü"
        >
          <span
            className={`block mx-auto w-5 h-0.5 bg-slate-700 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
          />
          <span
            className={`block mx-auto w-5 h-0.5 bg-slate-700 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block mx-auto w-5 h-0.5 bg-slate-700 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-4 shadow-lg">
          <LangToggle size="sm" />
          {session ? (
            <>
              <div className="text-xs text-slate-400 truncate">{session.user.email}</div>
              <Link
                to="/dashboard"
                className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {t('Játékok', 'Games')}
                <span>→</span>
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleSignOut() }}
                className="w-full text-left text-sm text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-2 rounded-lg transition-colors"
              >
                {t('Kilépés', 'Sign out')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t('Bejelentkezés', 'Sign in')}
              <span>→</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
