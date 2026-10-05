import BreadcrumbDetail from "@/components/Breadcrumb/BreadcrumbDetail";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import AddAndUpdateOrderTabContainer from "@/components/FunctionsManagement/CRM/Order/AddAndUpdateOrder";
import { useTranslations } from "next-intl";
import React from "react";

export default function page({ params }: { params: any }) {
  const t: any = useTranslations();
  return (
    <div className="mt-5">
      <BreadcrumbDetail
        title={
          params.slug[1]
            ? t("noficationAddAndUpdate.updateOrder")
            : t("noficationAddAndUpdate.addNewOrder")
        }
        pageName={t("nav.orderManagement")}
        pageLink="/business/crm/order-management"
        functionName={t("functionCategory.CRM")}
      />
      <div>
        <AddAndUpdateOrderTabContainer />
      </div>
    </div>
  );
}
