import { Suspense, lazy } from "react"
import { useLocation } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { MainSidebar } from "./MainSidebar"
import { cn } from "@/lib/utils"
// Import custom useMediaQuery if configured with alias, otherwise relative
import { useMediaQuery } from "@/hooks/useMediaQuery"

const SettingsSidebar = lazy(() =>
    import("./SettingsSidebar").then(module => ({ default: module.SettingsSidebar }))
)

interface WrapperProps {
    className?: string
}

export function DashboardSidebarWrapper({ className }: WrapperProps) {
    const { pathname } = useLocation()
    const isMobile = useMediaQuery("(max-width: 768px)")

    // Check if we are in a profile/settings context
    const isProfilePage = pathname.startsWith("/dashboard/profile") || pathname.startsWith("/dashboard/settings")

    if (isMobile) {
        return (
            <div className={cn(
                "fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-lg border-t border-border z-60 flex items-center shadow-[0_-2px_10px_rgba(0,0,0,0.1)]",
                className
            )}>
                <div className="w-full h-full px-2 flex items-center">
                    <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted/20" />}>
                        {isProfilePage
                            ? <SettingsSidebar isMobile={isMobile} />
                            : <MainSidebar isMobile={isMobile} />
                        }
                    </Suspense>
                </div>
            </div>
        )
    }

    // Desktop View
    return (
        <Card className={cn("hidden lg:block fixed left-4 top-24 bottom-4 w-64 rounded-4xl border-none shadow-lg bg-card/50 backdrop-blur-sm z-40 overflow-hidden", className)}>
            <CardContent className="p-4 h-full overflow-y-auto scrollbar-none">

                {isProfilePage
                    ? <SettingsSidebar isMobile={false} />
                    : <MainSidebar isMobile={false} />
                }

            </CardContent>
        </Card>
    )
}
