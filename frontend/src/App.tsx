import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AppBootLoader } from './components/feedback/AppBootLoader';
import { PageLoader } from './components/feedback/PageLoader';
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
        {isBootLoading ? (
          <AppBootLoader />
        ) : (
          <Suspense fallback={<PageLoader message="Loading EduConnect" />}>
            <AppRoutes />
          </Suspense>
        )}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
