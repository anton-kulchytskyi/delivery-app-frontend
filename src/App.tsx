import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

function App() {
  const [status, setStatus] = useState<string>('checking...');

  useEffect(() => {
    api.health()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Delivery App</h1>
        <p className="text-muted-foreground">Backend: <span className="font-mono">{status}</span></p>
      </div>
    </div>
  );
}

export default App;
