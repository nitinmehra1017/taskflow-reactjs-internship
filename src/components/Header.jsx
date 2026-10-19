import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';

export default function Header() {
  const { pathname } = useLocation();
  const title =
    {
      '/': 'Overview',
      '/tasks': 'Tasks',
      '/settings': 'Settings',
      '/components': 'Components',
    }[pathname] || 'Page not found';
  return (
    <header className="topbar">
      <p className="breadcrumb">
        Workspace <span>/</span> <strong>{title}</strong>
      </p>
      <div className="header-actions">
        <Link to="/settings" className="guide-link">
          <Icon name="book" size={17} />
          Setup guide
        </Link>
        <span className="header-divider" />
        <span className="avatar" aria-label="TaskFlow workspace">
          TF
        </span>
      </div>
    </header>
  );
}
