import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import PostSummary from "@/views/private/management/branding/PostSummary";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Branding')} title={t('detailFunction.Post Summary')} />
      <div>
        <PostSummary />
      </div>
    </>
  );
}
