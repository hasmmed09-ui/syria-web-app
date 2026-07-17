import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy } from "lucide-react";

export default function JobLeaderboard() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.JobRequest.list("-created_date", 500);
        const counts = {};
        all.forEach((r) => {
          if (r.job_name) {
            const key = r.job_name.trim();
            counts[key] = (counts[key] || 0) + 1;
          }
        });
        const sorted = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setRankings(sorted);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);
  
  return (
    <div className="bg-card rounded-2xl border p-4">
      <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-accent" />
        أكثر المهن طلباً للإضافة
      </h2>
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : rankings.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-4">لا توجد طلبات بعد</p>
      ) : (
        <div className="space-y-2">
          {rankings.map((r, i) => (
            <div key={r.name} className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0
                    ? "bg-yellow-100 text-yellow-700"
                    : i === 1
                    ? "bg-gray-200 text-gray-700"
                    : i === 2
                    ? "bg-orange-100 text-orange-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-medium">{r.name}</span>
              <span className="text-sm text-muted-foreground font-bold">{r.count} طلب</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}