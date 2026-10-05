import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import InventoryManagement from "@/views/private/management/inventory/InventoryManagement";
import StockEntry from "@/views/private/management/inventory/StockEntry";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Inventory')} title={t('detailFunction.Stock-entry')} />
      <div>
        <StockEntry />
      </div>
    </>
  );
}
