import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import RequestCard from "@/components/RequestCard";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList } from "lucide-react";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        setUserId(user.id);
        const data = await base44.entities.ServiceRequest.filter(
          { customer_id: user.id },
          "-created_date"
        );
        setRequests(data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  // Realtime / optimistic updates
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = base44.entities.ServiceRequest.subscribe((event) => {
      if (event.type === "create" && event.data.customer_id === userId) {
        setRequests((prev) => [event.data, ...prev]);
      } else if (event.type === "update") {
        setRequests((prev) => prev.map((r) => (r.id === event.data.id ? event.data : r)));
      } else if (event.type === "delete") {
        setRequests((prev) => prev.filter((r) => r.id !== event.data.id));
      }
    });
    return unsubscribe;
  }, [userId]);

  const filtered = filter === "all"
    ? requests
    : requests.filter((r) => r.status === filter);

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="app-container p-4">
        <h1 className="text-xl font-bold mb-4">طلباتي</h1>

        <Tabs value={filter} onValueChange={setFilter} className="mb-4">
          <TabsList className="w-full bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger value="all" className="rounded-lg text-xs flex-1">الكل</TabsTrigger>
            <TabsTrigger value="open" className="rounded-lg text-xs flex-1">مفتوح</TabsTrigger>
            <TabsTrigger value="in_progress" className="rounded-lg text-xs flex-1">قيد التنفيذ</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg text-xs flex-1">مكتمل</TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg text-xs flex-1">مرفوض</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground mt-3">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>
      <BottomNav role="customer" />
    </div>
  );
}