import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import React from "react";
import { useTranslations } from "next-intl";
import CourseSetUp from "@/views/private/management/learning/CourseSetUp";

export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Learning')} title={t('detailFunction.Course Set Up')} />
      <div>
        <CourseSetUp />
      </div>
    </>
  );
}
