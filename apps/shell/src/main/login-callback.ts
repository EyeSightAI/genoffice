/**
 * login-callback.ts — local loopback HTTP server for web-scan login.
 *
 * The web account page fetches http://127.0.0.1:<port>/login?openid=xxx after a
 * successful WeChat scan (it never navigates). This module parses the openid and
 * hands it to the caller. A local loopback server is used instead of a custom
 * deep-link protocol because elevated vs. normal processes cannot reliably talk
 * cross-privilege, and it avoids UAC / registry-association issues.
 */
import { createServer } from 'node:http'
import type { Server } from 'node:http'

let server: Server | null = null
let port = 0

/** Start the callback server once and resolve with its bound port. */
export function startLoginCallback(onOpenid: (openid: string) => void): Promise<number> {
  return new Promise((resolve, reject) => {
    if (server) {
      resolve(port)
      return
    }
    const srv = createServer((req, res) => {
      const url = req.url ?? ''
      const m = url.match(/^\/login\?openid=([^&\s]+)/)
      if (m && m[1]) {
        const openid = decodeURIComponent(m[1])
        if (openid) onOpenid(openid)
      }
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        Connection: 'close',
      })
      res.end('登录成功，可关闭本页')
    })
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address()
      if (addr && typeof addr === 'object') {
        port = addr.port
        server = srv
        resolve(port)
      } else {
        reject(new Error('login callback: no bound port'))
      }
    })
  })
}

export function stopLoginCallback(): void {
  if (server) {
    server.close()
    server = null
    port = 0
  }
}
