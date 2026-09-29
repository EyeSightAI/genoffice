/**
 * wx-login.ts — 微信扫码登录 + 统一会员模块（插拔式，独立于上游源码）
 *
 * 与服务器 auth-system 的 /api/wx/* /api/member/* /api/products 对接：
 *   - createLoginQrcode(): 生成登录小程序码（scene=token）
 *   - pollLogin(token):    轮询 token 是否被微信绑定（返回 openid）
 *   - fetchMember(openid): 查会员到期时间
 *   - fetchProducts():     查 UTO 产品列表
 *
 * 本地状态存 userData/wx-login.json（openid + 到期时间），启动离线可用；
 * 服务器是唯一真相来源。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SERVER_BASE = 'https://uto-office.cn'
const TIMEOUT_MS = 15000

export interface WxLoginQrcode {
  token: string
  qrcode: string // base64 JPEG，前端用 data:image/jpeg;base64,xxx 显示
}

export interface MemberInfo {
  openid: string
  expireTime: string | null // 'YYYY-MM-DD HH:mm:ss' 或 null（未开通）
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

/** 生成登录小程序码 */
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

/** 轮询 token：已绑定返回 openid，未绑定返回 null，过期返回 'EXPIRED' */
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

/** 查会员到期时间 */
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

/** 查产品列表 */
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

// ── 本地状态 ─────────────────────────────────────────────

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
