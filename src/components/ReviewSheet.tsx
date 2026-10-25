import { useEffect, useState } from 'react'
import type { Dish } from '../types'
import { useStore } from '../store'
import { Icon } from './Icons'

const RATING_TEXT = ['', '踩雷', '一般', '还行', '不错', '封神']

export function ReviewSheet({ dish, onClose }: { dish: Dish; onClose: () => void }) {
  const { prefs, addReview, notify } = useStore()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [anon, setAnon] = useState(true)
  const [tags, setTags] = useState<string[]>([])

  const quickTags = [...new Set([...dish.tags, '分量足', '偏咸', '排队久', '会再来', '不会再点'])]

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  function submit() {
    if (rating === 0) {
      notify('先给个星级吧，一星也是态度')
      return
    }
    addReview({
      id: `mine-${Date.now()}`,
      dishId: dish.id,
      author: anon ? '匿名同学' : prefs.nickname,
      rating,
      text: text.trim() || '只打了分，先占个位。',
      tags,
      date: '刚刚',
      likes: 0,
      mine: true,
    })
    notify('点评已发布 · 谢谢你帮同学避雷')
    onClose()
  }

  const shown = hover || rating

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`点评 ${dish.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="sheet-head">
          <div>
            <span className="eyebrow">WRITE A REVIEW</span>
            <h3>给「{dish.name}」写两句</h3>
          </div>
          <button type="button" className="icon-btn" aria-label="关闭" onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="star-picker" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={shown >= n ? 'is-on' : ''}
              aria-label={`${n} 星`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
            >
              <Icon name="star" size={30} />
            </button>
          ))}
          <span className="star-label">{RATING_TEXT[shown] || '点星星打分'}</span>
        </div>

        <div className="quick-tag-row">
          {quickTags.map((t) => {
            const active = tags.includes(t)
            return (
              <button
                key={t}
                type="button"
                className={`quick-tag ${active ? 'is-active' : ''}`}
                onClick={() =>
                  setTags((prev) => (active ? prev.filter((x) => x !== t) : [...prev, t].slice(0, 4)))
                }
              >
                {t}
              </button>
            )
          })}
        </div>

        <textarea
          className="review-input"
          rows={3}
          maxLength={140}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="比如：肉给得挺多，但 12 点去要等 15 分钟，赶课别来。"
        />
        <div className="review-counter">{text.length}/140</div>

        <label className="anon-toggle">
          <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
          匿名发布（推荐）
        </label>

        <button type="button" className="btn btn-primary btn-lg full" onClick={submit}>
          发布点评
          <Icon name="arrowRight" size={17} />
        </button>
        <p className="sheet-note">演示版本：点评保存在你的浏览器本地，刷新不会丢。</p>
      </div>
    </div>
  )
}
