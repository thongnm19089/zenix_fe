import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import CourseCertificate from "@/views/private/management/learning/CourseCertificate";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Learning')} title={t('detailFunction.Course Certificate')} />
      <div>
        <CourseCertificate />
      </div>
    </>
  );
}
