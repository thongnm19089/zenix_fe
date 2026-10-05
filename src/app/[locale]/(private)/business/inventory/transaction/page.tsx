import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import InventoryManagement from "@/views/private/management/inventory/InventoryManagement";
import InventoryTransaction from "@/views/private/management/inventory/InventoryTransaction";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Inventory')} title={t('detailFunction.Inventory Transaction')}/>
      <div>
        <InventoryTransaction />
      </div>
    </>
  );
}
