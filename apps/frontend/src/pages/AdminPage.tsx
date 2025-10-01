import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { useUsers } from '../modules/users/hooks';
import { useProjects, useUserProjects } from '../modules/projects/hooks';
import { api } from '../modules/api/client';
import { useToast } from '../components/Toast';

const AdminPage = () => {
  const usersQuery = useUsers();
  const projectsQuery = useProjects();
  const [selectedUser, setSelectedUser] = useState<string>();
  const userProjectsQuery = useUserProjects(selectedUser ?? '');
  const { show } = useToast();

  const selectedProjectIds = useMemo(() => {
    return new Set((userProjectsQuery.data ?? []).map((item) => item.project.id));
  }, [userProjectsQuery.data]);

  if (usersQuery.isLoading || projectsQuery.isLoading) {
    return <Loader />;
  }

  const handleSyncProjects = async () => {
    await api.post('/integrations/bc/sync');
    projectsQuery.refetch();
    show('Sincronización de proyectos completada');
  };

  const handleSyncLeaves = async () => {
    if (!selectedUser) return;
    await api.post('/integrations/a3/sync', {
      userExternalId: selectedUser,
      from: new Date().toISOString().slice(0, 10),
      to: new Date().toISOString().slice(0, 10)
    });
    show('Sincronización de vacaciones completada');
  };

  const handleTogglePermission = (projectId: string) => {
    if (!selectedUser) return;
    const newSet = new Set(selectedProjectIds);
    if (newSet.has(projectId)) {
      newSet.delete(projectId);
    } else {
      newSet.add(projectId);
    }
    api
      .post('/permissions', { userId: selectedUser, projectIds: Array.from(newSet) })
      .then(() => {
        show('Permisos actualizados');
        userProjectsQuery.refetch();
      });
  };

  return (
    <main className="flex flex-1 flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Integraciones" subtitle="Acciones manuales">
          <div className="flex flex-col gap-3">
            <Button onClick={handleSyncProjects}>Sincronizar proyectos BC</Button>
            <Button onClick={handleSyncLeaves} variant="ghost" disabled={!selectedUser}>
              Sincronizar vacaciones A3 para usuario seleccionado
            </Button>
          </div>
        </Card>
        <Card title="Usuarios" subtitle="Selecciona un usuario para gestionar permisos">
          <ul className="space-y-2">
            {usersQuery.data?.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => setSelectedUser(user.id)}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm ${
                    selectedUser === user.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="font-semibold">{user.name}</span>
                  <span className="ml-2 text-xs">{user.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {selectedUser && (
        <Card title="Permisos de proyectos">
          <div className="space-y-3">
            {projectsQuery.data?.map((project) => (
              <label
                key={project.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">{project.name}</p>
                  <p className="text-xs text-slate-500">Código {project.code}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedProjectIds.has(project.id)}
                  onChange={() => handleTogglePermission(project.id)}
                  className="h-5 w-5"
                />
              </label>
            ))}
          </div>
        </Card>
      )}
    </main>
  );
};

export default AdminPage;
