export const Loader = () => (
  <div className="flex items-center justify-center py-10" role="status" aria-live="polite">
    <span className="sr-only">Cargando</span>
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);
