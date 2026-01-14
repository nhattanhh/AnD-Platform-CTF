package com.tool.atkdefbackend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate Limiting Filter for API protection
 * 
 * Implements a simple token bucket algorithm per IP address.
 * Configurable via application.properties:
 * - ratelimit.requests-per-minute: Max requests per minute per IP (default: 60)
 * - ratelimit.enabled: Enable/disable rate limiting (default: true)
 */
@Slf4j
@Component
@Order(1) // Execute before other filters
public class RateLimitingFilter implements Filter {

    @Value("${ratelimit.requests-per-minute:60}")
    private int requestsPerMinute;

    @Value("${ratelimit.enabled:true}")
    private boolean enabled;

    // IP -> Request count tracking
    private final Map<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();

    // Cleanup old buckets every 5 minutes
    private long lastCleanup = System.currentTimeMillis();
    private static final long CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
    private static final long BUCKET_WINDOW_MS = 60 * 1000; // 1 minute window

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        if (!enabled) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String clientIp = getClientIp(httpRequest);
        String path = httpRequest.getRequestURI();
        
        // Skip rate limiting for health checks and static resources
        if (path.startsWith("/actuator/") || path.startsWith("/swagger") || 
            path.startsWith("/v3/api-docs") || path.startsWith("/webjars/")) {
            chain.doFilter(request, response);
            return;
        }

        // Periodic cleanup of old buckets
        cleanupIfNeeded();

        // Check rate limit
        RateLimitBucket bucket = buckets.computeIfAbsent(clientIp, k -> new RateLimitBucket());
        
        if (!bucket.tryConsume()) {
            log.warn("Rate limit exceeded for IP: {} on path: {}", clientIp, path);
            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write(
                "{\"error\": \"Too many requests. Please slow down.\", \"success\": false}");
            return;
        }

        // Add rate limit headers
        httpResponse.setHeader("X-RateLimit-Limit", String.valueOf(requestsPerMinute));
        httpResponse.setHeader("X-RateLimit-Remaining", String.valueOf(bucket.getRemaining()));
        
        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        // Check for proxied requests
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private void cleanupIfNeeded() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
            lastCleanup = now;
            buckets.entrySet().removeIf(entry -> entry.getValue().isExpired(now));
            log.debug("Rate limiter cleanup complete, {} buckets remaining", buckets.size());
        }
    }

    /**
     * Simple rate limit bucket with sliding window
     */
    private class RateLimitBucket {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();

        public synchronized boolean tryConsume() {
            long now = System.currentTimeMillis();
            
            // Reset window if expired
            if (now - windowStart > BUCKET_WINDOW_MS) {
                count.set(0);
                windowStart = now;
            }

            // Check if under limit
            if (count.get() < requestsPerMinute) {
                count.incrementAndGet();
                return true;
            }
            return false;
        }

        public int getRemaining() {
            return Math.max(0, requestsPerMinute - count.get());
        }

        public boolean isExpired(long now) {
            return now - windowStart > BUCKET_WINDOW_MS * 2;
        }
    }
}
