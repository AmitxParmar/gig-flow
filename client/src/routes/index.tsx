import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const LoginForm = lazy(() => import('@/components/forms/login').then(m => ({ default: m.LoginForm })))

export const Route = createFileRoute('/')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
