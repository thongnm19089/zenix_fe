import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import KpiManagement from "@/views/private/management/hr/KpiManagement";
import React from "react";
import { useTranslations } from "next-intl";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.HR')} title={t('nav.kpiManagement')} />
      <div>
        <KpiManagement />
      </div>
    </>
  );
}
