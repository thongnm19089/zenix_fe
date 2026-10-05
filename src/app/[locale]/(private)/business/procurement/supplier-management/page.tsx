import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import SupplierManagement from "@/views/private/management/procurement/SupplierManagement";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Procurement')} title={t('detailFunction.Supplier Management')} />
      <div>
        <SupplierManagement />
      </div>
    </>
  );
}
