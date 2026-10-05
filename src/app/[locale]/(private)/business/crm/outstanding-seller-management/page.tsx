import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import OutstandingSellerManagement from "@/views/private/management/crm/OutstandingSellerManagement";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.CRM')} title={t('detailFunction.Outstanding Seller Management')} />
      <div>
        <OutstandingSellerManagement />
      </div>
    </>
  );
}
