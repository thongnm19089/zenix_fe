import BreadcrumbDetail from "@/components/Breadcrumb/BreadcrumbDetail";
import AnalyticsHr from "@/views/private/management/dashboard/AnalyticsHr";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbDetail
        functionName={t('functionCategory.Analytics')}
        title={t('detailFunction.Analytics HR')}
        pageName={t('general.list')}
        pageLink="/business/analytics"
      />
      <div>
        <AnalyticsHr />
      </div>
    </>
  );
}