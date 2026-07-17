import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import RequestCard from "@/components/RequestCard";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";

export default function ProviderJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [profileId, setProfileId] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.ProviderProfile.filter({ user_id: user.id });
        if (profiles.length > 0) {
          setProfileId(profiles[0].id);
          const data = await base44.entities.ServiceRequest.filter(
            { provider_id: profiles[0].id },
            "-created_date"
          );
          setJobs(data);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  // Realtime / optimistic updates
  useEffect(() => {
    if (!profileId) return;
    const unsubscribe = base44.entities.ServiceRequest.subscribe((event) => {
      if (event.data.provider_id !== profileId && event.type !== "update") return;
      if (event.type === "create") {
        setJobs((prev) => [event.data, ...prev]);
      } else if (event.type === "update") {
        setJobs((prev) => {
          const exists = prev.some((j) => j.id === event.data.id);
          if (exists) return prev.map((j) => (j.id === event.data.id ? event.data : j));
          if (event.data.provider_id === profileId) return [event.data, ...prev];
          return prev;
        });
      } else if (event.type === "delete") {
        setJobs((prev) => prev.filter((j) => j.id !== event.data.id));
      }
    });
    return unsubscribe;
  }, [profileId]);

  const filtered = filter === "all"
    ? jobs
    : jobs.filter((j) => j.status === filter);

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="app-container p-4">
        <h1 className="text-xl font-bold mb-4">أعمالي</h1>

        <Tabs value={filter} onValueChange={setFilter} className="mb-4">
          <TabsList className="w-full bg-muted/50 p-1 rounded-xl h-auto">
            <TabsTrigger value="all" className="rounded-lg text-xs flex-1">الكل</TabsTrigger>
            <TabsTrigger value="accepted" className="rounded-lg text-xs flex-1">مقبول</TabsTrigger>
            <TabsTrigger value="in_progress" className="rounded-lg text-xs flex-1">قيد التنفيذ</TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg text-xs flex-1">مرفوض</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg text-xs flex-1">مكتمل</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground mt-3">لا توجد أعمال</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((job) => (
              <RequestCard key={job.id} request={job} linkPrefix="/provider/request" />
            ))}
          </div>
        )}
      </div>
      <BottomNav role="provider" />
    </div>
  );
}