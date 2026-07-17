import React from "react";
import { STATUS_LABELS } from "@/lib/categories";

export default function StatusBadge({ status }) {
  const info = STATUS_LABELS[status] || { label: status, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}