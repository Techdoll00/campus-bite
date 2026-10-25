import { canteenById, dishes, stallById, stalls } from './data'
import type { Canteen, Dish, Meal, Prefs, Review } from './types'

export const MEAL_LABEL: Record<Meal, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  night: '夜宵',
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function currentMeal(d = new Date()): Meal {
  const h = d.getHours() + d.getMinutes() / 60
  if (h >= 5.5 && h < 10) return 'breakfast'
  if (h >= 10 && h < 15.5) return 'lunch'
  if (h >= 15.5 && h < 21.5) return 'dinner'
  return 'night'
}

export function mealContext(d = new Date()): { meal: Meal; preview: boolean } {
  const h = d.getHours() + d.getMinutes() / 60
  if (h >= 23 || h < 5.5) return { meal: 'lunch', preview: true }
  return { meal: currentMeal(d), preview: false }
}

export function greeting(d = new Date()) {
  const h = d.getHours()
  if (h < 5) return '夜深了'
  if (h < 10) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  if (h < 23) return '晚上好'
  return '夜深了'
}

export function isWeekend(d = new Date()) {
  const day = d.getDay()
  return day === 0 || day === 6
}

export function timeLabel(d = new Date()) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function weekLabel(d = new Date()) {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
}

export function isToday(ts: number) {
  return new Date(ts).toDateString() === new Date().toDateString()
}

export function isOpen(canteen: Canteen, d = new Date()) {
  const h = d.getHours() + d.getMinutes() / 60
  if (canteen.id === 'sw') return h >= 10 && h < 23
  if (canteen.id === 'ml') return h >= 7 && h < 20.5
  return h >= 6.5 && h < 21
}

export function hashSeed(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rushFactor(d = new Date()) {
  const h = d.getHours() + d.getMinutes() / 60
  if (h >= 11.5 && h < 12.8) return 1.55
  if (h >= 12.8 && h < 13.6) return 1.05
  if (h >= 17.3 && h < 18.6) return 1.4
  if (h >= 7.2 && h < 8.2) return 1.25
  if (h >= 21 && h < 22.8) return 0.75
  if (h >= 14.2 && h < 16) return 0.35
  return 0.6
}

export interface QueueInfo {
  people: number
  wait: number
  level: 'low' | 'mid' | 'high'
}

export function queueFor(stallId: string, d = new Date()): QueueInfo {
  const stall = stallById(stallId)
  const bucket = Math.floor(d.getTime() / 60000)
  const rand = mulberry32(hashSeed(`${stallId}-${bucket}`))
  const raw = stall.baseQueue * rushFactor(d) * (0.78 + rand() * 0.5)
  const people = Math.max(0, Math.round(raw))
  const wait = Math.max(1, Math.round(people * 0.6))
  const level: QueueInfo['level'] = people >= 22 ? 'high' : people >= 10 ? 'mid' : 'low'
  return { people, wait, level }
}

export function canteenQueue(canteenId: string, d = new Date()) {
  const list = stalls.filter((s) => s.canteenId === canteenId).map((s) => queueFor(s.id, d))
  const avg = list.reduce((sum, q) => sum + q.people, 0) / Math.max(1, list.length)
  const level: QueueInfo['level'] = avg >= 22 ? 'high' : avg >= 10 ? 'mid' : 'low'
  return { avg: Math.round(avg), level }
}

export const QUEUE_TEXT: Record<QueueInfo['level'], string> = {
  low: '几乎不用等',
  mid: '等 5–10 分钟',
  high: '排到怀疑人生',
}

export function walkMinutes(canteenId: string) {
  if (canteenId === 'hx') return 6
  if (canteenId === 'ml') return 4
  return 8
}

export function dishOpen(dish: Dish, d = new Date()) {
  return isOpen(canteenById(stallById(dish.stallId).canteenId), d)
}

export function distribution(rating: number) {
  if (rating >= 4.6) return [0.7, 1.3, 4, 17, 77]
  if (rating >= 4.3) return [1, 2.2, 8, 24, 64.8]
  if (rating >= 4.0) return [2, 3.2, 12, 30, 52.8]
  if (rating >= 3.8) return [3, 6, 18, 32, 41]
  return [4.5, 8.5, 24, 33, 30]
}

const AUTHORS = [
  '干饭不加香菜',
  '一勺辣椒',
  '三楼靠窗',
  '早八幸存者',
  '碳水教父',
  '图书馆钉子户',
  '不吃葱人士',
  '夜宵巡逻队',
  '小陈',
  '阿树',
  '匿名同学',
  '大四老油条',
]

const GOOD = [
  '分量很足，男生一份刚刚好。',
  '阿姨今天手没抖，给的比上次多。',
  '排队十分钟，出餐比想象中快。',
  '汤是现熬的，能喝出来不是勾兑的。',
  '在这个价位里算很能打了。',
  '和室友连吃三天，还没腻。',
  '加个蛋更香，隐藏吃法。',
  '比上学期好吃了，感觉换了师傅。',
  '建议错峰来，12 点那波人真的多。',
  '吃完顺路买杯绿豆沙，完美。',
]

const BAD = [
  '周三去的，明显不如周末新鲜。',
  '等了快 25 分钟，赶课千万别来。',
  '咸得我下午一直在喝水。',
  '分量比上学期少了，价格还涨了。',
  '看着比吃着香，有点失望。',
  '高峰期品质不稳定，建议错峰。',
]

export function reviewsFor(dish: Dish, extra: Review[] = []): Review[] {
  const rand = mulberry32(hashSeed(dish.id + '-reviews'))
  const count = 3 + Math.floor(rand() * 2)
  const list: Review[] = []
  for (let i = 0; i < count; i++) {
    const positive = rand() < clamp((dish.rating - 3.2) / 1.6, 0.2, 0.94)
    const author = AUTHORS[Math.floor(rand() * AUTHORS.length)]
    const pool = positive ? GOOD : BAD
    const text = pool[Math.floor(rand() * pool.length)]
    const rating = positive ? (rand() < 0.6 ? 5 : 4) : rand() < 0.5 ? 3 : 2
    const days = 1 + Math.floor(rand() * 16)
    list.push({
      id: `${dish.id}-r${i}`,
      dishId: dish.id,
      author,
      rating,
      text,
      tags: dish.tags.slice(0, 2),
      date: days === 1 ? '昨天' : `${days} 天前`,
      likes: Math.floor(rand() * 48),
    })
  }
  return [...extra, ...list].sort((a, b) => Number(!!b.mine) - Number(!!a.mine))
}

export interface Recommendation {
  dish: Dish
  score: number
  reasons: string[]
  wait: number
}

export function recommendFor(
  prefs: Prefs,
  meal: Meal,
  seed: number,
  exclude?: string,
): Recommendation[] {
  const rand = mulberry32(hashSeed(`rec-${seed}-${meal}-${prefs.spice}-${prefs.budget}`))
  const scored: Recommendation[] = []

  for (const dish of dishes) {
    if (!dish.meals.includes(meal)) continue
    if (dish.id === exclude) continue
    if ((dish.avoid ?? []).some((a) => prefs.avoid.includes(a))) continue
    if (dish.price > prefs.budget + 5) continue
    if (prefs.spice === 0 && dish.spice > 1) continue

    const open = dishOpen(dish)
    const wait = open ? queueFor(dish.stallId).wait : 0
    const role = dishRole(dish)
    let score = dish.rating * 14 + dish.popularity * 0.18
    const reasons: string[] = []

    if ((meal === 'lunch' || meal === 'dinner') && role !== 'main') {
      score -= role === 'snack' ? 12 : 30
    }

    if (dish.spice <= prefs.spice) {
      score += 4
      if (prefs.spice > 0 && dish.spice >= 1) reasons.push('辣度合你口味')
    } else {
      score -= (dish.spice - prefs.spice) * 22
    }

    if (dish.price <= prefs.budget) {
      score += 3
      if (dish.price <= 10) reasons.push(`${dish.price} 元吃饱`)
    } else {
      score -= (dish.price - prefs.budget) * 2.5
    }

    if (!open) {
      score -= 6
    } else if (wait >= 18) {
      score -= 14
    } else if (wait <= 7) {
      score += 6
      reasons.push('现在几乎不用排队')
    }

    if (dish.rating >= 4.6) reasons.push(`评分 ${dish.rating.toFixed(1)}，本周食堂前 3`)
    if (dish.isNew) reasons.push('新菜上架不到一周')
    if (prefs.avoid.length > 0) reasons.push(`已为你避开${prefs.avoid.join('、')}`)
    if (reasons.length < 2 && dish.highlights[0]) reasons.push(dish.highlights[0])

    score += rand() * 14

    scored.push({
      dish,
      score: Math.round(score),
      reasons: reasons.slice(0, 3),
      wait,
    })
  }

  return scored.sort((a, b) => b.score - a.score)
}

export function pickRecommendation(
  prefs: Prefs,
  meal: Meal,
  seed: number,
  exclude?: string,
): Recommendation | null {
  const list = recommendFor(prefs, meal, seed, exclude)
  if (list.length === 0) return null
  const top = list.slice(0, 8)
  const rand = mulberry32(hashSeed(`pick-${seed}`))
  return top[Math.floor(rand() * top.length)]
}

export function bestRecommendation(prefs: Prefs, meal: Meal): Recommendation | null {
  const list = recommendFor(prefs, meal, 1)
  if (list.length === 0) return null
  const elite = list.filter((item) => item.dish.rating >= 4.7 && dishRole(item.dish) === 'main')
  return (elite.length > 0 ? elite : list)[0]
}

export function topDishes(meal: Meal, limit = 3) {
  return [...dishes]
    .filter((d) => d.meals.includes(meal) && d.rating >= 4.2)
    .sort((a, b) => b.rating * 100 + b.popularity - (a.rating * 100 + a.popularity))
    .slice(0, limit)
}

export function weeklyTop(limit = 3) {
  return [...dishes]
    .filter((d) => d.rating >= 4.4)
    .sort((a, b) => b.rating * 20 + b.popularity * 0.5 - (a.rating * 20 + a.popularity * 0.5))
    .slice(0, limit)
}

export function risks(limit = 3) {
  return [...dishes]
    .filter((d) => d.risk)
    .sort((a, b) => {
      const rank = { high: 0, mid: 1, low: 2 }
      return (rank[a.riskLevel ?? 'low'] ?? 3) - (rank[b.riskLevel ?? 'low'] ?? 3) || a.rating - b.rating
    })
    .slice(0, limit)
}

export function dishMeta(dish: Dish) {
  const stall = stallById(dish.stallId)
  const canteen = canteenById(stall.canteenId)
  return { stall, canteen }
}

export function dishRole(dish: Dish): 'main' | 'snack' | 'drink' | 'dessert' {
  if (dish.tags.some((t) => ['饮品', '解暑'].includes(t))) return 'drink'
  if (dish.tags.some((t) => ['甜品', '奶香'].includes(t))) return 'dessert'
  if (dish.tags.some((t) => ['小吃', '夜宵', '加餐'].includes(t))) return 'snack'
  return 'main'
}

export function reviewExtraKey(dishId: string) {
  return `fd.reviews.${dishId}`
}

export function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota errors */
  }
}

export function scoreTone(score: number) {
  if (score >= 85) return 'hot'
  if (score >= 72) return 'warm'
  return 'plain'
}

export function scoreText(score: number) {
  if (score >= 85) return '闭眼冲'
  if (score >= 72) return '可以试'
  return '谨慎点'
}

export function ratingOf(dish: Dish, mine: Review[]) {
  const own = mine.filter((r) => r.dishId === dish.id)
  if (own.length === 0) return dish.rating
  const base = dish.rating * dish.reviewCount
  const total = dish.reviewCount + own.length
  return (base + own.reduce((sum, r) => sum + r.rating, 0)) / total
}


