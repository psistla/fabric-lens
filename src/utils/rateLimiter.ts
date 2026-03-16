import { ADMIN_RATE_LIMIT, ADMIN_RATE_WARNING_THRESHOLD } from '@/utils/constants';

const HOUR_MS = 60 * 60 * 1000;

export interface RateLimitUsage {
  count: number;
  limit: number;
  resetAt: Date;
}

export class AdminApiRateLimiter {
  private count = 0;
  private windowStart = Date.now();

  private resetIfNeeded(): void {
    if (Date.now() - this.windowStart >= HOUR_MS) {
      this.count = 0;
      this.windowStart = Date.now();
    }
  }

  canMakeRequest(): boolean {
    this.resetIfNeeded();
    return this.count < ADMIN_RATE_LIMIT;
  }

  trackRequest(): void {
    this.resetIfNeeded();
    this.count++;
  }

  getUsage(): RateLimitUsage {
    this.resetIfNeeded();
    return {
      count: this.count,
      limit: ADMIN_RATE_LIMIT,
      resetAt: new Date(this.windowStart + HOUR_MS),
    };
  }

  getRemainingRequests(): number {
    this.resetIfNeeded();
    return Math.max(0, ADMIN_RATE_LIMIT - this.count);
  }

  isApproachingLimit(): boolean {
    this.resetIfNeeded();
    return this.count >= ADMIN_RATE_WARNING_THRESHOLD;
  }
}

export const adminRateLimiter = new AdminApiRateLimiter();
