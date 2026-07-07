import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/layout'
import { MenuPage } from '@/pages/menu'
import { KitchenPage } from '@/pages/kitchen'
import { HowItWorksPage } from '@/pages/how-it-works'
import { NotFoundPage } from '@/pages/not-found'
import { ToastProvider } from '@/components/ui/toast'
import '@/styles/index.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<MenuPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>,
)