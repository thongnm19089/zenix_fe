import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import CostManagement from "@/views/private/management/finance/CostManagement";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Finance')} title={t('nav.costManagement')} />
      <div>
        <CostManagement />
      </div>
    </>
  );
}
