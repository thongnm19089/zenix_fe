import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import CourseMarket from "@/views/private/management/learning/CourseMarket";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Learning')} title={t('detailFunction.Course Market')} />
      <div>
        <CourseMarket />
      </div>
    </>
  );
}
