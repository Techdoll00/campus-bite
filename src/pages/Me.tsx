import { useState } from 'react'
import { AVOID_OPTIONS, SPICE_LABEL, dishById, dishes } from '../data'
import { go } from '../router'
import { useStore } from '../store'
import { DishRow } from '../components/DishCard'
import { Icon, Stars } from '../components/Icons'

export function MePage() {
  const { prefs, setPrefs, favorites, myReviews, eaten, notify } = useStore()
  const [name, setName] = useState(prefs.nickname)
  const [editing, setEditing] = useState(false)

  const favDishes = favorites.map((id) => dishById(id)).filter((d) => !!d)
  const todayEaten = eaten.filter((e) => new Date(e.at).toDateString() === new Date().toDateString())
  const profileLine = `你能吃${SPICE_LABEL[prefs.spice]}，人均不超过 ¥${prefs.budget}，${
    prefs.avoid.length ? `不吃${prefs.avoid.join('、')}` : '暂时没有忌口'
  }。推荐时已按这个条件过滤。`

  function saveName() {
    const next = name.trim() || '干饭人'
    setPrefs({ ...prefs, nickname: next })
    setName(next)
    setEditing(false)
    notify('昵称已更新')
  }

  function resetAll() {
    if (!window.confirm('会清空本机保存的点评、收藏和偏好，确定吗？')) return
    ;['fd.prefs', 'fd.favorites', 'fd.reviews', 'fd.eaten'].forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <div className="page me-page">
      <header className="profile">
        <div className="avatar">饭</div>
        <div className="profile-main">
          <span className="eyebrow">MY PROFILE</span>
          {editing ? (
            <div className="name-edit">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={12}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName()
                }}
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={saveName}>
                保存
              </button>
            </div>
          ) : (
            <h1>
              {prefs.nickname}
              <button type="button" className="link-btn" onClick={() => setEditing(true)}>
                修改
              </button>
            </h1>
          )}
          <p>青禾大学 · 2024 级 · 计算机学院</p>
        </div>
        <div className="profile-stats">
          <div>
            <strong className="num">{myReviews.length}</strong>
            <span>我的点评</span>
          </div>
          <div>
            <strong className="num">{favorites.length}</strong>
            <span>收藏</span>
          </div>
          <div>
            <strong className="num">{todayEaten.length}</strong>
            <span>今天记录</span>
          </div>
        </div>
      </header>

      <div className="me-grid">
        <div className="me-main">
          <section className="block card-block">
            <div className="section-head compact">
              <div>
                <span className="eyebrow">TASTE PROFILE</span>
                <h2>口味画像</h2>
              </div>
              <span className="section-note">改完立刻生效</span>
            </div>
            <p className="profile-line">{profileLine}</p>

            <div className="pref-field">
              <div className="pref-label">
                <span>辣度承受力</span>
                <em>{SPICE_LABEL[prefs.spice]}</em>
              </div>
              <div className="segmented">
                {SPICE_LABEL.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    className={prefs.spice === i ? 'is-active' : ''}
                    onClick={() => setPrefs({ ...prefs, spice: i as typeof prefs.spice })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pref-field">
              <div className="pref-label">
                <span>一餐预算</span>
                <em className="num">¥{prefs.budget}</em>
              </div>
              <input
                type="range"
                min={8}
                max={30}
                step={1}
                value={prefs.budget}
                onChange={(e) => setPrefs({ ...prefs, budget: Number(e.target.value) })}
                className="range"
                aria-label="一餐预算"
              />
              <div className="range-ticks">
                <span>¥8</span>
                <span>¥30</span>
              </div>
            </div>

            <div className="pref-field">
              <div className="pref-label">
                <span>忌口（推荐时会自动避开）</span>
                <em>{prefs.avoid.length} 项</em>
              </div>
              <div className="avoid-chips">
                {AVOID_OPTIONS.map((item) => {
                  const active = prefs.avoid.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      className={`quick-tag ${active ? 'is-active' : ''}`}
                      onClick={() =>
                        setPrefs({
                          ...prefs,
                          avoid: active ? prefs.avoid.filter((x) => x !== item) : [...prefs.avoid, item],
                        })
                      }
                    >
                      {active ? <Icon name="check" size={12} /> : null}
                      {item}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="block">
            <div className="section-head compact">
              <div>
                <span className="eyebrow">MY REVIEWS</span>
                <h2>我写过的点评</h2>
              </div>
              <span className="section-note">{myReviews.length} 条</span>
            </div>
            {myReviews.length === 0 ? (
              <div className="empty-card">
                <span className="empty-emoji">✍️</span>
                <p>还没写过点评。吃完顺手记两句，能帮下一个人少踩一次雷。</p>
                <button type="button" className="btn btn-soft" onClick={() => go('/rank')}>
                  去挑一道菜
                </button>
              </div>
            ) : (
              <div className="my-review-list">
                {myReviews.map((r) => {
                  const dish = dishById(r.dishId)
                  return (
                    <button
                      type="button"
                      className="my-review"
                      key={r.id}
                      onClick={() => dish && go(`/dish/${dish.id}`)}
                    >
                      <span className="my-review-emoji" style={{ background: dish?.tone }}>
                        {dish?.emoji}
                      </span>
                      <span className="my-review-body">
                        <span className="my-review-title">
                          {dish?.name ?? '已下架菜品'}
                          <Stars value={r.rating} size={11} />
                        </span>
                        <span className="my-review-text">{r.text}</span>
                        <span className="my-review-date">{r.date}</span>
                      </span>
                      <Icon name="chevronRight" size={15} className="muted-icon" />
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="me-side">
          <section className="block card-block">
            <div className="section-head compact">
              <div>
                <span className="eyebrow">SAVED</span>
                <h2>我的收藏</h2>
              </div>
              <span className="section-note">{favDishes.length}</span>
            </div>
            {favDishes.length === 0 ? (
              <div className="empty-card slim">
                <p>点菜名旁边的爱心，会收藏到这里。</p>
              </div>
            ) : (
              <div className="fav-list">
                {favDishes.map((d, i) => (
                  <DishRow dish={d} index={i + 1} key={d.id} />
                ))}
              </div>
            )}
          </section>

          <section className="about-card">
            <span className="eyebrow">ABOUT</span>
            <h3>关于「饭点」</h3>
            <p>
              一个只解决一件事的工具：让青禾大学的学生在 10 秒内决定这顿吃什么，并且尽量不踩雷。
            </p>
            <ul>
              <li>推荐理由透明：偏好、预算、排队时间都算进去了</li>
              <li>黑榜只看最近 7 天的真实差评，不挂人，只避雷</li>
              <li>当前为演示版本，食堂与菜品数据为虚构，点评保存在本机</li>
            </ul>
            <p className="about-meta">共 {dishes.length} 道菜 · 3 个食堂 · 12 个窗口</p>
          </section>

          <button type="button" className="danger-link" onClick={resetAll}>
            清空本机数据
          </button>
        </aside>
      </div>
    </div>
  )
}
