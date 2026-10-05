import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import OtherLedgers from "@/views/private/management/accounting/OtherLedgers";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t("functionCategory.Accounting")} title={t("detailFunction.Other Ledgers")} />
      <div>
        <OtherLedgers />
      </div>
    </>
  );
}
