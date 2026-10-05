import Warehouse from "@/views/private/admin/Warehouse";
import React from "react";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import { useTranslations } from "next-intl";

export default function page() {
    const t: any = useTranslations();
    return (
        <>
            <BreadcrumbFunction title={t('nav.warehouseManagement')} functionName={t('admin.administrator')} />
            <div>
                <Warehouse />
            </div>
        </>
    );
}