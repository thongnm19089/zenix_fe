import Profile from "@/views/private/admin/Profile";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return <Profile />;
}
