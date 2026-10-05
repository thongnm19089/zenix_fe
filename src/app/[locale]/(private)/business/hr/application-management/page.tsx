import ApplicationManagement from "@/views/private/management/hr/ApplicationManagement";
import { useTranslations } from "next-intl";
import React from "react";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";


export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.HR')} title={t('nav.candidateManagement')} />
      <div>
      <ApplicationManagement />
      </div>

    </>
  );
}

