import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/BottomNav";
import { Bell, BellOff } from "lucide-react";
import moment from "moment";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("customer");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        setRole(user.user_type === "provider" ? "provider" : "customer");
        const data = await base44.entities.Notification.filter(
          { user_id: user.id },
          "-created_date",
          50
        );
        setNotifications(data);
      } catch {}
      setLoading(false);
    };
    load();

    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create") {
        setNotifications((prev) => [event.data, ...prev]);
      } else if (event.type === "update") {
        setNotifications((prev) =>
          prev.map((n) => (n.id === event.data.id ? event.data : n))
        );
      }
    });
    return unsubscribe;
  }, []);

  const handleTap = async (n) => {
    if (!n.read) {
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
      try {
        await base44.entities.Notification.update(n.id, { read: true });
      } catch {}
    }
    if (n.request_id) {
      const prefix = role === "provider" ? "/provider/request" : "/request";
      navigate(`${prefix}/${n.request_id}`);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      for (const n of unread) {
        await base44.entities.Notification.update(n.id, { read: true });
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="app-container p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">الإشعارات</h1>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={markAllRead}
              className="text-sm text-primary font-medium"
            >
              تعليم الكل كمقروء
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <BellOff className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground mt-3">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleTap(n)}
                className={`w-full text-right rounded-2xl border p-4 transition-colors ${
                  n.read
                    ? "bg-card border-border/60"
                    : "bg-primary/5 border-primary/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm">{n.title}</h3>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    {n.body && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {moment(n.created_date).fromNow()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav role={role} />
    </div>
  );
}