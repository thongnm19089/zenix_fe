import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import FinancialStatements from "@/views/private/management/accounting/FinancialStatements";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction
        functionName={t("functionCategory.Accounting")}
        title={t("detailFunction.Financial Statements")}
      />
      <div>
        <FinancialStatements />
      </div>
    </>
  );
}
