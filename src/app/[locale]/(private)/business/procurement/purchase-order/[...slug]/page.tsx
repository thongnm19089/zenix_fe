import BreadcrumbDetail from "@/components/Breadcrumb/BreadcrumbDetail";
import AddAndUpdatePurchaseOrder from "@/components/FunctionsManagement/Procurement/AddAndUpdatePurchaseOrder";
import { useTranslations } from "next-intl";
import React from "react";

export default function page({ params }: { params: any }) {
  const t: any = useTranslations();
  return (
    <div className="mt-5">
      <BreadcrumbDetail
        title={t('noficationAddAndUpdate.addOrder')}
        pageName={t('functionCategory.Procurement')}
        pageLink="/business/procurement/purchase-order"
        functionName={t('detailFunction.Purchase Order')}
      />
      <div>
        <AddAndUpdatePurchaseOrder />
      </div>
    </div>
  );
}
