import { Component, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export function RouteLoading() {
  return (
    <section className="route-pending" aria-labelledby="route-loading-title">
      <h1 id="route-loading-title">Opening your workspace</h1>
      <p role="status">Loading this page. Your navigation is still available.</p>
      <div className="route-placeholder" aria-hidden="true" />
    </section>
  );
}

export class RouteErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <section className="route-pending" aria-labelledby="route-error-title">
          <h1 id="route-error-title">This page could not open</h1>
          <p role="alert">
            A page resource could not load. Check your connection and reload to try again.
          </p>
          <a className="button button-dark" href={this.props.path}>
            Reload this page
          </a>
        </section>
      );
    return this.props.children;
  }
}

export default function RouteContent() {
  const { pathname } = useLocation();
  return (
    <RouteErrorBoundary key={pathname} path={pathname}>
      <Suspense fallback={<RouteLoading />}>
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
  );
}
