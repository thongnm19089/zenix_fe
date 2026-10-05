import Breadcrumb from "@/components/Breadcrumb/BreadcrumbFunction";
import AddAndUpdateProduct from "@/components/FunctionsManagement/CRM/Products/AddAndUpdateProduct";
import { useTranslations } from "next-intl";
import React from "react";

export default function page({ params }: { params: any }) {
  const t: any = useTranslations();

  return <AddAndUpdateProduct productId={params.slug[1]} />;
}
