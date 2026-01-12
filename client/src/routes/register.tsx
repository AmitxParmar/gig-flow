import { lazy, Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const RegisterForm = lazy(() => import('@/components/forms/register').then(m => ({ default: m.RegisterForm })))

export const Route = createFileRoute('/register')({
    component: RegisterPage,
})

function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <Suspense>
                <RegisterForm />
            </Suspense>
        </div>
    )
}
