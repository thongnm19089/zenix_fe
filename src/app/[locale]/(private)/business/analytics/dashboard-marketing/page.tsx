import BreadcrumbDetail from "@/components/Breadcrumb/BreadcrumbDetail";
import AnalyticsMarketing from "@/views/private/management/dashboard/AnalyticsMarketing";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbDetail
        functionName={t('functionCategory.Analytics')}
        title={t('detailFunction.Analytics Marketing')}
        pageName={t('general.list')}
        pageLink="/business/analytics"
      />
      <div>
        <AnalyticsMarketing />
      </div>
    </>
  );
}