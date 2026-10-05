import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import AccountList from "@/views/private/management/accounting/AccountList";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t("functionCategory.Accounting")} title={t("detailFunction.Account List")} />
      <div>
        <AccountList />
      </div>
    </>
  );
}
