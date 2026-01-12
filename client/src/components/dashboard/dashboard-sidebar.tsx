import { DashboardSidebarWrapper } from "./common/sidebar"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DashboardSidebar({ className }: SidebarProps) {
    return (
        <DashboardSidebarWrapper className={className} />
    )
}
