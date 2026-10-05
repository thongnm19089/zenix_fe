import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import OutstandingManagement from "@/views/private/management/finance/OutstandingManagement";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Finance')}
          title={t('detailFunction.Outstanding Management')} />
      <div>
        <OutstandingManagement />
      </div>
    </>
  );
}
