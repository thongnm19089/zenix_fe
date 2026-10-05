import EmployeeContract from "@/views/private/management/hr/EmployeeContract";
import { useTranslations } from "next-intl";
import React from "react";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.HR')} title={t('detailFunction.Employee Contract')} />
      <div>
        <EmployeeContract />
      </div>
    </>
  );
}
