import { TaskProvider } from './context/TaskContext';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ComponentsPage from './pages/ComponentsPage';

export default function App() {
  return (
    <TaskProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="components" element={<ComponentsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </TaskProvider>
  );
}
