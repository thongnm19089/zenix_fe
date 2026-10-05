import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import WarehouseManagement from "@/views/private/management/inventory/WarehouseManagement";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
    const t: any = useTranslations();
    return (
        <>
            <BreadcrumbFunction functionName={t('functionCategory.Inventory')} title={t('detailFunction.Warehouse Management')} />
            <div>
                <WarehouseManagement />
            </div>
        </>
    );
}