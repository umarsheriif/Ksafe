import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { markAsRead, markAllAsRead } from "./actions";
import { Button } from "@/components/ui/button";

export default async function NotificationsPage() {
  const user = await requireAuth();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllAsRead}>
            <Button variant="outline" type="submit">Mark All as Read</Button>
          </form>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className={n.isRead ? "opacity-60" : ""}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <form action={markAsRead.bind(null, n.id)}>
                  <Button variant="ghost" size="sm" type="submit">
                    Mark Read
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No notifications
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
