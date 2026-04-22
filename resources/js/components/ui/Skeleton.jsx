import '../../styles/components/Skeleton.css'

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__header">
        <div className="skeleton skeleton--title"></div>
        <div className="skeleton skeleton--trend"></div>
      </div>
      <div className="skeleton skeleton--value"></div>
      <div className="skeleton skeleton--subtitle"></div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="skeleton-chart">
      <div className="skeleton-chart__header">
        <div className="skeleton skeleton--chart-title"></div>
        <div className="skeleton skeleton--chart-subtitle"></div>
      </div>
      <div className="skeleton-chart__content">
        <div className="skeleton-chart__bars">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-chart__bar">
              <div className="skeleton skeleton--bar-fill"></div>
              <div className="skeleton skeleton--bar-value"></div>
              <div className="skeleton skeleton--bar-label"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonInsights() {
  return (
    <div className="skeleton-insights">
      <div className="skeleton-insights__header">
        <div className="skeleton skeleton--insights-title"></div>
      </div>
      <div className="skeleton-insights__content">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton-insights__item">
            <div className="skeleton skeleton--insight-label"></div>
            <div className="skeleton skeleton--insight-value"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard__content">
      <section className="metrics-grid">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </section>

      <section className="dashboard-grid">
        <SkeletonChart />
        <SkeletonInsights />
      </section>
    </div>
  )
}
