import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import StatusBadge from "@/components/StatusBadge";
import { PROVIDER_STATUS, getCategoryById } from "@/lib/categories";
import { ArrowRight, Users, ClipboardList, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import moment from "moment";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState("providers");
  const [providers, setProviders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const load = async () => {
      try {
        const [p, r, rep] = await Promise.all([
          base44.entities.ProviderProfile.list("-created_date", 50),
          base44.entities.ServiceRequest.list("-created_date", 50),
          base44.entities.Report.list("-created_date", 50),
        ]);
        setProviders(p);
        setRequests(r);
        setReports(rep);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);
  
  const updateProviderStatus = async (providerId, status) => {
    try {
      await base44.entities.ProviderProfile.update(providerId, { status });
      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? { ...p, status } : p))
      );
      toast({ title: "تم تحديث الحالة ✅" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };
  
  const updateReportStatus = async (reportId, status) => {
    try {
      await base44.entities.Report.update(reportId, { status });
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
      toast({ title: "تم التحديث" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };
  
  const pendingProviders = providers.filter((p) => p.status === "pending").length;
  const pendingReports = reports.filter((r) => r.status === "pending").length;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="app-container p-4 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">لوحة الإدارة</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-2xl border p-3 text-center">
            <Users className="w-5 h-5 text-primary mx-auto" />
            <p className="text-xl font-bold mt-1">{providers.length}</p>
            <p className="text-[10px] text-muted-foreground">مقدم خدمة</p>
          </div>
          <div className="bg-white rounded-2xl border p-3 text-center">
            <ClipboardList className="w-5 h-5 text-blue-600 mx-auto" />
            <p className="text-xl font-bold mt-1">{requests.length}</p>
            <p className="text-[10px] text-muted-foreground">طلب</p>
          </div>
          <div className="bg-white rounded-2xl border p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto" />
            <p className="text-xl font-bold mt-1">{pendingReports}</p>
            <p className="text-[10px] text-muted-foreground">بلاغ معلق</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full bg-muted/50 p-1 rounded-xl h-auto mb-4">
            <TabsTrigger value="providers" className="rounded-lg text-xs flex-1">
              مقدمو الخدمة {pendingProviders > 0 && `(${pendingProviders})`}
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg text-xs flex-1">الطلبات</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-lg text-xs flex-1">
              البلاغات {pendingReports > 0 && `(${pendingReports})`}
            </TabsTrigger>
          </TabsList>

          {/* Providers */}
          <TabsContent value="providers" className="space-y-2.5">
            {providers.map((p) => {
              const statusInfo = PROVIDER_STATUS[p.status];
              return (
                <div key={p.id} className="bg-white rounded-2xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{p.full_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo?.color}`}>
                          {statusInfo?.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.phone} · {p.service_area}</p>
                      <p className="text-xs text-muted-foreground">{p.skills?.join("، ")}</p>
                    </div>
                  </div>
                  {p.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 rounded-lg gap-1"
                        onClick={() => updateProviderStatus(p.id, "approved")}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> اعتماد
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 rounded-lg gap-1"
                        onClick={() => updateProviderStatus(p.id, "rejected")}
                      >
                        <XCircle className="w-3.5 h-3.5" /> رفض
                      </Button>
                    </div>
                  )}
                  {p.status !== "pending" && (
                    <div className="mt-3">
                      <Select value={p.status} onValueChange={(v) => updateProviderStatus(p.id, v)}>
                        <SelectTrigger className="h-8 text-xs rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">معتمد</SelectItem>
                          <SelectItem value="suspended">موقوف</SelectItem>
                          <SelectItem value="rejected">مرفوض</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
            {providers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">لا يوجد مقدمو خدمة</p>
            )}
          </TabsContent>

          {/* Requests */}
          <TabsContent value="requests" className="space-y-2.5">
            {requests.map((req) => {
              const cat = getCategoryById(req.category);
              return (
                <div key={req.id} className="bg-white rounded-2xl border p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold text-sm">{req.title}</h3>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{req.description}</p>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                    <span>{req.customer_name}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {moment(req.created_date).format("DD/MM")}
                    </span>
                  </div>
                </div>
              );
            })}
            {requests.length === 0 && (
              <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>
            )}
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-2.5">
            {reports.map((rep) => (
              <div key={rep.id} className="bg-white rounded-2xl border p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-sm">{rep.reason}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    rep.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    rep.status === "resolved" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {rep.status === "pending" ? "معلق" : rep.status === "resolved" ? "تم الحل" : rep.status === "reviewed" ? "تمت المراجعة" : "مرفوض"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{rep.details}</p>
                <p className="text-[11px] text-muted-foreground mt-1">من: {rep.reporter_name}</p>
                {rep.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs" onClick={() => updateReportStatus(rep.id, "resolved")}>
                      تم الحل
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1 rounded-lg text-xs" onClick={() => updateReportStatus(rep.id, "dismissed")}>
                      رفض
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {reports.length === 0 && (
              <p className="text-center text-muted-foreground py-8">لا توجد بلاغات</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}