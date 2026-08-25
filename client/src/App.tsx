import { useState } from 'react';
import { hasToken } from './services/api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

type View = 'login' | 'dashboard';

function getInitialView(): View {
  return hasToken() ? 'dashboard' : 'login';
}

export default function App() {
  const [view, setView] = useState<View>(getInitialView);

  if (view === 'login') {
    return <LoginPage onLoginSuccess={() => setView('dashboard')} />;
  }

  return <DashboardPage onLogout={() => setView('login')} />;
}
