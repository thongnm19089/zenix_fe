import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import PostCreation from "@/views/private/management/branding/PostCreation";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Branding')} title={t('detailFunction.Post Creation')} />
      <div>
        <PostCreation />
      </div>
    </>
  );
}
