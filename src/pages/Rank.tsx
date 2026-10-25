import { useMemo, useState } from 'react'
import { canteens, dishes } from '../data'
import { MEAL_LABEL, timeLabel } from '../lib'
import { DishRow } from '../components/DishCard'
import { Icon } from '../components/Icons'
import { useStore } from '../store'

type TabId = 'top' | 'bottom' | 'new' | 'value' | 'breakfast'

const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: 'top', label: '红榜', hint: '综合评分最高的窗口菜' },
  { id: 'bottom', label: '黑榜', hint: '最近差评集中，慎重' },
  { id: 'new', label: '新菜', hint: '上架不到 7 天' },
  { id: 'value', label: '省钱', hint: '10 元以内还能好吃' },
  { id: 'breakfast', label: '早餐', hint: '早八人的续命清单' },
]

export function RankPage() {
  const { myReviews } = useStore()
  const [tab, setTab] = useState<TabId>('top')
  const [canteenId, setCanteenId] = useState('all')

  const list = useMemo(() => {
    let pool = [...dishes]
    if (canteenId !== 'all') {
      pool = pool.filter((d) => d.stallId.startsWith(`${canteenId}-`))
    }
    if (tab === 'top') {
      pool = pool.filter((d) => d.rating >= 4.2).sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    } else if (tab === 'bottom') {
      pool = pool
        .filter((d) => d.rating < 4.25 || d.riskLevel === 'high')
        .sort((a, b) => a.rating - b.rating)
    } else if (tab === 'new') {
      pool = pool.filter((d) => d.isNew).sort((a, b) => b.popularity - a.popularity)
    } else if (tab === 'value') {
      pool = pool.filter((d) => d.price <= 10).sort((a, b) => b.rating - a.rating)
    } else {
      pool = pool
        .filter((d) => d.meals.includes('breakfast'))
        .sort((a, b) => b.rating - a.rating)
    }
    return pool.slice(0, 12)
  }, [tab, canteenId])

  const activeTab = TABS.find((t) => t.id === tab)!
  const totalReviews = dishes.reduce((sum, d) => sum + d.reviewCount, 0) + myReviews.length

  return (
    <div className="page rank-page">
      <header className="page-head">
        <span className="eyebrow">WEEKLY BOARD · UPDATED {timeLabel()}</span>
        <h1>这周该避开的，和该冲的</h1>
        <p className="page-sub">
          收录 {dishes.length} 道菜、{totalReviews.toLocaleString()} 条点评。红榜看综合分，黑榜只看差评说了什么。
        </p>
      </header>

      <div className="rank-toolbar">
        <div className="tabs" role="tablist" aria-label="榜单类型">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`tab ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="filter-chips">
          <button
            type="button"
            className={`filter-chip ${canteenId === 'all' ? 'is-active' : ''}`}
            onClick={() => setCanteenId('all')}
          >
            全部食堂
          </button>
          {canteens.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`filter-chip ${canteenId === c.id ? 'is-active' : ''}`}
              onClick={() => setCanteenId(c.id)}
            >
              {c.short}
            </button>
          ))}
        </div>
      </div>

      <div className="rank-note">
        <span className="rank-note-icon">
          <Icon name={tab === 'bottom' ? 'alert' : 'sparkle'} size={16} />
        </span>
        <span>
          <b>{activeTab.label}</b> · {activeTab.hint}
        </span>
        <span className="rank-note-count num">{list.length} 道</span>
      </div>

      <div className={`rank-list ${tab === 'bottom' ? 'is-bottom' : ''}`}>
        {list.map((dish, index) => (
          <DishRow
            key={dish.id}
            dish={dish}
            index={index + 1}
            showRisk={tab === 'bottom'}
            reason={
              tab === 'top'
                ? index === 0
                  ? '本周第一'
                  : index < 3
                    ? '评分前 3'
                    : undefined
                : tab === 'value'
                  ? `${dish.price} 元`
                  : undefined
            }
          />
        ))}
        {list.length === 0 ? <p className="empty-note">这个筛选下暂时没有菜，换一个食堂试试。</p> : null}
      </div>

      <div className="rank-footnote">
        <div className="footnote-item">
          <span className="num">4.25</span>
          <p>红榜门槛：评分 4.25 以上，且近 30 天没有集中差评。</p>
        </div>
        <div className="footnote-item">
          <span className="num">7d</span>
          <p>黑榜只看最近 7 天。一个问题持续出现，才会被挂上来。</p>
        </div>
        <div className="footnote-item">
          <span className="num">!</span>
          <p>评分不影响食堂考核，请放心说真话；带脏话的点评会被折叠。</p>
        </div>
      </div>
      <p className="page-foot">黑榜不是为了挂人，是为了让你少花一次冤枉钱 · {MEAL_LABEL.breakfast} 及夜宵同样适用</p>
    </div>
  )
}
