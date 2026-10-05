import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import BookkeepingEntries from "@/views/private/management/accounting/BookkeepingEntries";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction
        functionName={t("functionCategory.Accounting")}
        title={t("detailFunction.Bookkeeping Entries")}
      />
      <div>
        <BookkeepingEntries />
      </div>
    </>
  );
}
