import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import DetailedLedger from "@/views/private/management/accounting/DetailedLedger";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t("functionCategory.Accounting")} title={t("detailFunction.Detailed Ledger")} />
      <div>
        <DetailedLedger />
      </div>
    </>
  );
}
