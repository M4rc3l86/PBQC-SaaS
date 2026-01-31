import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

export type RateLimitAction = 'login' | 'forgot_password' | 'change_password'

interface RateLimitConfig {
  maxAttempts: number
  windowDuration: number // in seconds
}

const RATE_LIMIT_CONFIGS: Record<RateLimitAction, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowDuration: 15 * 60, // 15 minutes
  },
  forgot_password: {
    maxAttempts: 3,
    windowDuration: 60 * 60, // 1 hour
  },
  change_password: {
    maxAttempts: 3,
    windowDuration: 30 * 60, // 30 minutes
  },
}

export interface RateLimitResult {
  allowed: boolean
  remainingAttempts: number
  retryAfter?: number // seconds until retry is allowed
}

/**
 * Extract client IP from request headers
 * Supports: x-forwarded-for, x-real-ip, cf-connecting-ip
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers()

  // Check Cloudflare connecting IP
  const cfIp = headersList.get('cf-connecting-ip')
  if (cfIp) return cfIp

  // Check x-forwarded-for (may contain multiple IPs, take first one)
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map((ip) => ip.trim())
    if (ips[0]) return ips[0]
  }

  // Check x-real-ip
  const realIp = headersList.get('x-real-ip')
  if (realIp) return realIp

  // Fallback to a generic identifier
  return 'unknown'
}

/**
 * Check if the request is allowed based on rate limit
 */
export async function checkRateLimit(
  identifier: string,
  action: RateLimitAction
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[action]
  const supabase = createAdminClient()

  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowDuration * 1000)

  // Get or create rate limit record
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('action', action)
    .gte('window_start', windowStart.toISOString())
    .maybeSingle()

  if (!existing) {
    // No recent attempts - allow
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
    }
  }

  // Check if window has expired
  const recordWindowStart = new Date(existing.window_start!)
  const windowExpiry = new Date(recordWindowStart.getTime() + config.windowDuration * 1000)

  if (now >= windowExpiry) {
    // Window expired - allow with fresh count
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
    }
  }

  // Check if limit exceeded
  if (existing.attempt_count >= config.maxAttempts) {
    const retryAfter = Math.ceil((windowExpiry.getTime() - now.getTime()) / 1000)
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfter,
    }
  }

  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - existing.attempt_count,
  }
}

/**
 * Record a rate limit attempt
 */
export async function recordRateLimitAttempt(
  identifier: string,
  action: RateLimitAction
): Promise<void> {
  const config = RATE_LIMIT_CONFIGS[action]
  const supabase = createAdminClient()

  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowDuration * 1000)

  // Try to update existing record in current window
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('action', action)
    .gte('window_start', windowStart.toISOString())
    .maybeSingle()

  if (existing) {
    // Check if window has expired
    const recordWindowStart = new Date(existing.window_start!)
    const windowExpiry = new Date(recordWindowStart.getTime() + config.windowDuration * 1000)

    if (now >= windowExpiry) {
      // Window expired - reset count
      await supabase
        .from('rate_limits')
        .update({
          attempt_count: 1,
          last_attempt_at: now.toISOString(),
          window_start: now.toISOString(),
        })
        .eq('id', existing.id)
    } else {
      // Increment count in current window
      await supabase
        .from('rate_limits')
        .update({
          attempt_count: existing.attempt_count + 1,
          last_attempt_at: now.toISOString(),
        })
        .eq('id', existing.id)
    }
  } else {
    // Create new record
    await supabase.from('rate_limits').insert({
      identifier,
      action,
      attempt_count: 1,
      last_attempt_at: now.toISOString(),
      window_start: now.toISOString(),
    })
  }
}

/**
 * Reset rate limit (e.g., on successful login)
 */
export async function resetRateLimit(
  identifier: string,
  action: RateLimitAction
): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('rate_limits')
    .delete()
    .eq('identifier', identifier)
    .eq('action', action)
}
