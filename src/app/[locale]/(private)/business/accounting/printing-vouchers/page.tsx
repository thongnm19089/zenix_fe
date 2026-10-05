import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import PrintingVouchers from "@/views/private/management/accounting/PrintingVouchers";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction
        functionName={t("functionCategory.Accounting")}
        title={t("detailFunction.Printing Vouchers")}
      />
      <div>
        <PrintingVouchers />
      </div>
    </>
  );
}
