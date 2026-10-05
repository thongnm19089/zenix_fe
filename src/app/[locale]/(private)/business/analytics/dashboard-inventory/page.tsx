import BreadcrumbDetail from "@/components/Breadcrumb/BreadcrumbDetail";
import AnalyticsInventory from "@/views/private/management/dashboard/AnalyticsInventory";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbDetail
        functionName={t('functionCategory.Analytics')}
        title={t('detailFunction.Analytics Inventory')}
        pageName={t('general.list')}
        pageLink="/business/analytics"
      />
      <div>
        <AnalyticsInventory />
      </div>
    </>
  );
}
