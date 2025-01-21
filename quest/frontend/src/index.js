import React from 'react';
import ReactDOM from 'react-dom/client'; // Use the 'client' import for React 18
import App from './App';

// Create the root using `createRoot` instead of `render`
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
