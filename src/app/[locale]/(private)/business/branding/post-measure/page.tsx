import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import PostMeasure from "@/views/private/management/branding/PostMeasure";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Branding')} title={t('detailFunction.Post Measure')} />
      <div>
        <PostMeasure />
      </div>
    </>
  );
}
