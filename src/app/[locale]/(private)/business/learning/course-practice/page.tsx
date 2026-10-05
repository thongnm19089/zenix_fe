import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import CoursePractice from "@/views/private/management/learning/CoursePractice";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Learning')} title={t('detailFunction.Course Practice')} />
      <div>
        <CoursePractice/>
      </div>
    </>
  );
}
