import { useState } from 'react'
import { canteens, dishesOfStall, stallsOfCanteen } from '../data'
import { QUEUE_TEXT, canteenQueue, isOpen, queueFor, walkMinutes } from '../lib'
import { go } from '../router'
import { Icon } from '../components/Icons'

export function CanteensPage() {
  const [active, setActive] = useState(canteens[0].id)
  const now = new Date()
  const canteen = canteens.find((c) => c.id === active)!
  const stallList = stallsOfCanteen(active)
  const queue = canteenQueue(active, now)
  const open = isOpen(canteen, now)
  const waits = stallList.map((s) => ({ stall: s, q: queueFor(s.id, now) }))
  const best = [...waits].sort((a, b) => a.q.people - b.q.people)[0]
  const allWaits = canteens.flatMap((c) =>
    stallsOfCanteen(c.id).map((s) => ({ canteen: c, stall: s, q: queueFor(s.id, now) })),
  )
  const anyOpen = canteens.some((c) => isOpen(c, now))
  const emptiest = [...allWaits].sort((a, b) => a.q.people - b.q.people)[0]

  return (
    <div className="page canteens-page">
      <header className="page-head">
        <span className="eyebrow">CAMPUS · 3 CANTEENS · 12 STALLS</span>
        <h1>先选食堂，再选窗口</h1>
        <p className="page-sub">
          窗口按楼层排好，排队人数每分钟刷新。拿不准就点菜名，看别人怎么骂、怎么夸。
        </p>
      </header>

      <button type="button" className={`now-best ${anyOpen ? '' : 'is-closed'}`} onClick={() => go(anyOpen ? '/canteens' : '/rank')}>
        <span className="now-best-icon">
          <Icon name={anyOpen ? 'pin' : 'clock'} size={18} />
        </span>
        <span className="now-best-body">
          <span className="now-best-label">{anyOpen ? '现在最不用排队' : '现在都打烊了'}</span>
          <span className="now-best-main">
            {anyOpen ? (
              <>
                {emptiest.canteen.short} · {emptiest.stall.name}
                <em className="num">等 {emptiest.q.wait} 分钟</em>
              </>
            ) : (
              <>
                明天 06:30 开门
                <em>先看看这周红榜</em>
              </>
            )}
          </span>
        </span>
        <span className="now-best-side">
          {anyOpen ? `步行 ${walkMinutes(emptiest.canteen.id)} 分钟` : '去逛榜单'}
          <Icon name="arrowRight" size={15} />
        </span>
      </button>

      <div className="canteen-tabs" role="tablist" aria-label="食堂">
        {canteens.map((c) => {
          const q = canteenQueue(c.id, now)
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === active}
              className={`canteen-tab ${c.id === active ? 'is-active' : ''}`}
              onClick={() => setActive(c.id)}
            >
              <span className="ct-mark" style={{ background: c.tone }}>
                {c.short.slice(0, 1)}
              </span>
              <span className="ct-text">
                <strong>{c.name}</strong>
                <em>
                  {c.short} · {q.avg} 人
                </em>
              </span>
              <span className={`queue-dot q-${q.level}`} />
            </button>
          )
        })}
      </div>

      <section className="canteen-detail">
        <div className="canteen-hero">
          <div className="canteen-hero-main">
            <div className="canteen-title-row">
              <h2>{canteen.name}</h2>
              <span className={`open-badge ${open ? 'is-open' : ''}`}>{open ? '营业中' : '已打烊'}</span>
            </div>
            <p className="canteen-desc">{canteen.desc}</p>
            <div className="canteen-meta">
              <span>
                <Icon name="pin" size={14} /> {canteen.location}
              </span>
              <span>
                <Icon name="clock" size={14} /> {canteen.hours}
              </span>
              <span>
                <Icon name="store" size={14} /> {canteen.floors} 层 · {stallList.length} 个窗口
              </span>
            </div>
          </div>
          <div className="canteen-live">
            <span className="live-tag">
              <i className="live-dot" /> 此刻
            </span>
            <strong className="num">{open ? queue.avg : '—'}</strong>
            <span>{open ? `人排队 · ${QUEUE_TEXT[queue.level]}` : '现在已打烊'}</span>
            <div className="queue-bar big">
              <i
                className={`qb-${queue.level}`}
                style={{ width: open ? `${Math.min(100, queue.avg * 3)}%` : '0%' }}
              />
            </div>
            <span className="canteen-live-hint">
              {open ? (
                <>
                  建议去 <b>{best.stall.name}</b>，只等 {best.q.wait} 分钟
                </>
              ) : (
                <>
                  明天 <b>{canteen.hours.split('–')[0].trim()}</b> 开门，先看点别的
                </>
              )}
            </span>
          </div>
        </div>

        <div className="stall-grid">
          {waits.map(({ stall, q }) => {
            const list = dishesOfStall(stall.id)
            const top = [...list].sort((a, b) => b.rating - a.rating)[0]
            return (
              <div className="stall-card" key={stall.id}>
                <div className="stall-head">
                  <div>
                    <h3>{stall.name}</h3>
                    <p>
                      {stall.floor} 楼 · 评分最高 {top.name}
                    </p>
                  </div>
                  <span className={`queue-pill q-${q.level}`}>
                    {open ? `${q.people} 人 · ${q.wait} 分` : '已打烊'}
                  </span>
                </div>
                <div className="stall-dishes">
                  {list.map((dish) => (
                    <button type="button" className="stall-dish" key={dish.id} onClick={() => go(`/dish/${dish.id}`)}>
                      <span className="sd-emoji" style={{ background: dish.tone }} aria-hidden="true">
                        {dish.emoji}
                      </span>
                      <span className="sd-name">
                        {dish.name}
                        {dish.risk ? <i className="risk-dot" title={dish.risk} /> : null}
                      </span>
                      <span className="sd-rating num">{dish.rating.toFixed(1)}</span>
                      <span className="sd-price num">¥{dish.price}</span>
                    </button>
                  ))}
                </div>
                <button type="button" className="stall-more" onClick={() => go('/rank')}>
                  看这个窗口的全部评价 <Icon name="chevronRight" size={13} />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <p className="page-foot">
        排队数据为演示数据，按一卡通刷卡记录 + 同学上报模拟生成，每 60 秒刷新一次
      </p>
    </div>
  )
}
