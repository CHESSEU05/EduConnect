import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AppBootLoader } from './components/feedback/AppBootLoader';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  const [isBootLoading, setIsBootLoading] = useState(true);

  useEffect(() => {
    const bootTimer = window.setTimeout(() => {
      setIsBootLoading(false);
    }, 850);

    return () => {
      window.clearTimeout(bootTimer);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        {isBootLoading ? <AppBootLoader /> : null}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
