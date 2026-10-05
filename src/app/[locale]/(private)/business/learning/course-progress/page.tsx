import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import CourseProgress from "@/views/private/management/learning/CourseProgress";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Learning')} title={t('detailFunction.Course Progress')} />
      <div>
        <CourseProgress />
      </div>
    </>
  );
}
