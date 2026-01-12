import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useNavigate } from '@tanstack/react-router'
import { useLogin } from '@/hooks/useAuth'
import { loginSchema, type LoginValues } from '@/schemas/loginSchema'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

export function LoginForm() {
    const navigate = useNavigate()
    const { mutate: login, isPending, isError, error } = useLogin()

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = (values: LoginValues) => {
        login(values, {
            onSuccess: () => {
                navigate({ to: '/dashboard' })
            },
        })
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your credentials to access your account
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {isError && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error?.response?.data?.message || 'Login failed. Please try again.'}
                            </div>
                        )}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex mt-8 flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with demo accounts</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => form.reset({ email: 'demo@demo.com', password: 'demo@demo' })}
                                disabled={isPending}
                            >
                                Demo
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => form.reset({ email: 'test@test.com', password: 'test@test' })}
                                disabled={isPending}
                            >
                                Test
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => form.reset({ email: 'johndoe@johndoe.com', password: 'johndoe@johndoe' })}
                                disabled={isPending}
                            >
                                John
                            </Button>
                        </div>

                        <p className="text-sm text-center text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
