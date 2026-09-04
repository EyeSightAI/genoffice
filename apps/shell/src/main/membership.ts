/**
 * UToOffice membership: offline card-key activation + local membership state.
 *
 * Card format: `UTO-<base64url(payload)>-<base64url(hmac16)>`
 *   payload = JSON { plan: 'pro', type: 'lifetime' | 'year', exp: number }
 *   exp = expiry ms epoch (ignored for lifetime cards).
 *
 * Activation is fully offline (HMAC-SHA256 signature) — no server required.
 * The secret is hardcoded for MVP; move it to a build-time env injection
 * (GENOFFICE_MEMBERSHIP_SECRET) before going to production.
 *
 * Membership state is persisted at userData/membership.json.
 */

import { createHmac } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SECRET = process.env.GENOFFICE_MEMBERSHIP_SECRET || 'UTO-office-2026-membership-secret'

export type MembershipPlan = 'free' | 'pro'
export type MembershipType = 'lifetime' | 'year'

export interface MembershipStatus {
  plan: MembershipPlan
  /** card type that produced the current pro state (absent when free) */
  type?: MembershipType
  /** ms epoch of activation (absent when free) */
  activatedAt?: number
  /** ms epoch of expiry; null = lifetime (also null when free) */
  expiresAt: number | null
  isPro: boolean
}

export interface CardPayload {
  plan: 'pro'
  type: MembershipType
  /** expiry ms epoch; 0 for lifetime */
  exp: number
}

function sign(data: string): string {
  return createHmac('sha256', SECRET).update(data).digest('base64url').slice(0, 16)
}

/** Generate a signed card (used offline to mint cards for the reseller platform). */
export function generateCard(type: MembershipType): string {
  const exp = type === 'lifetime' ? 0 : Date.now() + 365 * 24 * 60 * 60 * 1000
  const payload: CardPayload = { plan: 'pro', type, exp }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  // sig 固定 16 字符，紧跟 body 拼接（不用分隔符：base64url 本身含 -/_，会干扰分隔解析）
  return `UTO-${body}${sign(body)}`
}

export function verifyCard(
  card: string,
): { ok: boolean; payload?: CardPayload; error?: string } {
  const raw = card.trim()
  if (!raw.startsWith('UTO-')) return { ok: false, error: '卡密格式不正确' }
  const rest = raw.slice(4)
  if (rest.length <= 16) return { ok: false, error: '卡密格式不正确' }
  const sig = rest.slice(-16)
  const body = rest.slice(0, -16)
  if (sign(body) !== sig) return { ok: false, error: '卡密无效，请检查是否输入正确' }
  let payload: CardPayload
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as CardPayload
  } catch {
    return { ok: false, error: '卡密无效' }
  }
  if (payload.plan !== 'pro') return { ok: false, error: '卡密无效' }
  if (payload.type === 'year' && payload.exp > 0 && payload.exp < Date.now()) {
    return { ok: false, error: '卡密已过期' }
  }
  return { ok: true, payload }
}

function membershipPath(userDataDir: string): string {
  return join(userDataDir, 'membership.json')
}

interface StoredMembership {
  plan?: MembershipPlan
  type?: MembershipType
  activatedAt?: number
  expiresAt?: number | null
}

function statusFrom(data: StoredMembership): MembershipStatus {
  const plan = data.plan === 'pro' ? 'pro' : 'free'
  const type = data.type
  const activatedAt = data.activatedAt
  const expiresAt = data.expiresAt ?? null
  const active =
    plan === 'pro' && (type === 'lifetime' || (expiresAt !== null && expiresAt > Date.now()))
  if (!active) return { plan: 'free', expiresAt: null, isPro: false }
  return {
    plan: 'pro',
    type: type === 'year' ? 'year' : 'lifetime',
    activatedAt,
    expiresAt: type === 'lifetime' ? null : expiresAt,
    isPro: true,
  }
}

export function loadMembership(userDataDir: string): MembershipStatus {
  try {
    const p = membershipPath(userDataDir)
    if (!existsSync(p)) return { plan: 'free', expiresAt: null, isPro: false }
    const data = JSON.parse(readFileSync(p, 'utf-8')) as StoredMembership
    return statusFrom(data)
  } catch {
    return { plan: 'free', expiresAt: null, isPro: false }
  }
}

export function activateMembership(userDataDir: string, payload: CardPayload): MembershipStatus {
  const now = Date.now()
  const expiresAt = payload.type === 'lifetime' ? null : payload.exp
  const data: StoredMembership = {
    plan: 'pro',
    type: payload.type,
    activatedAt: now,
    expiresAt,
  }
  writeFileSync(membershipPath(userDataDir), JSON.stringify(data, null, 2) + '\n')
  return statusFrom(data)
}
