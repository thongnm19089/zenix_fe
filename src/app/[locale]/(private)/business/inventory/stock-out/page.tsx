import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import StockOut from "@/views/private/management/inventory/StockOut";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Inventory')} title={t('detailFunction.Stock-out')} />
      <div>
        <StockOut />
      </div>
    </>
  );
}
