import { useEffect } from 'react'
import { StoreProvider, useStore } from './store'
import { go, useRoute } from './router'
import { HomePage } from './pages/Home'
import { CanteensPage } from './pages/Canteens'
import { RankPage } from './pages/Rank'
import { MePage } from './pages/Me'
import { DishPage } from './pages/DishPage'
import { Icon } from './components/Icons'
import { timeLabel } from './lib'

const NAV = [
  { id: 'home', label: '今天', icon: 'bowl', path: '/' },
  { id: 'canteens', label: '食堂', icon: 'store', path: '/canteens' },
  { id: 'rank', label: '榜单', icon: 'trophy', path: '/rank' },
  { id: 'me', label: '我的', icon: 'user', path: '/me' },
]

function Shell() {
  const route = useRoute()
  const { toast } = useStore()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [route.name, route.id])

  const active = route.name === 'dish' ? 'rank' : route.name

  let page = <HomePage />
  if (route.name === 'canteens') page = <CanteensPage />
  else if (route.name === 'rank') page = <RankPage />
  else if (route.name === 'me') page = <MePage />
  else if (route.name === 'dish') page = <DishPage id={route.id} />

  return (
    <div className={`app ${route.name === 'dish' ? 'is-dish' : ''}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <button type="button" className="brand" onClick={() => go('/')} aria-label="饭点首页">
            <span className="brand-mark" aria-hidden="true">
              饭
            </span>
            <span className="brand-text">
              饭点<em>FANDIAN</em>
            </span>
          </button>

          <nav className="desktop-nav" aria-label="主导航">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-link ${active === item.id ? 'is-active' : ''}`}
                onClick={() => go(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="topbar-right">
            <span className="clock-chip">
              <i className="live-dot" />
              {timeLabel()} 更新
            </span>
            <button type="button" className="campus-chip" onClick={() => go('/me')}>
              <span className="campus-mark">青</span>
              青禾大学
              <Icon name="chevronRight" size={13} />
            </button>
          </div>
        </div>
      </header>

      <main className="main">{page}</main>

      <footer className="site-foot">
        <span className="brand-mini">饭点 FANDIAN</span>
        <span>校园食堂点评推荐 · 演示作品</span>
        <span>数据与点评均为虚构，排队人数为模拟值</span>
      </footer>

      <nav className="bottom-nav" aria-label="底部导航">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`bottom-link ${active === item.id ? 'is-active' : ''}`}
            onClick={() => go(item.path)}
          >
            <span className="bottom-icon">
              <Icon name={item.icon} size={21} />
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className={`toast ${toast ? 'is-show' : ''}`} role="status" aria-live="polite">
        <Icon name="check" size={15} />
        {toast}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
