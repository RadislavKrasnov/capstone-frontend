import { AuthInitializer } from './features/auth/components/AuthInitializer';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
      <AuthInitializer>
        <AppRouter />
      </AuthInitializer>
  );
}

export default App;
