import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import HomePage from '../HomePage';
import * as hooks from '../../modules/time-entries/hooks';
import { useAuthStore } from '../../modules/auth/store';

vi.mock('../../modules/time-entries/hooks');

const queryClient = new QueryClient();

describe('HomePage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: { id: '1', email: 'test', name: 'Tester', role: 'EMPLOYEE' } });
  });

  it('muestra botón de fichaje', () => {
    (hooks.useDailyEntries as unknown as vi.Mock).mockReturnValue({ data: [], isLoading: false });
    (hooks.useCreateEntry as unknown as vi.Mock).mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', { name: /Fichar entrada/i })).toBeInTheDocument();
  });
});
