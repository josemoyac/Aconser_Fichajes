import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { api } from '../modules/api/client';

const LoginPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const redirect = params.get('redirect');
    if (redirect === 'dev') {
      api.get('/auth/dev-login').then(() => navigate('/'));
    }
  }, [navigate, params]);

  const handleDevLogin = async () => {
    await api.get('/auth/dev-login');
    navigate('/');
  };

  const handleOidc = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'}/auth/login`;
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 bg-gradient-to-br from-primary/10 to-white px-6">
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-primary">Bienvenido</h1>
        <p className="mt-2 text-sm text-slate-600">
          Inicia sesión con tu cuenta corporativa o usa el modo de desarrollo para pruebas locales.
        </p>
        <div className="mt-6 space-y-3">
          <Button onClick={handleOidc} className="w-full">
            Acceder con Microsoft Entra ID
          </Button>
          <Button onClick={handleDevLogin} variant="ghost" className="w-full">
            Acceder en modo desarrollo
          </Button>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
