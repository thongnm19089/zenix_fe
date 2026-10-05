import BreadcrumbDetail from "@/components/Breadcrumb/BreadcrumbDetail";
import AnalyticsTask from "@/views/private/management/dashboard/AnalyticsTask";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbDetail
        functionName={t('functionCategory.Analytics')}
        title={t('detailFunction.Analytics Task')}
        pageName={t('general.list')}
        pageLink="/business/analytics"
      />
      <div>
        <AnalyticsTask />
      </div>
    </>
  );
}
