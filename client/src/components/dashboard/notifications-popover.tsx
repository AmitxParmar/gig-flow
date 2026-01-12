
import { memo, useCallback, useMemo } from "react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell, Check, Loader2 } from "lucide-react"
import { useNotifications, useUnreadCount, useMarkAllAsRead, useMarkAsRead } from "@/hooks/useNotification"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

const NotificationItem = memo(({
    notification,
    onMarkAsRead
}: {
    notification: any,
    onMarkAsRead: (id: string) => void
}) => {
    const timeAgo = useMemo(() =>
        formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
        [notification.createdAt]
    )

    const handleClick = useCallback(() => {
        if (!notification.isRead) {
            onMarkAsRead(notification.id)
        }
    }, [notification.isRead, notification.id, onMarkAsRead])

    return (
        <div
            className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-muted/30' : ''
                }`}
            onClick={handleClick}
        >
            <div className="flex gap-3">
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!notification.isRead ? 'bg-blue-500' : 'bg-transparent'
                    }`} />
                <div className="space-y-1">
                    <p className={`text-sm leading-none ${!notification.isRead ? 'font-medium' : ''}`}>
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {timeAgo}
                    </p>
                </div>
            </div>
        </div>
    )
})

NotificationItem.displayName = "NotificationItem"

export const NotificationsPopover = memo(function NotificationsPopover() {
    const { data: notifications, isLoading } = useNotifications()
    const { data: unreadCount } = useUnreadCount()
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead()
    const { mutate: markAsRead } = useMarkAsRead()

    const hasUnread = useMemo(() => (unreadCount || 0) > 0, [unreadCount])

    const handleMarkAllRead = useCallback(() => {
        markAllAsRead()
    }, [markAllAsRead])

    const handleMarkAsRead = useCallback((id: string) => {
        markAsRead(id)
    }, [markAsRead])

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {hasUnread && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                    {hasUnread && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs text-muted-foreground hover:text-primary"
                            onClick={handleMarkAllRead}
                            disabled={isMarkingAll}
                        >
                            {isMarkingAll ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                                <Check className="h-3 w-3 mr-1" />
                            )}
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-20 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    ) : notifications?.length === 0 ? (
                        <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications?.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={handleMarkAsRead}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
})

