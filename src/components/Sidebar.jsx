import { NavLink } from 'react-router-dom';
import mark from '../assets/taskflow-mark.svg';
import Icon from './Icon';

const navigation = [
  { to: '/', label: 'Overview', icon: 'dashboard' },
  { to: '/tasks', label: 'Tasks', icon: 'tasks' },
  { to: '/components', label: 'Components', icon: 'layers' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand" aria-label="TaskFlow home">
        <img src={mark} alt="" width="36" height="36" />
        <span>
          taskflow<span className="brand-dot">.</span>
        </span>
      </NavLink>
      <div className="workspace-label">
        <span className="workspace-icon">TF</span>
        <div>
          My workspace<small>Personal workspace</small>
        </div>
      </div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        {navigation.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon name={icon} />
            <span>{label}</span>
            {to === '/' && <span className="nav-indicator" />}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="foundation-note">
          <span className="small-orb" />
          <p>
            A little structure.
            <br />
            <strong>A lot more clarity.</strong>
          </p>
          <span className="foundation-caption">Built one week at a time.</span>
        </div>
        <div className="sidebar-footer">
          <span className="status-dot" />
          Week 2 · Components<span>v0.2</span>
        </div>
      </div>
    </aside>
  );
}
