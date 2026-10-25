export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'night'

export type Spice = 0 | 1 | 2 | 3

export interface Canteen {
  id: string
  name: string
  short: string
  desc: string
  location: string
  hours: string
  floors: number
  tag: string
  tone: string
}

export interface Stall {
  id: string
  canteenId: string
  name: string
  floor: number
  baseQueue: number
}

export interface Dish {
  id: string
  stallId: string
  name: string
  price: number
  rating: number
  reviewCount: number
  emoji: string
  tone: string
  tags: string[]
  spice: Spice
  meals: Meal[]
  desc: string
  highlights: string[]
  risk?: string
  riskLevel?: 'low' | 'mid' | 'high'
  isNew?: boolean
  popularity: number
  avoid?: string[]
}

export interface Review {
  id: string
  dishId: string
  author: string
  rating: number
  text: string
  tags: string[]
  date: string
  likes: number
  mine?: boolean
}

export interface Prefs {
  spice: Spice
  budget: number
  avoid: string[]
  nickname: string
}

export interface EatenRecord {
  dishId: string
  at: number
}
