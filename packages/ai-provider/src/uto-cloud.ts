/**
 * uto-cloud.ts — UTO cloud AI identity resolver.
 *
 * The unified cloud AI proxy (https://uto-office.cn/api/ai/chat) authenticates
 * and meters by WeChat openid + product, so the client ships no API key. The
 * shell main process registers a resolver that reads the cached login state;
 * the openai-compatible protocol injects the resolved identity into each
 * request body when the provider asks for it (injectIdentity).
 */

let openidResolver: (() => string | null) | null = null
let productResolver: (() => string) | null = null

export function setUtoCloudIdentity(opts: {
  openid: () => string | null
  product: () => string
}): void {
  openidResolver = opts.openid
  productResolver = opts.product
}

export function getUtoCloudIdentity(): { openid: string | null; product: string } {
  return {
    openid: openidResolver?.() ?? null,
    product: productResolver?.() ?? 'office',
  }
}
