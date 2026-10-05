import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import Products from "@/views/private/management/procurement/Products";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
  const t: any = useTranslations();
  return (
    <>
      <BreadcrumbFunction functionName={t("functionCategory.Procurement")} title="Danh sách sản phẩm" />
      <div>
        <Products />
      </div>
    </>
  );
}
