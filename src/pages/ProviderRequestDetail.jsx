import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import StatusBadge from "@/components/StatusBadge";
import { getCategoryById } from "@/lib/categories";
import { ArrowRight, Phone, MapPin, Clock, Image, MessageCircle, Navigation } from "lucide-react";
import moment from "moment";
import { createNotification, sendEmailSafe, getUserEmailSafe } from "@/lib/notify";
import RouteMap from "@/components/RouteMap";

export default function ProviderRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [request, setRequest] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  useEffect(() => {
    const load = async () => {
      try {
        const [req, user] = await Promise.all([
          base44.entities.ServiceRequest.get(id),
          base44.auth.me(),
        ]);
        setRequest(req);
        const profiles = await base44.entities.ProviderProfile.filter({ user_id: user.id });
        if (profiles.length > 0) setProfile(profiles[0]);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);
  
  const acceptRequest = async () => {
    setActionLoading(true);
    try {
      await base44.entities.ServiceRequest.update(id, {
        status: "accepted",
        provider_id: profile.id,
        provider_name: profile.full_name,
        provider_phone: profile.phone,
      });
      setRequest({ ...request, status: "accepted", provider_id: profile.id });
      // Notify customer
      createNotification({
        user_id: request.customer_id,
        title: "تم قبول طلبك ✅",
        body: `قبل ${profile.full_name} طلبك: ${request.title}`,
        type: "order_accepted",
        request_id: id,
      });
      const customerEmail = await getUserEmailSafe(request.customer_id);
      sendEmailSafe(customerEmail, "تم قبول طلبك ✅", `مرحباً،\n\nقبل ${profile.full_name} طلبك "${request.title}" وسيبدأ العمل قريباً.`);
      toast({ title: "تم قبول الطلب ✅" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };
  
  const rejectRequest = async () => {
    setActionLoading(true);
    try {
      await base44.entities.ServiceRequest.update(id, { status: "rejected" });
      setRequest({ ...request, status: "rejected" });
      // Notify customer
      createNotification({
        user_id: request.customer_id,
        title: "تم رفض طلبك",
        body: `اعتذر ${profile.full_name} عن قبول طلبك: ${request.title}. يرجى اختيار مقدم خدمة آخر.`,
        type: "order_rejected",
        request_id: id,
      });
      const customerEmail = await getUserEmailSafe(request.customer_id);
      sendEmailSafe(customerEmail, "تم رفض طلبك", `مرحباً،\n\nاعتذر ${profile.full_name} عن قبول طلبك "${request.title}". يرجى اختيار مقدم خدمة آخر من التطبيق.`);
      toast({ title: "تم رفض الطلب" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };
  
  const startWork = async () => {
    setActionLoading(true);
    try {
      await base44.entities.ServiceRequest.update(id, { status: "in_progress" });
      setRequest({ ...request, status: "in_progress" });
      toast({ title: "تم بدء العمل" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };
  
  const completeWork = async () => {
    setActionLoading(true);
    try {
      await base44.entities.ServiceRequest.update(id, {
        status: "completed",
        completed_date: new Date().toISOString(),
      });
      // Increment provider job count
      await base44.entities.ProviderProfile.update(profile.id, {
        total_jobs: (profile.total_jobs || 0) + 1,
      });
      setRequest({ ...request, status: "completed" });
      toast({ title: "تم إكمال العمل بنجاح 🎉" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">الطلب غير موجود</p>
      </div>
    );
  }
  
  const cat = getCategoryById(request.category);
  const Icon = cat.icon;
  const isMyRequest = request.provider_id === profile?.id;
  
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="app-container p-4 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">تفاصيل الطلب</h1>
        </div>

        <div className="bg-card rounded-2xl border p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">{request.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={request.status} />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {moment(request.created_date).format("DD/MM/YYYY")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-4 mb-3">
          <h3 className="font-semibold text-sm mb-2">الوصف</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{request.description}</p>
        </div>

        {request.photo_urls?.length > 0 && (
          <div className="bg-card rounded-2xl border p-4 mb-3">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
              <Image className="w-4 h-4" /> الصور
            </h3>
            <div className="flex gap-2 overflow-x-auto">
              {request.photo_urls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-28 h-28 rounded-xl object-cover shrink-0" />
              ))}
            </div>
          </div>
        )}

        {/* Customer info */}
        <div className="bg-card rounded-2xl border p-4 mb-3">
          <h3 className="font-semibold text-sm mb-2">معلومات العميل</h3>
          <p className="font-medium">{request.customer_name}</p>
          {request.customer_phone && (
            <a href={`tel:${request.customer_phone}`} className="text-primary text-sm flex items-center gap-1 mt-1">
              <Phone className="w-3.5 h-3.5" />
              {request.customer_phone}
            </a>
          )}
          {request.address && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {request.address}
            </p>
          )}
        </div>

        {/* Route map + chat (after accepting) */}
        {(request.status === "accepted" || request.status === "in_progress") && isMyRequest && (
          <>
            <RouteMap
              providerLocation={
                profile?.latitude ? { lat: profile.latitude, lng: profile.longitude } : null
              }
              customerLocation={
                request.latitude ? { lat: request.latitude, lng: request.longitude } : null
              }
            />
            <Button
              onClick={() => navigate(`/chat/${id}`)}
              variant="outline"
              className="w-full h-12 rounded-xl text-base mb-3"
            >
              <MessageCircle className="w-5 h-5 ml-2" />
              محادثة مع العميل
            </Button>
          </>
        )}

        {/* Action buttons */}
        <div className="space-y-2 mt-4">
          {request.status === "open" && isMyRequest && (
            <>
              <Button onClick={acceptRequest} disabled={actionLoading} className="w-full h-12 rounded-xl text-base">
                {actionLoading ? "جاري القبول..." : "قبول الطلب"}
              </Button>
              <Button onClick={rejectRequest} disabled={actionLoading} variant="outline" className="w-full h-12 rounded-xl text-base text-destructive border-destructive/40 hover:bg-destructive/5">
                {actionLoading ? "جاري..." : "رفض الطلب"}
              </Button>
            </>
          )}
          {(request.status === "accepted" || request.status === "in_progress") && isMyRequest && request.latitude && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full h-12 rounded-xl text-base">
                <Navigation className="w-5 h-5 ml-2" />
                التنقل لموقع العميل
              </Button>
            </a>
          )}
          {request.status === "accepted" && isMyRequest && (
            <Button onClick={startWork} disabled={actionLoading} className="w-full h-12 rounded-xl text-base">
              {actionLoading ? "جاري..." : "بدء العمل"}
            </Button>
          )}
          {request.status === "in_progress" && isMyRequest && (
            <Button onClick={completeWork} disabled={actionLoading} className="w-full h-12 rounded-xl text-base bg-green-600 hover:bg-green-700">
              {actionLoading ? "جاري..." : "إكمال العمل ✓"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}