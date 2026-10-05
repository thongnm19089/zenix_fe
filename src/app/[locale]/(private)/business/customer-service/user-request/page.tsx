import UserRequest from "@/views/private/management/customer-service/UserRequest";
import React from "react";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import { useTranslations } from "next-intl";


export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t('customerService.Request User')} title={t('customerService.Request User')} />
      <div>
        <UserRequest />
      </div>
    </>
  );
}
