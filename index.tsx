
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './ErrorBoundary';

console.log('=== SupraChat Starting ===');
console.log('Environment:', import.meta.env.MODE);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error("Could not find root element to mount to");
}

console.log('✓ Root element found');

try {
  console.log('Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('Rendering App...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('✓ App rendered successfully');
} catch (error) {
  console.error('❌ Fatal error during render:', error);
  rootElement.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #050b1a;
      color: #ef4444;
      font-family: monospace;
      padding: 20px;
    ">
      <h1>SupraChat - Fatal Error</h1>
      <pre style="background: #1e293b; padding: 20px; border-radius: 8px; max-width: 800px; overflow: auto;">
${error instanceof Error ? error.stack : String(error)}
      </pre>
    </div>
  `;
}
