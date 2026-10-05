import BreadcrumbDetail from "@/components/Breadcrumb/BreadcrumbDetail";
import AnalyticsProcurement from "@/views/private/management/dashboard/AnalyticsProcurement";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbDetail
        functionName={t('functionCategory.Analytics')}
        title={t('detailFunction.Analytics Procurement')}
        pageName={t('general.list')}
        pageLink="/business/analytics"
      />
      <div>
        <AnalyticsProcurement />
      </div>
    </>
  );
}
