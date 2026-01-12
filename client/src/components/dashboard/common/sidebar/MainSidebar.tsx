import { Link, useLocation } from "@tanstack/react-router"
import {
    LayoutDashboard,
    CheckSquare,
    Calendar,
    Settings,
    Users,
    FolderOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PostTaskButton } from "../PostTaskButton"

interface MainSidebarProps {
    isMobile?: boolean
}

export function MainSidebar({ isMobile }: MainSidebarProps) {
    const { pathname } = useLocation()

    const navItems = [
        { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
        { icon: CheckSquare, label: "My Tasks", href: "/dashboard/tasks" },
        { icon: FolderOpen, label: "Projects", href: "/dashboard/projects", disabled: true },
        { icon: Users, label: "Team", href: "/dashboard/team", disabled: true },
        { icon: Calendar, label: "Calendar", href: "/dashboard/calendar", disabled: true },
        { icon: Settings, label: "Settings", href: "/dashboard/profile" }, // Direct to profile/settings
    ]

    return (
        <div className={cn("flex gap-4 h-full w-full", isMobile ? "flex-row items-center justify-between px-2 overflow-x-auto" : "flex-col")}>
            {isMobile && <div className="px-2"><PostTaskButton mobile /></div>}

            <div className={cn("px-2", isMobile && "hidden")}>
                <PostTaskButton />
            </div>

            <div className={cn("space-y-1 px-2", isMobile ? "flex flex-1 justify-around space-y-0 gap-2" : "")}>
                {navItems.map((item, index) => {
                    // Exact match for dashboard, startsWith for others to handle sub-routes
                    const isActive = item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={index}
                            to={item.href}
                            disabled={item.disabled}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                                item.disabled && "opacity-40 cursor-not-allowed grayscale pointer-events-none",
                                isMobile && "justify-center px-3 py-3"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className={cn(isMobile && "hidden")}>{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
