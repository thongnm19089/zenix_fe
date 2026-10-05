import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import CourseMe from "@/views/private/management/learning/CourseMe";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Learning')} title={t('detailFunction.Course Me')} />
      <div>
        <CourseMe />
      </div>
    </>
  );
}
