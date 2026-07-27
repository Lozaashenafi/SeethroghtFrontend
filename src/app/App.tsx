import { Providers } from '@/app/providers';
import { AppRouter } from '@/app/router';

export function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}
