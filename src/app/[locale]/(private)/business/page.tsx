import Dashboard from "@/views/private/management/dashboard/Dashboard";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return <Dashboard />;
}