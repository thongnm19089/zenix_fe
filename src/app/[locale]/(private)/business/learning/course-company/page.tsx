import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import CourseCompany from "@/views/private/management/learning/CourseCompany";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Learning')} title={t('detailFunction.Course Company')} />
      <div>
        <CourseCompany />
      </div>
    </>
  );
}
