import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import OrderManagement from "@/views/private/management/crm/OrderManagement";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.CRM')} title={t('detailFunction.Order Management')} />
      <div>
        <OrderManagement />
      </div>
    </>
  );
}
