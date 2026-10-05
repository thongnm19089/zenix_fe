import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import OutcomingInvoiceManagement from "@/views/private/management/finance/OutcomingInvoiceManagement";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
    <BreadcrumbFunction functionName={t('functionCategory.Finance')} title={t('nav.outcomingInvoice')} />
      <div>
        <OutcomingInvoiceManagement />
      </div>
    </>
  );
}
