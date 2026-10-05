import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import ServicePortal from "@/views/private/management/project/BussinessPortal";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Learning')} title={t('detailFunction.Portal Service')} />
      <div>
        <ServicePortal/>
      </div>
    </>
  );
}
