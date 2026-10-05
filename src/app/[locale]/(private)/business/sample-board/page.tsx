import SampleBoard from "@/views/private/management/task/SampleBoard";
import { useTranslations } from "next-intl";
import React from "react"

import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";



export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Task')} title={t('nav.SampleBoard')} />
      <div>
        <SampleBoard />
      </div>
    </>
  );
}