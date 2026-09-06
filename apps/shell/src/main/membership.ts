/**
 * UToOffice membership: online card-key activation against the auth system.
 *
 * Backend: FastAPI multi-app authorization system (see 卡密系统对接文档.md).
 *   - base  : http://47.109.16.117:8088
 *   - app_key: 73379542474545c4b1ab8913647dea32 (UToOffice app)
 *
 * Flow:
 *   device_id = stable machine fingerprint (CPU + board serial + MAC + host)
 *   activate  -> POST /api/auth/activate  { app_key, device_id, auth_code }
 *   check     -> POST /api/auth/check     { app_key, device_id }
 *
 * "一机一码" (max_device=1): a card is bound to one device_id. Re-activating
 * on a new machine re-binds (换机) and the server returns the original expiry.
 *
 * valid_days == 9999  => lifetime ("永久"). Server returns expire_time as
 * "永久" for lifetime cards, or "YYYY-MM-DD HH:mm:ss" otherwise.
 *
 * Local state is cached at userData/membership.json (device_id + expiry) so
 * the app starts offline-tolerant; server is the source of truth.
 */

import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as os from 'node:os'
import type { MembershipPackage, MembershipStatus } from '../shared/home-api'

const SERVER_BASE = 'http://47.109.16.117:8088'
const APP_KEY = '73379542474545c4b1ab8913647dea32'
const TIMEOUT_MS = 10000
const LIFETIME_DAYS = 9999

interface StoredMembership {
  deviceId: string
  code: string
  expireTime: string | null // 'YYYY-MM-DD HH:mm:ss' 或 '永久'
  remainDays: number
  activatedAt: number
  lastCheck: number
}

function membershipPath(userDataDir: string): string {
  return join(userDataDir, 'membership.json')
}

function readStore(userDataDir: string): StoredMembership | null {
  try {
    const p = membershipPath(userDataDir)
    if (!existsSync(p)) return null
    return JSON.parse(readFileSync(p, 'utf-8')) as StoredMembership
  } catch {
    return null
  }
}

function writeStore(userDataDir: string, s: StoredMembership): void {
  try {
    writeFileSync(membershipPath(userDataDir), JSON.stringify(s, null, 2) + '\n')
  } catch {
    /* ignore */
  }
}

/** stable machine fingerprint — several hardware bits so swapping one part
 *  (NIC/board) does not change the id; SHA-256 hex, 32 chars. */
function machineFingerprint(): string {
  const parts: string[] = []
  const run = (cmd: string): string => {
    try {
      return execSync(cmd, { encoding: 'utf8', timeout: 3000 }).trim()
    } catch {
      return ''
    }
  }
  const cpu = run('wmic cpu get ProcessorId /value')
  if (cpu) parts.push(cpu)
  const board = run('wmic baseboard get SerialNumber /value')
  if (board) parts.push(board)
  try {
    const macs = Object.values(os.networkInterfaces())
      .flat()
      .filter((n): n is os.NetworkInterfaceInfo => !!n && !!n.mac && n.mac !== '00:00:00:00:00:00')
      .map((n) => n.mac)
    parts.push([...new Set(macs)].sort().join(','))
  } catch {
    /* ignore */
  }
  parts.push(`${os.hostname()}|${os.arch()}`)
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 32)
}

function getOrCreateDeviceId(userDataDir: string): string {
  const store = readStore(userDataDir)
  if (store?.deviceId) return store.deviceId
  const id = machineFingerprint()
  writeStore(userDataDir, {
    deviceId: id,
    code: '',
    expireTime: null,
    remainDays: 0,
    activatedAt: 0,
    lastCheck: Date.now(),
  })
  return id
}

interface ApiResp {
  code: number
  msg: string
  data: Record<string, unknown>
}

async function apiPost(path: string, body: Record<string, unknown>): Promise<ApiResp> {
  const res = await fetch(`${SERVER_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  return (await res.json()) as ApiResp
}

/** expire_time string -> ms epoch (null for "永久" / missing). */
function parseExpire(expireTime: unknown): number | null {
  if (typeof expireTime !== 'string') return null
  if (expireTime === '永久') return null
  const t = Date.parse(expireTime.replace(' ', 'T'))
  return Number.isNaN(t) ? null : t
}

function isLifetime(remainDays: unknown, expireTime: unknown): boolean {
  if (typeof remainDays === 'number' && remainDays >= LIFETIME_DAYS) return true
  return expireTime === '永久'
}

export function loadMembership(userDataDir: string): MembershipStatus {
  const store = readStore(userDataDir)
  if (!store) return { plan: 'free', expiresAt: null, isPro: false }
  if (isLifetime(store.remainDays, store.expireTime)) {
    return {
      plan: 'pro',
      type: 'lifetime',
      activatedAt: store.activatedAt || undefined,
      expiresAt: null,
      isPro: true,
    }
  }
  const exp = parseExpire(store.expireTime)
  if (exp && exp > Date.now()) {
    return {
      plan: 'pro',
      type: 'year',
      activatedAt: store.activatedAt || undefined,
      expiresAt: exp,
      isPro: true,
    }
  }
  return { plan: 'free', expiresAt: null, isPro: false }
}

export async function activateMembership(
  userDataDir: string,
  card: string,
): Promise<{ ok: boolean; status?: MembershipStatus; error?: string }> {
  const deviceId = getOrCreateDeviceId(userDataDir)
  try {
    const resp = await apiPost('/api/auth/activate', {
      app_key: APP_KEY,
      device_id: deviceId,
      auth_code: card,
    })
    if (resp.code !== 0) return { ok: false, error: resp.msg || '激活失败' }
    const d = resp.data
    const expireTime = typeof d.expire_time === 'string' ? d.expire_time : null
    const remainDays = typeof d.remain_days === 'number' ? d.remain_days : 0
    const prev = readStore(userDataDir)
    writeStore(userDataDir, {
      deviceId,
      code: typeof d.code === 'string' ? d.code : card,
      expireTime,
      remainDays,
      activatedAt: prev?.activatedAt || Date.now(),
      lastCheck: Date.now(),
    })
    return { ok: true, status: loadMembership(userDataDir) }
  } catch {
    return { ok: false, error: '网络连接失败，请检查网络后重试' }
  }
}

/** Reconcile against the server (called at startup; falls back to cache). */
export async function checkMembership(userDataDir: string): Promise<MembershipStatus> {
  const deviceId = getOrCreateDeviceId(userDataDir)
  const prev = readStore(userDataDir)
  try {
    const resp = await apiPost('/api/auth/check', { app_key: APP_KEY, device_id: deviceId })
    if (resp.code !== 0) return loadMembership(userDataDir)
    const d = resp.data
    if (d.activated === true) {
      writeStore(userDataDir, {
        deviceId,
        code: typeof d.code === 'string' ? d.code : prev?.code ?? '',
        expireTime: typeof d.expire_time === 'string' ? d.expire_time : null,
        remainDays: typeof d.remain_days === 'number' ? d.remain_days : 0,
        activatedAt: prev?.activatedAt || Date.now(),
        lastCheck: Date.now(),
      })
      return loadMembership(userDataDir)
    }
    return { plan: 'free', expiresAt: null, isPro: false }
  } catch {
    return loadMembership(userDataDir)
  }
}

/** Fetch purchasable packages (含酷发卡 pay_url). */
export async function getPackages(): Promise<MembershipPackage[]> {
  try {
    const resp = await apiPost('/api/v1/goods/cate', { appid: APP_KEY })
    if (resp.code !== 0) return []
    const arr = Array.isArray(resp.data) ? resp.data : []
    return arr.map((g) => ({
      goodsId: String((g as Record<string, unknown>).goods_id ?? ''),
      name: String((g as Record<string, unknown>).goods_name ?? ''),
      price: String((g as Record<string, unknown>).price ?? ''),
      validDays: Number((g as Record<string, unknown>).valid_days ?? 0),
      stock: Number((g as Record<string, unknown>).stock ?? 0),
      payUrl: String((g as Record<string, unknown>).pay_url ?? ''),
    }))
  } catch {
    return []
  }
}
