import CustomerSurvey from "@/views/private/management/customer-service/CustomerSurvey";
import React from "react";
import { useTranslations } from "next-intl";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('customerService.Customer Survey')} title={t('customerService.Customer Survey')} />
      <div>
        <CustomerSurvey />
      </div>
    </>
  );
}
