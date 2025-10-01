import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { Card } from '../components/Card';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';
import { useAuthStore } from '../modules/auth/store';
import { useAllocation, useFinalizeAllocation } from '../modules/allocations/hooks';
import { useUserProjects } from '../modules/projects/hooks';

const AllocationPage = () => {
  const user = useAuthStore((state) => state.user);
  const [month, setMonth] = useState(DateTime.now().setZone('Europe/Madrid').toFormat('yyyy-LL'));
  const allocationQuery = useAllocation(user?.id ?? '', month);
  const permissionsQuery = useUserProjects(user?.id ?? '');
  const finalizeMutation = useFinalizeAllocation(user?.id ?? '', month);

  const availableProjects = permissionsQuery.data?.map((permission) => permission.project) ?? [];
  const initialAllocations = useMemo(() => {
    const base = availableProjects.map((project) => ({ projectId: project.id, hours: 0 }));
    const persisted = allocationQuery.data?.allocation.projects ?? [];
    return base.map((item) => ({
      ...item,
      hours: persisted.find((p) => p.projectId === item.projectId)?.hours ?? 0
    }));
  }, [availableProjects, allocationQuery.data]);

  const [allocations, setAllocations] = useState(initialAllocations);

  useEffect(() => {
    setAllocations(initialAllocations);
  }, [initialAllocations]);

  const summary = allocationQuery.data?.summary;
  const totalHours = (Number(summary?.baseHours ?? 0) + Number(summary?.extraHours ?? 0)).toFixed(2);
  const assigned = allocations.reduce((acc, item) => acc + Number(item.hours), 0);

  if (allocationQuery.isLoading || permissionsQuery.isLoading) {
    return <Loader />;
  }

  const handleChange = (projectId: string, hours: number) => {
    setAllocations((current) =>
      current.map((allocation) =>
        allocation.projectId === projectId ? { ...allocation, hours } : allocation
      )
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    finalizeMutation.mutate(allocations);
  };

  return (
    <main className="flex flex-1 flex-col gap-4">
      <Card title="Imputación mensual" subtitle={`Resumen ${month}`}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <label htmlFor="month" className="text-sm font-medium text-slate-600">
              Mes
            </label>
            <input
              id="month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              Bolsa base: <strong>{summary?.baseHours ?? 0} h</strong> · Horas extra:{' '}
              <strong>{summary?.extraHours ?? 0} h</strong>
            </p>
            <p className="text-sm text-slate-500">Total disponible: {totalHours} h · Asignadas: {assigned} h</p>
          </div>
          <div className="space-y-3">
            {availableProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{project.name}</p>
                  <p className="text-xs text-slate-500">Código: {project.code}</p>
                </div>
                <input
                  type="number"
                  step="0.25"
                  min={0}
                  value={allocations.find((item) => item.projectId === project.id)?.hours ?? 0}
                  onChange={(event) => handleChange(project.id, Number(event.target.value))}
                  className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-right text-sm"
                  aria-label={`Horas para ${project.name}`}
                />
              </div>
            ))}
          </div>
          <Button type="submit" className="w-full" disabled={finalizeMutation.isPending || assigned !== Number(totalHours)}>
            Finalizar imputación
          </Button>
        </form>
      </Card>
    </main>
  );
};

export default AllocationPage;
