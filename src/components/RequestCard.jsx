import React from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import { getCategoryById } from "@/lib/categories";
import StatusBadge from "@/components/StatusBadge";
import moment from "moment";

export default function RequestCard({ request, linkPrefix = "/request" }) {
  const cat = getCategoryById(request.category);
  const Icon = cat.icon;
  
  return (
    <Link
      to={`${linkPrefix}/${request.id}`}
      className="block bg-card rounded-2xl border border-border/60 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-1">{request.title}</h3>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{request.description}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {moment(request.created_date).fromNow()}
            </span>
            {request.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="line-clamp-1">{request.address}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}