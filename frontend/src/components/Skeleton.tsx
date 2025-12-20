'use client';

import '../scss/Skeleton.scss';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'button';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`skeleton-text-block ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton skeleton-text"
            style={{ width: i === lines - 1 ? '70%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={style}
    />
  );
}

// Page-specific skeleton loaders
export function HomeSkeleton() {
  return (
    <div className="home-skeleton">
      <div className="background-overlay" />
      <div className="skeleton-content">
        <div className="skeleton-welcome-card">
          <Skeleton variant="text" width="80%" height={40} />
          <Skeleton variant="text" width="60%" height={20} />
          <div className="skeleton-buttons">
            <Skeleton variant="button" width="100%" height={48} />
            <Skeleton variant="button" width="100%" height={48} />
            <Skeleton variant="button" width="100%" height={48} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="background-overlay" />
      <div className="skeleton-dashboard-content">
        <Skeleton variant="button" width={100} height={36} />

        {/* Chart skeleton */}
        <div className="skeleton-chart-wrapper">
          <Skeleton variant="rectangular" width="100%" height={220} />
        </div>

        {/* Table skeleton */}
        <div className="skeleton-table-wrapper">
          <div className="skeleton-table-header">
            <Skeleton variant="text" width={40} height={20} />
            <Skeleton variant="text" width={60} height={20} />
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="text" width={100} height={20} />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-table-row">
              <Skeleton variant="text" width={30} height={20} />
              <Skeleton variant="text" width={40} height={20} />
              <Skeleton variant="text" width={60} height={20} />
              <Skeleton variant="text" width={120} height={20} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MultiplayerSkeleton() {
  return (
    <div className="multiplayer-skeleton">
      <div className="background-overlay" />
      <div className="skeleton-multiplayer-content">
        <Skeleton variant="button" width={100} height={36} />
        <div className="skeleton-card">
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="80%" height={20} />
          <div className="skeleton-input-group">
            <Skeleton variant="rectangular" width="100%" height={48} />
            <Skeleton variant="button" width="100%" height={48} />
          </div>
          <div className="skeleton-divider">
            <Skeleton variant="text" width={40} height={20} />
          </div>
          <Skeleton variant="button" width="100%" height={48} />
        </div>
      </div>
    </div>
  );
}

export function LobbySkeleton() {
  return (
    <div className="lobby-skeleton">
      <div className="background-overlay" />
      <div className="skeleton-lobby-content">
        <Skeleton variant="button" width={100} height={36} />
        <div className="skeleton-lobby-card">
          <Skeleton variant="text" width="50%" height={28} />
          <div className="skeleton-match-code">
            <Skeleton variant="rectangular" width={200} height={48} />
          </div>
          <Skeleton variant="text" width="40%" height={24} />
          <div className="skeleton-players-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-player-item">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={100} height={20} />
              </div>
            ))}
          </div>
          <Skeleton variant="button" width="100%" height={48} />
        </div>
      </div>
    </div>
  );
}

export function VolunteerSkeleton() {
  return (
    <div className="volunteer-skeleton">
      <div className="background-overlay" />
      <div className="skeleton-volunteer-content">
        <Skeleton variant="button" width={100} height={36} />
        <div className="skeleton-volunteer-card">
          <Skeleton variant="text" width="70%" height={32} />
          <Skeleton variant="text" lines={2} />
          <div className="skeleton-form-group">
            <Skeleton variant="text" width={80} height={16} />
            <Skeleton variant="rectangular" width="100%" height={48} />
          </div>
          <div className="skeleton-form-group">
            <Skeleton variant="text" width={100} height={16} />
            <Skeleton variant="rectangular" width="100%" height={48} />
          </div>
          <div className="skeleton-form-group">
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="rectangular" width="100%" height={100} />
          </div>
          <Skeleton variant="button" width="100%" height={48} />
        </div>
      </div>
    </div>
  );
}

export function VolunteerDashboardSkeleton() {
  return (
    <div className="volunteer-dashboard-skeleton">
      <div className="background-overlay" />
      <div className="skeleton-volunteer-dashboard-content">
        <Skeleton variant="button" width={100} height={36} />
        <Skeleton variant="text" width="40%" height={32} />
        <div className="skeleton-stats-row">
          <Skeleton variant="rectangular" width="30%" height={80} />
          <Skeleton variant="rectangular" width="30%" height={80} />
          <Skeleton variant="rectangular" width="30%" height={80} />
        </div>
        <div className="skeleton-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-list-item">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="skeleton-list-item-content">
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
              </div>
              <Skeleton variant="button" width={80} height={32} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MyVoiceSkeleton() {
  return (
    <div className="myvoice-skeleton">
      <div className="background-overlay" />
      <div className="skeleton-myvoice-content">
        <Skeleton variant="button" width={100} height={36} />
        <Skeleton variant="text" width="50%" height={32} />
        <div className="skeleton-stats-grid">
          <Skeleton variant="rectangular" width="100%" height={100} />
          <Skeleton variant="rectangular" width="100%" height={100} />
        </div>
        <div className="skeleton-map">
          <Skeleton variant="rectangular" width="100%" height={400} />
        </div>
      </div>
    </div>
  );
}
