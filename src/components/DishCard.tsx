import { canteenById, stallById } from '../data'
import type { Dish } from '../types'
import { go } from '../router'
import { useStore } from '../store'
import { ratingOf } from '../lib'
import { HeartIcon, Icon, Stars } from './Icons'

function openDish(id: string) {
  go(`/dish/${id}`)
}

export function DishTile({ dish, size = 'md' }: { dish: Dish; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`dish-tile tile-${size}`} style={{ background: dish.tone }}>
      <span className="dish-emoji" aria-hidden="true">
        {dish.emoji}
      </span>
    </div>
  )
}

export function FavoriteButton({ dishId }: { dishId: string }) {
  const { favorites, toggleFavorite, notify } = useStore()
  const active = favorites.includes(dishId)
  return (
    <button
      type="button"
      className={`fav-btn ${active ? 'is-active' : ''}`}
      aria-label={active ? '取消收藏' : '收藏'}
      onClick={(event) => {
        event.stopPropagation()
        toggleFavorite(dishId)
        notify(active ? '已取消收藏' : '已加入收藏，在「我的」里能找到')
      }}
    >
      <HeartIcon filled={active} size={17} />
    </button>
  )
}

export function RatingLine({
  dish,
  compact = false,
}: {
  dish: Dish
  compact?: boolean
}) {
  const extra = useStore().myReviews.filter((r) => r.dishId === dish.id)
  const count = dish.reviewCount + extra.length
  const rating = ratingOf(dish, extra)
  return (
    <span className={`rating-line ${compact ? 'is-compact' : ''}`}>
      <strong className="num">{rating.toFixed(1)}</strong>
      <Stars value={rating} size={compact ? 11 : 13} />
      <em>{count} 条</em>
    </span>
  )
}

export function DishTicket({ dish, rank }: { dish: Dish; rank?: number }) {
  const stall = stallById(dish.stallId)
  const canteen = canteenById(stall.canteenId)
  return (
    <article
      className="ticket"
      role="link"
      tabIndex={0}
      onClick={() => openDish(dish.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openDish(dish.id)
        }
      }}
    >
      <div className="ticket-visual" style={{ background: dish.tone }}>
        {rank ? <span className="ticket-rank num">{String(rank).padStart(2, '0')}</span> : null}
        <span className="dish-emoji" aria-hidden="true">
          {dish.emoji}
        </span>
      </div>
      <div className="ticket-body">
        <div className="ticket-head">
          <h3>{dish.name}</h3>
          <FavoriteButton dishId={dish.id} />
        </div>
        <p className="ticket-sub">
          {canteen.short} · {stall.name}
        </p>
        <div className="tag-row">
          {dish.tags.slice(0, 2).map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
          {dish.isNew ? <span className="tag tag-new">新</span> : null}
        </div>
        <div className="ticket-foot">
          <RatingLine dish={dish} compact />
          <span className="ticket-price num">¥{dish.price}</span>
        </div>
      </div>
    </article>
  )
}

export function DishRow({
  dish,
  index,
  showRisk = false,
  reason,
}: {
  dish: Dish
  index: number
  showRisk?: boolean
  reason?: string
}) {
  const stall = stallById(dish.stallId)
  const canteen = canteenById(stall.canteenId)
  return (
    <article
      className="rank-row"
      role="link"
      tabIndex={0}
      onClick={() => openDish(dish.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openDish(dish.id)
        }
      }}
    >
      <span className={`rank-index num ${index <= 3 ? 'is-top' : ''}`}>
        {String(index).padStart(2, '0')}
      </span>
      <div className="rank-thumb" style={{ background: dish.tone }}>
        <span aria-hidden="true">{dish.emoji}</span>
      </div>
      <div className="rank-main">
        <div className="rank-title">
          <h4>{dish.name}</h4>
          <span className="rank-price num">¥{dish.price}</span>
        </div>
        <p className="rank-sub">
          {canteen.short} · {stall.name} · {dish.meals.includes('breakfast') ? '早餐' : '午晚'}
        </p>
        <div className="rank-foot">
          <RatingLine dish={dish} compact />
          {showRisk && dish.risk ? (
            <span className="risk-chip">
              <Icon name="alert" size={11} /> 有雷
            </span>
          ) : reason ? (
            <span className="reason-chip">{reason}</span>
          ) : null}
          <FavoriteButton dishId={dish.id} />
        </div>
      </div>
    </article>
  )
}

export function MiniDish({ dish }: { dish: Dish }) {
  const stall = stallById(dish.stallId)
  return (
    <article
      className="mini-dish"
      role="link"
      tabIndex={0}
      onClick={() => openDish(dish.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openDish(dish.id)
        }
      }}
    >
      <div className="mini-visual" style={{ background: dish.tone }}>
        <span aria-hidden="true">{dish.emoji}</span>
        {dish.isNew ? <span className="mini-new">NEW</span> : null}
      </div>
      <h4>{dish.name}</h4>
      <p>{stall.name}</p>
      <div className="mini-foot">
        <span className="num mini-rating">{dish.rating.toFixed(1)}</span>
        <span className="num">¥{dish.price}</span>
      </div>
    </article>
  )
}
