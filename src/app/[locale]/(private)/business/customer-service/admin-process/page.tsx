import AdminProcess from "@/views/private/management/customer-service/AdminProcess";
import React from "react";
import { useTranslations } from "next-intl";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('customerService.Admin Process')} title={t('customerService.Admin Process')} />
      <div>
        <AdminProcess />
      </div>
    </>
  );
}
