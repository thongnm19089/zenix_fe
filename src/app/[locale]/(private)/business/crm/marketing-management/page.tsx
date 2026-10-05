import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import MarketingManagement from "@/views/private/management/crm/MarketingManagement";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.CRM')} title={t('detailFunction.Marketing Management')} />
      <div>
        <MarketingManagement />
      </div>
    </>
  );
}
