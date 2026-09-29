/**
 * wx-login.ts — WeChat scan login + unified membership module (pluggable, independent of upstream)
 *
 * Talks to auth-system /api/wx/* /api/member/* /api/products:
 *   - createLoginQrcode(): generate login QR code (scene=token)
 *   - pollLogin(token):    poll token for WeChat binding (returns openid)
 *   - fetchMember(openid): fetch membership expiry
 *   - fetchProducts():     fetch UTO product list
 *
 * Local state is cached at userData/wx-login.json (openid + expiry), offline-tolerant;
 * the server is the source of truth.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SERVER_BASE = 'https://uto-office.cn'
const TIMEOUT_MS = 15000

export interface WxLoginQrcode {
  token: string
  qrcode: string // base64 JPEG, rendered via data:image/jpeg;base64,xxx
}

export interface MemberInfo {
  openid: string
  expireTime: string | null // 'YYYY-MM-DD HH:mm:ss' or null (not subscribed)
  isPro: boolean
}

export interface ProductInfo {
  id: number
  name: string
  description: string
  icon: string
  sort_order: number
  entry_type: string
}

export interface WxLoginState {
  openid: string
  expireTime: string | null
  isPro: boolean
}

interface ApiResp {
  code: number
  msg: string
  data: unknown
}

async function apiGet(path: string): Promise<ApiResp> {
  const res = await fetch(`${SERVER_BASE}${path}`, {
    method: 'GET',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  return (await res.json()) as ApiResp
}

/** Generate login QR code */
export async function createLoginQrcode(): Promise<WxLoginQrcode | null> {
  try {
    const resp = await apiGet('/api/wx/qrcode')
    if (resp.code !== 0) return null
    const d = resp.data as { token?: string; qrcode?: string }
    if (!d.token || !d.qrcode) return null
    return { token: d.token, qrcode: d.qrcode }
  } catch {
    return null
  }
}

/** Poll token: openid when bound, null when not, 'EXPIRED' when expired */
export async function pollLogin(token: string): Promise<string | null> {
  try {
    const resp = await apiGet(`/api/wx/poll?token=${encodeURIComponent(token)}`)
    if (resp.code !== 0) return null
    const d = resp.data as { bound?: boolean; expired?: boolean; openid?: string }
    if (d.bound && d.openid) return d.openid
    return null
  } catch {
    return null
  }
}

/** Fetch membership expiry */
export async function fetchMember(openid: string): Promise<MemberInfo> {
  try {
    const resp = await apiGet(`/api/member/info?openid=${encodeURIComponent(openid)}`)
    if (resp.code !== 0) return { openid, expireTime: null, isPro: false }
    const d = resp.data as { expire_time?: string | null; is_member?: boolean }
    return {
      openid,
      expireTime: d.expire_time ?? null,
      isPro: d.is_member === true,
    }
  } catch {
    return { openid, expireTime: null, isPro: false }
  }
}

/** Fetch product list */
export async function fetchProducts(): Promise<ProductInfo[]> {
  try {
    const resp = await apiGet('/api/products')
    if (resp.code !== 0) return []
    const arr = resp.data
    if (!Array.isArray(arr)) return []
    return arr.map((p) => {
      const o = p as Record<string, unknown>
      return {
        id: Number(o.id ?? 0),
        name: String(o.name ?? ''),
        description: String(o.description ?? ''),
        icon: String(o.icon ?? ''),
        sort_order: Number(o.sort_order ?? 0),
        entry_type: String(o.entry_type ?? 'app'),
      }
    })
  } catch {
    return []
  }
}

/** Generate buy-membership payment QR code */
export async function createBuyQrcode(): Promise<WxLoginQrcode | null> {
  try {
    const resp = await apiGet('/api/wx/buy_qrcode')
    if (resp.code !== 0) return null
    const d = resp.data as { token?: string; qrcode?: string }
    if (!d.token || !d.qrcode) return null
    return { token: d.token, qrcode: d.qrcode }
  } catch {
    return null
  }
}

/** Poll payment QR code: expiry when paid */
export async function pollBuy(
  token: string,
): Promise<{ paid: boolean; expireTime: string | null }> {
  try {
    const resp = await apiGet(`/api/wx/poll_buy?token=${encodeURIComponent(token)}`)
    if (resp.code !== 0) return { paid: false, expireTime: null }
    const d = resp.data as { paid?: boolean; expire_time?: string | null }
    return { paid: d.paid === true, expireTime: d.expire_time ?? null }
  } catch {
    return { paid: false, expireTime: null }
  }
}

// ── Local state ─────────────────────────────────────────────

function statePath(userDataDir: string): string {
  return join(userDataDir, 'wx-login.json')
}

export function readWxLogin(userDataDir: string): WxLoginState | null {
  try {
    const p = statePath(userDataDir)
    if (!existsSync(p)) return null
    const s = JSON.parse(readFileSync(p, 'utf-8')) as WxLoginState
    if (!s.openid) return null
    return s
  } catch {
    return null
  }
}

export function writeWxLogin(userDataDir: string, state: WxLoginState): void {
  try {
    writeFileSync(statePath(userDataDir), JSON.stringify(state, null, 2) + '\n')
  } catch {
    /* ignore */
  }
}

export function clearWxLogin(userDataDir: string): void {
  try {
    const p = statePath(userDataDir)
    if (existsSync(p)) writeFileSync(p, '{}')
  } catch {
    /* ignore */
  }
}
