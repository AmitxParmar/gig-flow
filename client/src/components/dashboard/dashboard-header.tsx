import { lazy, Suspense } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2 } from "lucide-react"

import { useCurrentUser, useLogout } from "@/hooks/useAuth"
import { ModeToggle } from "@/components/mode-toggle"

const NotificationsPopover = lazy(() =>
    import("./notifications-popover").then((mod) => ({ default: mod.NotificationsPopover }))
)

function Logo() {
    return (
        <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                G
            </div>
            <h1 className="text-lg font-semibold hidden md:block tracking-tight">
                Gigflow
            </h1>
        </div>
    )
}

import { useNavigate } from "@tanstack/react-router"

function UserNav() {
    const navigate = useNavigate()
    const { data: user } = useCurrentUser()
    const { mutateAsync: logout, isPending } = useLogout()

    const handleLogout = async () => {
        try {
            await logout()
            navigate({ to: "/" })
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-full gap-2 rounded-full md:w-auto md:px-2 md:rounded-md">
                    <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start gap-1 p-1">
                        <span className="hidden text-sm font-medium md:inline-block">
                            {user?.name}
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                    onClick={handleLogout}
                    disabled={isPending}
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function DashboardHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-border border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
            <Logo />
            <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <ModeToggle />
                <Suspense fallback={<div className="h-9 w-9" />}>
                    <NotificationsPopover />
                </Suspense>
                <UserNav />
            </div>
        </header>
    )
}
