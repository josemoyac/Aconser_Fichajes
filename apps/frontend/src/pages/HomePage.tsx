import { DateTime } from 'luxon';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Loader } from '../components/Loader';
import { useCreateEntry, useDailyEntries } from '../modules/time-entries/hooks';
import { useAuthStore } from '../modules/auth/store';

const HomePage = () => {
  const user = useAuthStore((state) => state.user);
  const today = DateTime.now().setZone('Europe/Madrid').toISODate() ?? '';
  const entriesQuery = useDailyEntries({ from: today, to: today });
  const mutation = useCreateEntry();

  if (entriesQuery.isLoading) {
    return <Loader />;
  }

  const entries = entriesQuery.data ?? [];
  const lastEntry = entries[entries.length - 1];
  const nextType = lastEntry?.type === 'IN' ? 'OUT' : 'IN';

  const handleClick = () => {
    mutation.mutate(
      { type: nextType },
      {
        onSuccess: () => {
          if (navigator.vibrate) {
            navigator.vibrate(40);
          }
        }
      }
    );
  };

  const totalMinutes = entries.reduce((acc, entry, index) => {
    if (entry.type === 'OUT' && index > 0) {
      const previous = entries[index - 1];
      if (previous?.type === 'IN') {
        const start = DateTime.fromISO(previous.occurredAtLocal);
        const end = DateTime.fromISO(entry.occurredAtLocal);
        return acc + Math.max(end.diff(start, 'minutes').minutes, 0);
      }
    }
    return acc;
  }, 0);

  const totalHours = (totalMinutes / 60).toFixed(2);

  return (
    <main className="flex flex-1 flex-col gap-4">
      <Card title={`Hola ${user?.name}`} subtitle={`Hoy es ${DateTime.now().setZone('Europe/Madrid').toFormat('cccc, d LLLL')}`}>
        <div className="flex flex-col items-center gap-6">
          <Button
            onClick={handleClick}
            disabled={mutation.isPending}
            className="h-32 w-32 rounded-full text-base shadow-lg"
          >
            {nextType === 'IN' ? 'Fichar entrada' : 'Fichar salida'}
          </Button>
          <p className="text-sm text-slate-600">Horas registradas hoy: {totalHours} h</p>
          <div className="w-full">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Histórico del día</h3>
            <ul className="space-y-2 text-sm">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2">
                  <span className="font-medium text-slate-700">
                    {entry.type === 'IN' ? 'Entrada' : 'Salida'}
                  </span>
                  <span className="text-slate-500">
                    {DateTime.fromISO(entry.occurredAtLocal).toFormat('HH:mm')}
                  </span>
                </li>
              ))}
              {entries.length === 0 && <li className="text-slate-500">Sin fichajes todavía.</li>}
            </ul>
          </div>
        </div>
      </Card>
    </main>
  );
};

export default HomePage;
