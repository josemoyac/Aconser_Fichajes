import { useEffect } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useCurrentUser } from './modules/auth/hooks';
import { useAuthStore } from './modules/auth/store';
import { Loader } from './components/Loader';
import { ToastContainer } from './components/Toast';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import AllocationPage from './pages/AllocationPage';
import AdminPage from './pages/AdminPage';

const ProtectedLayout = () => {
  const { data, isLoading } = useCurrentUser();
  const location = useLocation();

  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.VITE_PWA_ENABLED === 'true') {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {
        // noop
      });
    }
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (!data) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 bg-slate-100 px-4 pb-16 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Aconser Fichajes</h1>
          <p className="text-sm text-slate-500">Bolsa mensual y fichajes en tiempo real</p>
        </div>
        <div className="text-right text-sm text-slate-700">
          <p className="font-medium">{data.name}</p>
          <p>{data.role === 'ADMIN' ? 'Administrador' : 'Empleado'}</p>
        </div>
      </header>
      <nav className="flex gap-3 overflow-x-auto pb-2">
        <NavLink to="/" label="Inicio" />
        <NavLink to="/historial" label="Historial" />
        <NavLink to="/imputacion" label="Imputación" />
        {data.role === 'ADMIN' && <NavLink to="/admin" label="Administración" />}
      </nav>
      <Outlet />
      <ToastContainer />
    </div>
  );
};

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <AdminPage />;
};

interface NavLinkProps {
  to: string;
  label: string;
}

const NavLink = ({ to, label }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        isActive ? 'bg-primary text-white' : 'bg-white text-primary shadow'
      }`}
    >
      {label}
    </Link>
  );
};

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedLayout />}>
      <Route index element={<HomePage />} />
      <Route path="historial" element={<HistoryPage />} />
      <Route path="imputacion" element={<AllocationPage />} />
      <Route path="admin" element={<AdminRoute />} />
    </Route>
  </Routes>
);

export default App;
