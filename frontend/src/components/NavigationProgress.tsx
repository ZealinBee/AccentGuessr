'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import '../scss/NavigationProgress.scss';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
    setProgress(0);
  }, []);

  const completeNavigation = useCallback(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Listen for route changes
  useEffect(() => {
    completeNavigation();
  }, [pathname, searchParams, completeNavigation]);

  // Simulate progress during navigation
  useEffect(() => {
    if (!isNavigating) return;

    const intervals = [
      { delay: 0, progress: 20 },
      { delay: 100, progress: 40 },
      { delay: 200, progress: 60 },
      { delay: 400, progress: 75 },
      { delay: 800, progress: 85 },
      { delay: 1500, progress: 90 },
    ];

    const timers = intervals.map(({ delay, progress: p }) =>
      setTimeout(() => setProgress(p), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [isNavigating]);

  // Listen for link clicks to start navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);
        // Only trigger for internal navigation
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          startNavigation();
        }
      }
    };

    // Also listen for programmatic navigation via history
    const handleBeforeUnload = () => {
      startNavigation();
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname, startNavigation]);

  if (!isNavigating && progress === 0) {
    return null;
  }

  return (
    <div className="navigation-progress-container" aria-hidden="true">
      <div
        className="navigation-progress-bar"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
