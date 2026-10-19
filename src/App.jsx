import { lazy } from 'react';
const ExplorePage = lazy(
  () => import(/* webpackChunkName: 'explore' */ './pages/ExplorePage'),
);
import { TaskProvider } from './context/TaskContext';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
const TasksPage = lazy(() => import(/* webpackChunkName: 'tasks' */ './pages/TasksPage'));
const SettingsPage = lazy(
  () => import(/* webpackChunkName: 'settings' */ './pages/SettingsPage'),
);
import NotFoundPage from './pages/NotFoundPage';
const ComponentsPage = lazy(
  () => import(/* webpackChunkName: 'components' */ './pages/ComponentsPage'),
);

export default function App() {
  return (
    <TaskProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="components" element={<ComponentsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </TaskProvider>
  );
}
