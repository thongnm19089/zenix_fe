import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import IncomingInvoiceManagement from "@/views/private/management/finance/IncomingInvoiceManagement";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
    <BreadcrumbFunction functionName={t('functionCategory.Finance')} title={t('nav.incomingInvoice')} />
      <div>
        <IncomingInvoiceManagement />
      </div>
    </>
  );
}

