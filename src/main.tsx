import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept all fetch requests globally to inject Bearer JWT authorization headers for protected routes
const originalFetch = window.fetch;
const customFetch = async function (input: RequestInfo | URL, init?: RequestInit) {
  const token = localStorage.getItem("appointflow_token");
  const urlStr = typeof input === "string" 
    ? input 
    : (input instanceof URL ? input.href : input.url);
  
  if (token && urlStr.includes("/api/")) {
    init = init || {};
    let headersObj: Record<string, string> = {};
    
    if (init.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          headersObj[key] = value;
        });
      } else {
        headersObj = { ...init.headers } as Record<string, string>;
      }
    }

    const hasAuth = Object.keys(headersObj).some(k => k.toLowerCase() === "authorization");
    if (!hasAuth) {
      headersObj["Authorization"] = `Bearer ${token}`;
      init.headers = headersObj;
    }
  }
  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    writable: true,
    configurable: true,
    enumerable: true
  });
} catch (e) {
  console.warn("Global fetch override failed direct definition, attempting assignment fallback.", e);
  try {
    (window as any).fetch = customFetch;
  } catch (err) {
    console.error("Could not override fetch under strict system environment constraints.", err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
