import Error403 from "@/components/Error/Error403";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return <Error403 />;
}
