import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/** Move focus to main after navigation and keep the browser title meaningful. */
export default function useRouteFocus() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const initialPath = useRef(pathname);

  useEffect(() => {
    const titles = {
      '/': 'Overview',
      '/tasks': 'Tasks',
      '/explore': 'Explore',
      '/settings': 'Settings',
      '/components': 'Components',
    };
    document.title = `${titles[pathname] || 'Page not found'} · TaskFlow`;
    if (pathname !== initialPath.current) {
      mainRef.current?.focus();
    }
    initialPath.current = pathname;
  }, [pathname]);

  return mainRef;
}
