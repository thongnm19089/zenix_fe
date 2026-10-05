import BreadcrumbDetail from "@/components/Breadcrumb/BreadcrumbDetail";
import AddAndUpdateQuotation from "@/components/FunctionsManagement/CRM/Quotation/AddAndUpdateQuotation";
import { useTranslations } from "next-intl";
import React from "react";

export default function page({ params }: { params: any }) {
  const t: any = useTranslations();
  return (
    <div className="mt-5">
      <BreadcrumbDetail
        title="Tạo báo giá"
        pageName={t("functionCategory.Procurement")}
        pageLink="/business/procurement/purchase-order"
        functionName={t("detailFunction.Purchase Order")}
      />
      <div>
        <AddAndUpdateQuotation />
      </div>
    </div>
  );
}
