import { useEffect, useState } from 'react'
import { canteens, dishes, stallById } from '../data'
import {
  MEAL_LABEL,
  QUEUE_TEXT,
  canteenQueue,
  currentMeal,
  greeting,
  isOpen,
  mealContext,
  bestRecommendation,
  pickRecommendation,
  queueFor,
  risks,
  timeLabel,
  weeklyTop,
  weekLabel,
  type Recommendation,
} from '../lib'
import { go } from '../router'
import { useStore } from '../store'
import { DishTicket, MiniDish } from '../components/DishCard'
import { Icon } from '../components/Icons'

function DecisionCard({ meal, preview }: { meal: ReturnType<typeof currentMeal>; preview: boolean }) {
  const { prefs, markEaten, notify } = useStore()
  const [seed, setSeed] = useState(3)
  const [rolling, setRolling] = useState(false)
  const [rec, setRec] = useState<Recommendation | null>(() => bestRecommendation(prefs, meal))

  useEffect(() => {
    setRec(bestRecommendation(prefs, meal))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.spice, prefs.budget, prefs.avoid.join('|'), meal])

  function reroll() {
    if (rolling) return
    setRolling(true)
    window.setTimeout(() => {
      const next = seed + 1
      const picked = pickRecommendation(prefs, meal, next, rec?.dish.id)
      setSeed(next)
      setRec(picked)
      setRolling(false)
    }, 460)
  }

  if (!rec) {
    return (
      <div className="decision empty">
        <p>这个预算下暂时没有合适的菜，去「我的」把预算放宽一点？</p>
        <button className="btn btn-primary" onClick={() => go('/me')}>
          调整偏好
        </button>
      </div>
    )
  }

  const { dish } = rec
  const stall = stallById(dish.stallId)
  const canteen = canteens.find((c) => c.id === stall.canteenId)
  const open = canteen ? isOpen(canteen) : false

  return (
    <div className={`decision ${rolling ? 'is-rolling' : ''}`}>
      <div className="decision-top">
        <span className="live-tag">
          <i className="live-dot" /> {preview ? '明天午餐参考' : `实时推荐 · ${MEAL_LABEL[meal]}`}
        </span>
        <span className="score-badge">
          <strong className="num">
            {Math.round(Math.min(97, Math.max(72, 58 + (dish.rating - 3.5) * 22)))}
          </strong>
          <small>推荐指数</small>
        </span>
      </div>

      <div className="decision-body">
        <div className="decision-visual" style={{ background: dish.tone }}>
          <span aria-hidden="true">{dish.emoji}</span>
        </div>
        <div className="decision-info">
          <h2>{dish.name}</h2>
          <p className="decision-sub">
            {canteen?.short} · {stall.name}
          </p>
          <div className="decision-facts">
            <span>
              <b className="num">¥{dish.price}</b>
            </span>
            <span>
              <b className="num">{dish.rating.toFixed(1)}</b> 分
            </span>
            <span>
              {open ? (
                <>
                  排队 <b className="num">{rec.wait}</b> 分钟
                </>
              ) : (
                '现在已打烊'
              )}
            </span>
          </div>
          <div className="tag-row">
            {dish.tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
            {dish.spice > 0 ? <span className="tag tag-spice">{['', '微辣', '中辣', '特辣'][dish.spice]}</span> : null}
          </div>
        </div>
      </div>

      <ul className="reason-list">
        {rec.reasons.map((r) => (
          <li key={r}>
            <Icon name="check" size={13} /> {r}
          </li>
        ))}
        {rec.reasons.length === 0 ? (
          <li>
            <Icon name="check" size={13} /> 综合评分和排队情况挑出来的
          </li>
        ) : null}
      </ul>

      <div className="decision-actions">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => {
            markEaten(dish.id)
            notify(`记下了：${dish.name}。吃完回来写两句？`)
            go(`/dish/${dish.id}`)
          }}
        >
          就吃这个
          <Icon name="arrowRight" size={17} />
        </button>
        <button type="button" className="btn btn-ghost" onClick={reroll} disabled={rolling}>
          <Icon name="shuffle" size={16} />
          {rolling ? '正在换…' : '换一个'}
        </button>
      </div>

      <div className="decision-foot">
        <span>
          已按你的口味画像过滤 · {prefs.avoid.length > 0 ? `避开${prefs.avoid.join('、')}` : '暂无忌口'}
        </span>
        <button type="button" className="link-btn" onClick={() => go('/me')}>
          调整偏好
        </button>
      </div>
    </div>
  )
}

export function HomePage() {
  const { prefs, setPrefs, eaten } = useStore()
  const [now, setNow] = useState(() => new Date())
  const { meal, preview } = mealContext(now)
  const tops = weeklyTop(3)
  const riskList = risks(3)
  const newbies = dishes.filter((d) => d.isNew)
  const todayEaten = eaten.filter((e) => new Date(e.at).toDateString() === new Date().toDateString())
  const eatenDish = todayEaten[0] ? dishes.find((d) => d.id === todayEaten[0].dishId) : null

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(t)
  }, [])

  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow-row">
            <span className="eyebrow">{greeting(now)}，{prefs.nickname}</span>
            <span className="context-chip">
              {weekLabel(now)} · {preview ? '明天午餐' : MEAL_LABEL[meal]} · {timeLabel(now)}
            </span>
          </div>
          <h1>
            今天吃什么，
            <br />
            <span className="hl">别再纠结了。</span>
          </h1>
          <p className="hero-sub">
            青禾大学 3 个食堂、{dishes.length} 道菜。按你的口味、预算和此刻的排队情况，替你挑一个。
          </p>
          <div className="quick-prefs">
            <button
              type="button"
              className="pref-chip"
              onClick={() => setPrefs({ ...prefs, spice: ((prefs.spice + 1) % 4) as typeof prefs.spice })}
              title="点一下切换辣度"
            >
              <Icon name="flame" size={14} />
              辣度 · {['不辣', '微辣', '中辣', '特辣'][prefs.spice]}
            </button>
            <button
              type="button"
              className="pref-chip"
              onClick={() => setPrefs({ ...prefs, budget: prefs.budget >= 25 ? 10 : prefs.budget + 5 })}
              title="点一下切换预算"
            >
              ¥ 预算 · {prefs.budget} 元内
            </button>
            <button type="button" className="pref-chip" onClick={() => go('/me')}>
              <Icon name="sliders" size={14} />
              {prefs.avoid.length > 0 ? `忌口 ${prefs.avoid.length} 项` : '设置忌口'}
            </button>
          </div>
          {eatenDish ? (
            <button type="button" className="eaten-note" onClick={() => go(`/dish/${eatenDish.id}`)}>
              <span className="eaten-emoji" aria-hidden="true">
                {eatenDish.emoji}
              </span>
              今天已记录：{eatenDish.name} · 吃完记得点评
              <Icon name="chevronRight" size={14} />
            </button>
          ) : null}
        </div>
        <DecisionCard meal={meal} preview={preview} />
      </section>

      <div className="home-grid">
        <div className="col-main">
          <section className="block">
            <div className="section-head">
              <div>
                <span className="eyebrow">WEEKLY TOP 3</span>
                <h2>这周被点爆的 3 道</h2>
              </div>
              <button type="button" className="link-btn" onClick={() => go('/rank')}>
                完整榜单 <Icon name="arrowRight" size={14} />
              </button>
            </div>
            <div className="ticket-grid">
              {tops.map((dish, index) => (
                <DishTicket dish={dish} rank={index + 1} key={dish.id} />
              ))}
            </div>
          </section>

          <section className="block">
            <div className="section-head">
              <div>
                <span className="eyebrow">JUST LANDED</span>
                <h2>本周新菜，趁人少去</h2>
              </div>
              <span className="section-note">{newbies.length} 道上架不到 7 天</span>
            </div>
            <div className="mini-strip">
              {newbies.map((dish) => (
                <MiniDish dish={dish} key={dish.id} />
              ))}
            </div>
          </section>
        </div>

        <aside className="col-side">
          <section className="alert-card">
            <div className="alert-head">
              <span className="alert-title">
                <Icon name="alert" size={16} /> 踩雷预警
              </span>
              <span className="alert-meta">近 7 天 1,284 条点评</span>
            </div>
            <div className="alert-list">
              {riskList.map((dish) => {
                const q = queueFor(dish.stallId)
                return (
                  <button type="button" className="alert-row" key={dish.id} onClick={() => go(`/dish/${dish.id}`)}>
                    <span className="alert-emoji" style={{ background: dish.tone }} aria-hidden="true">
                      {dish.emoji}
                    </span>
                    <span className="alert-body">
                      <span className="alert-name">
                        {dish.name}
                        <em className="num">¥{dish.price}</em>
                      </span>
                      <span className="alert-reason">{dish.risk}</span>
                    </span>
                    <span className={`queue-pill q-${q.level}`}>{q.people} 人</span>
                  </button>
                )
              })}
            </div>
            <p className="alert-foot">
              预警来自同校区同学的实际评价，不是系统瞎猜。点进去看完整差评。
            </p>
          </section>

          <section className="canteen-card">
            <div className="section-head compact">
              <div>
                <span className="eyebrow">RIGHT NOW</span>
                <h2>食堂此刻</h2>
              </div>
              <button type="button" className="link-btn" onClick={() => go('/canteens')}>
                全部 <Icon name="chevronRight" size={13} />
              </button>
            </div>
            <div className="canteen-rows">
              {canteens.map((c) => {
                const q = canteenQueue(c.id)
                const open = isOpen(c, now)
                return (
                  <button type="button" className="canteen-row" key={c.id} onClick={() => go('/canteens')}>
                    <span className="canteen-mark" style={{ background: c.tone }}>
                      {c.short.slice(0, 1)}
                    </span>
                    <span className="canteen-info">
                      <span className="canteen-name">
                        {c.name}
                        <em className={open ? 'open' : 'closed'}>{open ? '营业中' : '已打烊'}</em>
                      </span>
                      <span className="queue-bar">
                        <i
                          className={`qb-${q.level}`}
                          style={{ width: open ? `${Math.min(100, q.avg * 3)}%` : '0%' }}
                        />
                      </span>
                      <span className="canteen-queue">
                        {open
                          ? `${q.avg} 人排队 · ${QUEUE_TEXT[q.level]}`
                          : `已打烊 · ${c.hours.split('–')[0].trim()} 开门`}
                      </span>
                    </span>
                    <Icon name="chevronRight" size={15} className="muted-icon" />
                  </button>
                )
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
