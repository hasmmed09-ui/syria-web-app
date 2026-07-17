import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import FindServices from "@/components/FindServices";
import RequestCard from "@/components/RequestCard";
import BottomNav from "@/components/BottomNav";
import { PlusCircle, Search } from "lucide-react";

export default function CustomerHome() {
  const [user, setUser] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const requests = await base44.entities.ServiceRequest.filter(
          { customer_id: u.id },
          "-created_date",
          5
        );
        setRecentRequests(requests);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="app-container">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <p className="text-muted-foreground text-sm">أهلاً بك 👋</p>
          <h1 className="text-2xl font-bold mt-0.5">{user?.full_name || "مستخدم"}</h1>
        </div>

        {/* Find Services */}
        <FindServices />

        {/* Quick action */}
        <div className="px-4 mt-6">
          <Link
            to="/new-request"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            طلب خدمة جديد
          </Link>
        </div>

        {/* Recent Requests */}
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">طلباتك الأخيرة</h2>
            {recentRequests.length > 0 && (
              <Link to="/my-requests" className="text-sm text-primary font-medium">عرض الكل</Link>
            )}
          </div>
          {recentRequests.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
              <Search className="w-10 h-10 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground mt-3 text-sm">لا توجد طلبات حتى الآن</p>
              <Link to="/new-request" className="text-primary text-sm font-medium mt-1 inline-block">أنشئ طلبك الأول</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentRequests.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav role="customer" />
    </div>
  );
}