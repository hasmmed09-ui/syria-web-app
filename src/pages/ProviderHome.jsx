import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import RequestCard from "@/components/RequestCard";
import BottomNav from "@/components/BottomNav";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function ProviderHome() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.ProviderProfile.filter({ user_id: user.id });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          if (profiles[0].status === "approved") {
            // Get open requests matching provider's skills or area
            const incoming = await base44.entities.ServiceRequest.filter(
              { provider_id: profiles[0].id, status: "open" },
              "-created_date",
              20
            );
            setRequests(incoming);
          }
        }
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
      <div className="app-container p-4">
        <h1 className="text-xl font-bold mb-4">لوحة مقدم الخدمة</h1>

        {/* Profile status banner */}
        {profile?.status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">ملفك قيد المراجعة</p>
              <p className="text-xs text-muted-foreground mt-0.5">سيتم إشعارك بمجرد اعتماد ملفك من قبل الإدارة</p>
            </div>
          </div>
        )}

        {profile?.status === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">تم رفض ملفك</p>
              <p className="text-xs text-muted-foreground mt-0.5">يرجى التواصل مع الإدارة لمعرفة السبب</p>
            </div>
          </div>
        )}

        {profile?.status === "approved" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-card rounded-2xl border p-3 text-center">
                <p className="text-2xl font-bold text-primary">{profile.total_jobs || 0}</p>
                <p className="text-[11px] text-muted-foreground">الأعمال</p>
              </div>
              <div className="bg-card rounded-2xl border p-3 text-center">
                <p className="text-2xl font-bold text-amber-500">{profile.avg_rating || 0}</p>
                <p className="text-[11px] text-muted-foreground">التقييم</p>
              </div>
              <div className="bg-card rounded-2xl border p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{profile.total_ratings || 0}</p>
                <p className="text-[11px] text-muted-foreground">التقييمات</p>
              </div>
            </div>

            {/* Available requests */}
            <h2 className="font-semibold text-lg mb-3">طلبات واردة</h2>
            {requests.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border">
                <CheckCircle className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <p className="text-muted-foreground mt-3 text-sm">لا توجد طلبات واردة حالياً</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {requests.map((req) => (
                  <RequestCard key={req.id} request={req} linkPrefix="/provider/request" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav role="provider" />
    </div>
  );
}