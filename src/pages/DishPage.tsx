import { useMemo, useState } from 'react'
import { canteenById, dishById, dishes, stallById } from '../data'
import { distribution, isOpen, queueFor, ratingOf, reviewsFor, walkMinutes } from '../lib'
import { go } from '../router'
import { useStore } from '../store'
import { FavoriteButton, MiniDish } from '../components/DishCard'
import { Icon, Stars } from '../components/Icons'
import { ReviewSheet } from '../components/ReviewSheet'
import type { Review } from '../types'

function ReviewItem({ review }: { review: Review }) {
  const [liked, setLiked] = useState(false)
  return (
    <article className={`review-item ${review.mine ? 'is-mine' : ''}`}>
      <div className="review-top">
        <span className="review-avatar" aria-hidden="true">
          {review.author.slice(0, 1)}
        </span>
        <div className="review-meta">
          <span className="review-author">
            {review.author}
            {review.mine ? <em className="mine-badge">我的</em> : null}
          </span>
          <span className="review-sub">
            <Stars value={review.rating} size={11} />
            <i>{review.date}</i>
          </span>
        </div>
        <button
          type="button"
          className={`like-btn ${liked ? 'is-active' : ''}`}
          onClick={() => setLiked((v) => !v)}
          aria-label="有用"
        >
          <Icon name="check" size={13} /> 有用 {review.likes + (liked ? 1 : 0)}
        </button>
      </div>
      <p className="review-text">{review.text}</p>
      {review.tags.length > 0 ? (
        <div className="tag-row">
          {review.tags.map((t) => (
            <span className="tag tag-quiet" key={t}>
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}

export function DishPage({ id }: { id?: string }) {
  const { myReviews, notify, eaten, markEaten } = useStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [onlyBad, setOnlyBad] = useState(false)

  const dish = id ? dishById(id) : undefined

  const mine = useMemo(() => myReviews.filter((r) => r.dishId === id), [myReviews, id])
  const rating = dish ? ratingOf(dish, myReviews) : 0
  const reviewList = dish ? reviewsFor(dish, mine) : []
  const visible = onlyBad ? reviewList.filter((r) => r.rating <= 3) : reviewList
  const around = dish ? Math.round(dish.rating * dish.reviewCount) : 0

  if (!dish) {
    return (
      <div className="page empty-page">
        <h1>这道菜不见了</h1>
        <p>可能已经被窗口下架，或者链接输错了。</p>
        <button type="button" className="btn btn-primary" onClick={() => go('/rank')}>
          去榜单看看
        </button>
      </div>
    )
  }

  const stall = stallById(dish.stallId)
  const canteen = canteenById(stall.canteenId)
  const q = queueFor(dish.stallId)
  const open = isOpen(canteen)
  const dist = distribution(dish.rating).slice().reverse()
  const count = dish.reviewCount + mine.length
  const ateToday = eaten.some(
    (e) => e.dishId === dish.id && new Date(e.at).toDateString() === new Date().toDateString(),
  )
  const similar = dishes
    .filter((d) => d.stallId !== dish.stallId && d.stallId.startsWith(`${canteen.id}-`) && d.id !== dish.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)

  function share() {
    const url = window.location.href
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => notify('链接已复制，可以发给室友了'),
        () => notify('复制失败，手动复制地址栏吧'),
      )
    } else {
      notify('复制失败，手动复制地址栏吧')
    }
  }

  return (
    <div className="page dish-page">
      <button type="button" className="back-link" onClick={() => window.history.back()}>
        <Icon name="arrowLeft" size={16} /> 返回
      </button>

      <div className="dish-layout">
        <div className="dish-main">
          <section className="dish-hero">
            <div className="dish-hero-visual" style={{ background: dish.tone }}>
              <span className="dish-hero-emoji" aria-hidden="true">
                {dish.emoji}
              </span>
              {dish.isNew ? <span className="hero-flag">NEW</span> : null}
              {dish.spice > 0 ? (
                <span className="hero-spice" title={`辣度 ${dish.spice}`}>
                  {Array.from({ length: dish.spice }).map((_, i) => (
                    <Icon name="flame" size={13} key={i} />
                  ))}
                </span>
              ) : null}
            </div>
            <div className="dish-hero-body">
              <div className="breadcrumb">
                <button type="button" onClick={() => go('/canteens')}>
                  {canteen.name}
                </button>
                <span>/</span>
                <span>{stall.name}</span>
                <span>/</span>
                <span>{stall.floor} 楼</span>
              </div>
              <h1>{dish.name}</h1>
              <div className="dish-tags">
                {dish.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
                <span className={`tag ${open ? 'tag-open' : 'tag-closed'}`}>{open ? '现在能买到' : '已打烊'}</span>
              </div>
              <div className="dish-score">
                <strong className="num">{rating.toFixed(1)}</strong>
                <div>
                  <Stars value={rating} size={15} />
                  <span className="dish-score-sub">
                    {count} 条点评 · {around.toLocaleString()} 人点过
                  </span>
                </div>
              </div>
              <p className="dish-desc">{dish.desc}</p>
              <div className="dish-quick-meta">
                <span className="num price">¥{dish.price}</span>
                <span>
                  <Icon name="clock" size={14} />{' '}
                  {open ? `排队 ${q.people} 人 · 约 ${q.wait} 分钟` : '现在已打烊'}
                </span>
                <span>
                  <Icon name="pin" size={14} /> 步行 {walkMinutes(canteen.id)} 分钟
                </span>
              </div>
            </div>
          </section>

          {dish.risk ? (
            <div className={`risk-banner level-${dish.riskLevel ?? 'low'}`}>
              <span className="risk-banner-icon">
                <Icon name="alert" size={18} />
              </span>
              <div>
                <b>踩雷提醒</b>
                <p>{dish.risk}。这不是一次性的吐槽，是最近 7 天反复出现的评价。</p>
              </div>
              <button type="button" className="link-btn" onClick={() => setOnlyBad(true)}>
                看差评
              </button>
            </div>
          ) : null}

          <section className="block">
            <div className="section-head compact">
              <div>
                <span className="eyebrow">WHY IT WORKS</span>
                <h2>值得吃的理由</h2>
              </div>
            </div>
            <ul className="highlight-list">
              {dish.highlights.map((h) => (
                <li key={h}>
                  <span className="hl-check">
                    <Icon name="check" size={12} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </section>

          <section className="block">
            <div className="section-head compact">
              <div>
                <span className="eyebrow">REVIEWS</span>
                <h2>大家怎么说</h2>
              </div>
              <button
                type="button"
                className={`filter-chip ${onlyBad ? 'is-active' : ''}`}
                onClick={() => setOnlyBad((v) => !v)}
              >
                只看差评
              </button>
            </div>

            <div className="rating-panel">
              <div className="rating-big">
                <strong className="num">{rating.toFixed(1)}</strong>
                <Stars value={rating} size={13} />
                <span>{count} 条</span>
              </div>
              <div className="rating-bars">
                {dist.map((pct, i) => (
                  <div className="rating-bar-row" key={i}>
                    <span className="num">{5 - i}</span>
                    <span className="rating-bar">
                      <i style={{ width: `${pct}%` }} />
                    </span>
                    <em className="num">{Math.round(pct)}%</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="review-list">
              {visible.map((r) => (
                <ReviewItem review={r} key={r.id} />
              ))}
              {visible.length === 0 ? (
                <div className="empty-reviews">
                  <Icon name="sparkle" size={18} />
                  <p>最近没有差评，放心冲。第一条差评可能由你来写。</p>
                </div>
              ) : null}
            </div>

            <button type="button" className="btn btn-soft full" onClick={() => setSheetOpen(true)}>
              <Icon name="plus" size={16} /> 我也吃过，写一条
            </button>
          </section>

          {similar.length > 0 ? (
            <section className="block">
              <div className="section-head compact">
                <div>
                  <span className="eyebrow">SAME CANTEEN</span>
                  <h2>同食堂还能吃</h2>
                </div>
              </div>
              <div className="mini-strip">
                {similar.map((d) => (
                  <MiniDish dish={d} key={d.id} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="dish-side">
          <div className="buy-card">
            <div className="buy-head">
              <div>
                <span className="buy-label">参考价</span>
                <span className="buy-price num">¥{dish.price}</span>
              </div>
              <FavoriteButton dishId={dish.id} />
            </div>
            <div className="buy-rows">
              <div>
                <span>
                  <Icon name="clock" size={15} /> 现在排队
                </span>
                <b className="num">{open ? `${q.people} 人 · ${q.wait} 分` : '已打烊'}</b>
              </div>
              <div>
                <span>
                  <Icon name="pin" size={15} /> 窗口位置
                </span>
                <b>
                  {canteen.short} {stall.floor} 楼
                </b>
              </div>
              <div>
                <span>
                  <Icon name="flame" size={15} /> 本周热度
                </span>
                <b className="num">{dish.popularity} / 100</b>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary full"
              onClick={() => {
                if (!ateToday) markEaten(dish.id)
                setSheetOpen(true)
              }}
            >
              {ateToday ? '我吃过了，写点评' : '我吃过，写点评'}
            </button>
            <button type="button" className="btn btn-ghost full" onClick={share}>
              <Icon name="share" size={15} /> 复制链接发给室友
            </button>
            <p className="buy-note">评分与排队为演示数据，口味是很私人的事，参考着看。</p>
          </div>

          <div className="side-tip">
            <span className="side-tip-icon">
              <Icon name="sparkle" size={16} />
            </span>
            <p>
              <b>怎么吃不踩雷</b>
              {!open
                ? ` 现在已打烊，明天 ${canteen.hours.split('–')[0].trim()} 开门，先收藏着。`
                : q.people > 18
                  ? ' 现在人太多，建议 13:00 后再来。'
                  : ' 现在去刚好，错峰不用等。'}
              {dish.risk ? ` 记得避开：${dish.risk}。` : ''}
            </p>
          </div>
        </aside>
      </div>

      <div className="mobile-cta">
        <div>
          <span className="num">¥{dish.price}</span>
          <em>{open ? `排队 ${q.wait} 分钟` : '现在已打烊'}</em>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (!ateToday) markEaten(dish.id)
            setSheetOpen(true)
          }}
        >
          写点评
        </button>
      </div>

      {sheetOpen ? <ReviewSheet dish={dish} onClose={() => setSheetOpen(false)} /> : null}
    </div>
  )
}
