import { useState } from 'react';
import { DateTime } from 'luxon';
import { Card } from '../components/Card';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';
import { useDailyEntries } from '../modules/time-entries/hooks';
import { api } from '../modules/api/client';
import { useToast } from '../components/Toast';

const HistoryPage = () => {
  const [month, setMonth] = useState(DateTime.now().setZone('Europe/Madrid').toFormat('yyyy-LL'));
  const { show } = useToast();
  const start = DateTime.fromFormat(`${month}-01`, 'yyyy-LL-dd').startOf('month');
  const end = start.endOf('month');
  const entriesQuery = useDailyEntries({ from: start.toISODate() ?? '', to: end.toISODate() ?? '' });

  if (entriesQuery.isLoading) {
    return <Loader />;
  }

  const grouped = (entriesQuery.data ?? []).reduce<Record<string, typeof entriesQuery.data>>((acc, entry) => {
    acc[entry.localDate] = acc[entry.localDate] ? [...acc[entry.localDate]!, entry] : [entry];
    return acc;
  }, {});
  const sortedDays = Object.entries(grouped).sort((a, b) => (a[0] < b[0] ? 1 : -1));

  const handleEdit = async (entryId: string) => {
    const newTime = window.prompt('Introduce la nueva hora (HH:mm)');
    if (!newTime) return;
    const currentDate = Object.keys(grouped).find((date) => grouped[date]?.some((entry) => entry.id === entryId));
    if (!currentDate) return;
    const iso = `${currentDate}T${newTime}:00`;
    await api.put(`/time-entries/${entryId}`, { occurredAt: iso });
    show('Fichaje actualizado');
    entriesQuery.refetch();
  };

  return (
    <main className="flex flex-1 flex-col gap-4">
      <Card title="Historial" subtitle="Consulta y corrige tus fichajes recientes">
        <div className="flex items-center gap-3">
          <label htmlFor="month" className="text-sm font-medium text-slate-600">
            Mes
          </label>
          <input
            id="month"
            type="month"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>
        <div className="mt-4 space-y-4">
          {sortedDays.map(([date, entries]) => (
            <article key={date} className="rounded-2xl bg-slate-50 p-4">
              <header className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  {DateTime.fromISO(date).setLocale('es').toFormat('cccc, d LLLL')}
                </h3>
                <span className="text-xs text-slate-500">{entries.length} registros</span>
              </header>
              <ul className="space-y-2 text-sm">
                {entries.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                    <span className="font-medium text-slate-700">
                      {entry.type === 'IN' ? 'Entrada' : 'Salida'}
                    </span>
                    <div className="flex items-center gap-3">
                      <span>{DateTime.fromISO(entry.occurredAtLocal).toFormat('HH:mm')}</span>
                      <Button variant="ghost" onClick={() => handleEdit(entry.id)}>
                        Editar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          {sortedDays.length === 0 && <p className="text-sm text-slate-500">No hay fichajes en este periodo.</p>}
        </div>
      </Card>
    </main>
  );
};

export default HistoryPage;
