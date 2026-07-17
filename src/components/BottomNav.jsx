import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Home, PlusCircle, ClipboardList, User, MapPin, Bell } from "lucide-react";

const CUSTOMER_TABS = [
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/new-request", icon: PlusCircle, label: "طلب جديد" },
  { path: "/my-requests", icon: ClipboardList, label: "طلباتي" },
  { path: "/notifications", icon: Bell, label: "إشعارات" },
  { path: "/profile", icon: User, label: "حسابي" },
];

const PROVIDER_TABS = [
  { path: "/provider", icon: Home, label: "الرئيسية" },
  { path: "/provider/find", icon: MapPin, label: "الخدمات" },
  { path: "/provider/jobs", icon: ClipboardList, label: "أعمالي" },
  { path: "/notifications", icon: Bell, label: "إشعارات" },
  { path: "/profile", icon: User, label: "حسابي" },
];

export default function BottomNav({ role }) {
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const tabs = role === "provider" ? PROVIDER_TABS : CUSTOMER_TABS;

  useEffect(() => {
    let unsub;
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const data = await base44.entities.Notification.filter(
          { user_id: user.id, read: false },
          "-created_date",
          50
        );
        setUnread(data.length);
        unsub = base44.entities.Notification.subscribe((event) => {
          if (event.type === "create") setUnread((u) => u + 1);
          else if (event.type === "update" && event.data.read) setUnread((u) => Math.max(0, u - 1));
        });
      } catch {}
    };
    load();
    return () => { if (unsub) unsub(); };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="app-container flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              {tab.path === "/notifications" && unread > 0 && (
                <span className="absolute top-0 right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}