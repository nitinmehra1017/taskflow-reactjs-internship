import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import useRouteFocus from '../hooks/useRouteFocus';

export default function AppLayout() {
  const mainRef = useRouteFocus();
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <div className="main-column">
        <Header />
        <main id="main-content" ref={mainRef} tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="page-footer">
          <span>TaskFlow · A calmer way to get things done.</span>
          <span>YuvaIntern / ReactJS Internship</span>
        </footer>
      </div>
    </div>
  );
}
