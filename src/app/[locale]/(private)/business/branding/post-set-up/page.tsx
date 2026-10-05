import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import PostSetUp from "@/views/private/management/branding/PostSetUp";
import React from "react";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Branding')} title={t('detailFunction.Post Set Up')} />
      <div>
        <PostSetUp />
      </div>
    </>
  );
}
