// Performance monitoring utilities

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
  userAgent: string
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private isEnabled: boolean

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production'
  }

  // Measure page load performance
  measurePageLoad(pageName: string): void {
    if (!this.isEnabled || typeof window === 'undefined') return

    const startTime = performance.now()
    
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime
      
      // Get Core Web Vitals
      this.measureCoreWebVitals(pageName, loadTime)
      
      // Log performance metrics
      this.logMetrics({
        loadTime,
        renderTime: 0, // Will be updated by measureRenderTime
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    })
  }

  // Measure component render time
  measureRenderTime(componentName: string, startTime: number): void {
    if (!this.isEnabled) return

    const renderTime = performance.now() - startTime
    
    console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`)
    
    // Log slow renders (>100ms)
    if (renderTime > 100) {
      console.warn(`[Performance] Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`)
    }
  }

  // Measure Core Web Vitals
  private measureCoreWebVitals(pageName: string, loadTime: number): void {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log(`[Performance] LCP for ${pageName}:`, lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        console.log(`[Performance] FID for ${pageName}:`, entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          console.log(`[Performance] CLS for ${pageName}:`, entry.value)
        }
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // Log performance metrics
  private logMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics)
    
    // In production, you would send this to your analytics service
    if (this.isEnabled) {
      console.log('[Performance] Metrics:', metrics)
      
      // Example: Send to analytics service
      // analytics.track('performance_metrics', metrics)
    }
  }

  // Get performance summary
  getPerformanceSummary(): {
    averageLoadTime: number
    averageRenderTime: number
    totalMeasurements: number
  } {
    if (this.metrics.length === 0) {
      return {
        averageLoadTime: 0,
        averageRenderTime: 0,
        totalMeasurements: 0
      }
    }

    const totalLoadTime = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0)
    const totalRenderTime = this.metrics.reduce((sum, metric) => sum + metric.renderTime, 0)

    return {
      averageLoadTime: totalLoadTime / this.metrics.length,
      averageRenderTime: totalRenderTime / this.metrics.length,
      totalMeasurements: this.metrics.length
    }
  }

  // Clear metrics (useful for testing)
  clearMetrics(): void {
    this.metrics = []
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now()
  
  React.useEffect(() => {
    performanceMonitor.measureRenderTime(componentName, startTime)
  })
}

// Utility function to measure async operations
export async function measureAsyncOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()
  
  try {
    const result = await operation()
    const duration = performance.now() - startTime
    
    console.log(`[Performance] ${operationName} completed in ${duration.toFixed(2)}ms`)
    
    if (duration > 1000) {
      console.warn(`[Performance] Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`)
    }
    
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`[Performance] ${operationName} failed after ${duration.toFixed(2)}ms:`, error)
    throw error
  }
}

// Import React for the hook
import React from 'react'
