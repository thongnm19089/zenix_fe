import BreadcrumbDetail from "@/components/Breadcrumb/BreadcrumbDetail";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import AnalyticsCustomer from "@/views/private/management/dashboard/AnalyticsCustomer";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbDetail
        functionName={t('functionCategory.Analytics')}
        title={t('detailFunction.Analytics Customer')}
        pageName={t('general.list')}
        pageLink="/business/analytics"
      />
      <div>
        <AnalyticsCustomer />
      </div>
    </>
  );
}
