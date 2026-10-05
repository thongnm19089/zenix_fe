import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import PurchaseOrder from "@/views/private/management/procurement/PurchaseOrder";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Procurement')} title={t('detailFunction.Purchase Order')} />
      <div>
        <PurchaseOrder />
      </div>
    </>
  );
}
