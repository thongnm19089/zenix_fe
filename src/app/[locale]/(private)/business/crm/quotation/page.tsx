import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import Quotation from "@/views/private/management/crm/Quotation";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t("functionCategory.CRM")} title={t("detailFunction.Quote")} />
      <div>
        <Quotation />
      </div>
    </>
  );
}
