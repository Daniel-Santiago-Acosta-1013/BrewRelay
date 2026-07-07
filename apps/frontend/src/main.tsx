import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/layout'
import { DashboardPage } from '@/pages/dashboard'
import { NewOrderPage } from '@/pages/new-order'
import { OrdersPage } from '@/pages/orders'
import { NotificationsPage } from '@/pages/notifications'
import { NotFoundPage } from '@/pages/not-found'
import '@/styles/index.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/new-order" element={<NewOrderPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
