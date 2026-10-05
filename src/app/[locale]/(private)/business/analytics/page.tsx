import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import ListAnalytics from "@/views/private/management/dashboard/ListAnalytics";
import { useTranslations } from "next-intl";
import React from "react";

export default function page() {
    const t: any = useTranslations();
    return (
        <>
            <BreadcrumbFunction functionName={t('functionCategory.Analytics')} title={""} />
            <div>
                <ListAnalytics />
            </div>
        </>
    );
}
