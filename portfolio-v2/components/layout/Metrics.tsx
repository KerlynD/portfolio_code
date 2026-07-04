'use client'

import { useEffect, useState } from 'react'

/**
 * Masthead technical readout with REAL client-measured performance.
 * `load` and `ttfb` come from the Navigation Timing API for this page load.
 * `build` is the real git short-sha, `status` is real availability info.
 */
export default function Metrics({
  topLine,
  status = 'all green',
  build,
}: {
  topLine: string
  status?: string
  build: string
}) {
  const [perf, setPerf] = useState<{ load: number; ttfb: number } | null>(null)

  useEffect(() => {
    const measure = () => {
      const nav = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined
      if (!nav) return
      const load = Math.max(0, Math.round(nav.loadEventEnd || nav.domContentLoadedEventEnd || performance.now()))
      const ttfb = Math.max(0, Math.round(nav.responseStart))
      setPerf({ load, ttfb })
    }
    if (document.readyState === 'complete') measure()
    else {
      window.addEventListener('load', measure, { once: true })
      return () => window.removeEventListener('load', measure)
    }
  }, [])

  return (
    <div className="mast-readout">
      {topLine}
      <br />
      {perf ? `load ${perf.load}ms · ttfb ${perf.ttfb}ms` : 'load —ms · ttfb —ms'} · build {build}
      <br />
      status <span className="ok">✓ {status}</span>
    </div>
  )
}
