import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import OrderAccountantManagement from "@/views/private/management/finance/OrderAccountantManagement";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Finance')} title={t('detailFunction.Order Management')} />
      <div>
        <OrderAccountantManagement />
      </div>
    </>
  );
}
