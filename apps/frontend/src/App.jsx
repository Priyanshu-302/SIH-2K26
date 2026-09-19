import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { API_ENDPOINTS } from './config/api';

export default function App() {
  useEffect(() => {
    // Warm up backend on page load to eliminate cold start delays
    const warmUp = () => {
      fetch(API_ENDPOINTS.PING).catch(() => {});
    };

    warmUp();
    // Periodic background keep-alive every 5 minutes while user has tab open
    const interval = setInterval(warmUp, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return <RouterProvider router={router} />;
}