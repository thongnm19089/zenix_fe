import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import SupplierOutstanding from "@/views/private/management/procurement/SupplierOutstanding";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Procurement')} title={t('detailFunction.Supplier Outstanding')} />
      <div>
        <SupplierOutstanding />
      </div>
    </>
  );
}
