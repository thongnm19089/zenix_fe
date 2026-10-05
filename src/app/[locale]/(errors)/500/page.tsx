import Error500 from "@/components/Error/Error500";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return <Error500 />;
}
