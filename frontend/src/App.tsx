import { SessionProvider } from './context/SessionProvider';
import { AppRoutes } from './AppRoutes';

export default function App() {
  return (
    <SessionProvider>
      <AppRoutes />
    </SessionProvider>
  );
}
