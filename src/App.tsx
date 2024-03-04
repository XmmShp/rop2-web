import React from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { consoleRoute } from './console/consoleRoute';
import { ConfigProvider } from 'antd';

const router = createBrowserRouter([{
  path: '/',
  errorElement: <>Oops, an error occurred<br />Check devtools for more info</>,
  children: [
    {
      index: true,
      element: <Navigate to='/console' />
    },
    consoleRoute
  ]
}]);

export default function App() {
  return (<React.StrictMode>
    <ConfigProvider theme={{}}>
      <RouterProvider router={router} /></ConfigProvider>
  </React.StrictMode>);
}