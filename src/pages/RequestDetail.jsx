import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import StatusBadge from "@/components/StatusBadge";
import StarRating from "@/components/StarRating";
import { getCategoryById } from "@/lib/categories";
import { ArrowRight, Phone, MapPin, User, Clock, MessageCircle } from "lucide-react";
import moment from "moment";
import { createNotification, sendEmailSafe, getUserEmailSafe } from "@/lib/notify";

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [existingRating, setExistingRating] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const load = async () => {
      try {
        const [req, u] = await Promise.all([
          base44.entities.ServiceRequest.get(id),
          base44.auth.me(),
        ]);
        setRequest(req);
        setUser(u);
        if (req.status === "completed" && req.provider_id) {
          const ratings = await base44.entities.Rating.filter({
            request_id: id,
            customer_id: u.id,
          });
          if (ratings.length > 0) setExistingRating(ratings[0]);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);
  
  const cancelRequest = async () => {
    try {
      await base44.entities.ServiceRequest.update(id, { status: "cancelled" });
      setRequest({ ...request, status: "cancelled" });
      if (request.provider_id && (request.status === "accepted" || request.status === "in_progress")) {
        try {
          const provider = await base44.entities.ProviderProfile.get(request.provider_id);
          createNotification({
            user_id: provider.user_id,
            title: "تم إلغاء الطلب",
            body: `ألغى ${request.customer_name} الطلب: ${request.title}`,
            type: "order_cancelled",
            request_id: id,
          });
          const providerEmail = await getUserEmailSafe(provider.user_id);
          sendEmailSafe(
            providerEmail,
            "تم إلغاء طلب",
            `مرحباً،\n\nألغى العميل ${request.customer_name} الطلب "${request.title}".`
          );
        } catch {}
      }
      toast({ title: "تم إلغاء الطلب" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };
  
  const submitRating = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await base44.entities.Rating.create({
        request_id: id,
        provider_id: request.provider_id,
        customer_id: user.id,
        score: rating,
        comment,
      });
      // Update provider avg rating
      const provider = await base44.entities.ProviderProfile.get(request.provider_id);
      const newTotal = (provider.total_ratings || 0) + 1;
      const newAvg = (((provider.avg_rating || 0) * (provider.total_ratings || 0)) + rating) / newTotal;
      await base44.entities.ProviderProfile.update(request.provider_id, {
        avg_rating: Math.round(newAvg * 10) / 10,
        total_ratings: newTotal,
      });
      setExistingRating({ score: rating, comment });
      setShowRating(false);
      toast({ title: "شكراً لتقييمك! ⭐" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setSubmitting(false);
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
  const isCustomer = user?.id === request.customer_id;
  
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="app-container p-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">تفاصيل الطلب</h1>
        </div>

        {/* Category + Status */}
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

        {/* Description */}
        <div className="bg-card rounded-2xl border p-4 mb-3">
          <h3 className="font-semibold text-sm mb-2">وصف المشكلة</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{request.description}</p>
        </div>

        {/* Photos */}
        {request.photo_urls?.length > 0 && (
          <div className="bg-card rounded-2xl border p-4 mb-3">
            <h3 className="font-semibold text-sm mb-2">الصور</h3>
            <div className="flex gap-2 overflow-x-auto">
              {request.photo_urls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-28 h-28 rounded-xl object-cover shrink-0" />
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        {request.address && (
          <div className="bg-card rounded-2xl border p-4 mb-3">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> الموقع
            </h3>
            <p className="text-sm text-muted-foreground">{request.address}</p>
          </div>
        )}

        {/* Provider info */}
        {request.provider_name && (
          <div className="bg-card rounded-2xl border p-4 mb-3">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4" /> مقدم الخدمة
            </h3>
            <p className="font-medium">{request.provider_name}</p>
            {request.provider_phone && (
              <a href={`tel:${request.provider_phone}`} className="text-primary text-sm flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5" />
                {request.provider_phone}
              </a>
            )}
          </div>
        )}

        {/* Chat with provider */}
        {(request.status === "accepted" || request.status === "in_progress") && isCustomer && (
          <Button
            onClick={() => navigate(`/chat/${id}`)}
            className="w-full h-12 rounded-xl text-base mb-3"
          >
            <MessageCircle className="w-5 h-5 ml-2" />
            محادثة مع مقدم الخدمة
          </Button>
        )}

        {/* Rating section */}
        {request.status === "completed" && isCustomer && (
          <div className="bg-card rounded-2xl border p-4 mb-3">
            {existingRating ? (
              <div>
                <h3 className="font-semibold text-sm mb-2">تقييمك</h3>
                <StarRating value={existingRating.score} readOnly size={24} />
                {existingRating.comment && (
                  <p className="text-sm text-muted-foreground mt-2">{existingRating.comment}</p>
                )}
              </div>
            ) : showRating ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">قيّم الخدمة</h3>
                <StarRating value={rating} onChange={setRating} size={28} />
                <Textarea
                  placeholder="أضف تعليق (اختياري)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                />
                <Button onClick={submitRating} disabled={rating === 0 || submitting} className="w-full rounded-xl">
                  {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowRating(true)} variant="outline" className="w-full rounded-xl">
                ⭐ قيّم الخدمة
              </Button>
            )}
          </div>
        )}

        {/* Cancel */}
        {isCustomer && (request.status === "open" || request.status === "accepted" || request.status === "in_progress") && (
          <Button variant="destructive" className="w-full rounded-xl mt-2" onClick={cancelRequest}>
            إلغاء الطلب
          </Button>
        )}
      </div>
    </div>
  );
}