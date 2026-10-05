import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import SalesConsultingManagement from "@/views/private/management/crm/SalesConsultingManagement";
import React from "react";
import { useTranslations } from "next-intl";

export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.CRM')} title={t('detailFunction.Sales Consulting Management')} />
      <div>
        <SalesConsultingManagement />
      </div>
    </>
  );
}
