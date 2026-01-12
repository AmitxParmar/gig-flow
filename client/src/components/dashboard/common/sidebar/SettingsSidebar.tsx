import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, User, Bell, Shield, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SettingsSidebarProps {
    isMobile?: boolean
}

export function SettingsSidebar({ isMobile }: SettingsSidebarProps) {
    const navigate = useNavigate()
    const { pathname } = useLocation()

    const navItems = [
        { icon: User, label: "Profile", href: "/dashboard/profile" }, // base profile path
        { icon: Bell, label: "Notifications", href: "/dashboard/settings/notifications" },
        { icon: Shield, label: "Security", href: "/dashboard/settings/security" },
        { icon: Key, label: "API Keys", href: "/dashboard/settings/api-keys" },
    ]

    return (
        <div className={cn("flex gap-4 h-full w-full", isMobile ? "flex-row items-center justify-between px-2" : "flex-col")}>
            <div className={cn("px-2", isMobile && "hidden")}>
                <Button
                    variant="ghost"
                    onClick={() => navigate({ to: "/dashboard" })}
                    className="w-full justify-start gap-2 hover:bg-background/50 rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-semibold">Back to Dashboard</span>
                </Button>
            </div>

            <div className={cn("space-y-1 px-2", isMobile ? "flex flex-1 justify-around space-y-0 gap-2" : "")}>
                {navItems.map((item, index) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={index}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                                isMobile && "justify-center px-3 py-3"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className={cn(isMobile && "hidden")}>{item.label}</span>
                        </Link>
                    )
                })}
            </div>
            {isMobile && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate({ to: "/dashboard" })}
                    className="rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            )}
        </div>
    )
}
