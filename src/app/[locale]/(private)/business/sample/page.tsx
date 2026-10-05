import { useTranslations } from "next-intl";
import React from "react"

import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import PaymentCalculator from "@/views/private/management/sample/SampleScreen";



export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Task')} title={t('nav.taskManagement')} />
      <div>
        <PaymentCalculator />
      </div>
    </>
  );
}
