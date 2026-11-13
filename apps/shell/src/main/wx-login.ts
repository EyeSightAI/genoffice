/**
 * wx-login.ts — WeChat scan login (web callback) + unified membership module
 * (pluggable, independent of upstream)
 *
 * Talks to auth-system /api/member/* /api/account/*:
 *   - fetchMember(openid):      fetch membership (plan + quota)
 *   - fetchAccountToken(openid): get a one-time token for the account-center page
 *
 * Login itself is web-scan based: the main process opens
 * https://uto-office.cn/account?login=1&cbport=<port> in the browser and a local
 * loopback HTTP server (login-callback.ts) receives the openid. Local state is
 * cached at userData/wx-login.json (openid + plan), offline-tolerant; the server
 * is the source of truth.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SERVER_BASE = 'https://uto-office.cn'
const TIMEOUT_MS = 15000

export interface MemberInfo {
  openid: string
  expireTime: string | null // kept for backend compat; UI shows plan + quota instead
  isMember: boolean
  planName: string
  quotaTokens: number
  usedTokens: number
  remainingTokens: number
}

export interface WxLoginState {
  openid: string
  expireTime: string | null
  isMember: boolean
  planName: string
  quotaTokens: number
  usedTokens: number
  remainingTokens: number
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

async function apiPost(path: string, body: unknown): Promise<ApiResp> {
  const res = await fetch(`${SERVER_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  return (await res.json()) as ApiResp
}

/** Fetch membership plan + quota */
export async function fetchMember(openid: string): Promise<MemberInfo> {
  try {
    const resp = await apiGet(`/api/member/info?openid=${encodeURIComponent(openid)}`)
    if (resp.code !== 0) return emptyMember(openid)
    const d = resp.data as {
      expire_time?: string | null
      is_member?: boolean
      plan_name?: string
      quota_tokens?: number
      used_tokens?: number
      remaining_tokens?: number
    }
    return {
      openid,
      expireTime: d.expire_time ?? null,
      isMember: d.is_member === true,
      planName: d.plan_name ?? '体验版',
      quotaTokens: d.quota_tokens ?? 0,
      usedTokens: d.used_tokens ?? 0,
      remainingTokens: d.remaining_tokens ?? 0,
    }
  } catch {
    return emptyMember(openid)
  }
}

/** Get a one-time token for the account-center page (openid stays out of the URL) */
export async function fetchAccountToken(openid: string): Promise<string | null> {
  try {
    const resp = await apiPost('/api/account/token', { openid })
    if (resp.code !== 0) return null
    return (resp.data as { token?: string }).token ?? null
  } catch {
    return null
  }
}

function emptyMember(openid: string): MemberInfo {
  return {
    openid,
    expireTime: null,
    isMember: false,
    planName: '体验版',
    quotaTokens: 0,
    usedTokens: 0,
    remainingTokens: 0,
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
