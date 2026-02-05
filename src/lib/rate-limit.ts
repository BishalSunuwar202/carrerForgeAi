/**
 * In-memory rate limiter for API routes.
 * For production, use Redis (e.g. Upstash) instead.
 */

const windowMs = 60 * 1000 // 1 minute
const maxRequests = 30 // per window per key

const store = new Map<string, { count: number; resetAt: number }>()

function getKey(identifier: string): string {
  return `rl:${identifier}`
}

export function rateLimit(identifier: string): { success: boolean; remaining: number } {
  const key = getKey(identifier)
  const now = Date.now()
  let entry = store.get(key)

  if (!entry) {
    entry = { count: 1, resetAt: now + windowMs }
    store.set(key, entry)
    return { success: true, remaining: maxRequests - 1 }
  }

  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs }
    store.set(key, entry)
    return { success: true, remaining: maxRequests - 1 }
  }

  entry.count += 1
  if (entry.count > maxRequests) {
    return { success: false, remaining: 0 }
  }
  return { success: true, remaining: maxRequests - entry.count }
}

export function getRateLimitIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() ?? "anonymous"
  return ip
}
