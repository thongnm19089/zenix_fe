import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import PaymentManagement from "@/views/private/management/finance/PaymentManagement";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Finance')} title={t('detailFunction.Payment Management')} />
      <div>
        <PaymentManagement />
      </div>
    </>
  );
}
