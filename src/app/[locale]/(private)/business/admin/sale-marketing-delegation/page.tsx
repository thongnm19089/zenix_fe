import React from "react";
import { useTranslations } from "next-intl";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import SaleMarketingDelegation from "@/views/private/admin/SaleMarketingDelegation";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction title={t("nav.saleMarketingDelegation")} functionName={t("admin.administrator")} />
      <SaleMarketingDelegation />
    </>
  );
}
