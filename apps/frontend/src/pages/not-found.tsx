import { Link } from 'react-router-dom'
import { Coffee, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center px-4">
      <Coffee className="h-12 w-12 text-primary mb-4" />
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground mt-2 mb-6">
        Página no encontrada.
      </p>
      <Button asChild>
        <Link to="/" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>
    </div>
  )
}
