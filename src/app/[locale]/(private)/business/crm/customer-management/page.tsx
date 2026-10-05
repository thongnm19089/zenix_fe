import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import CustomerManagement from "@/views/private/management/crm/CustomerManagement";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.CRM')} title={t('detailFunction.Customer Management')} />
      <div>
        <CustomerManagement />
      </div>
    </>
  );
}
