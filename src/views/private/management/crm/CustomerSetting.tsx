"use client";

import { Avatar, List } from "antd";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

const CustomerSetting = () => {
    const t: any = useTranslations();

    const crmData = [
        {
            title: t("nav.contactConfiguration"),
            link: "/business/admin/contact-configuration",
        },
        {
            title: t("nav.saleMarketingDelegation"),
            link: "/business/admin/sale-marketing-delegation",
        },
    ];

    return (
        <div className="flex items-center xl:container h-full mt-4">
            <div className=" w-full grid grid-cols-1  md:grid-cols-2 gap-4 md:gap-8 ">
                <div>
                    <List
                        header={<div className="text-base font-bold text-red-500 uppercase">{t("nav.crm")}</div>}
                        className="w-full"
                        bordered
                        itemLayout="horizontal"
                        dataSource={crmData}
                        renderItem={(item, index) => (
                            <List.Item actions={[<Link href={item.link}>{t("admin.view")}</Link>]}>
                                <List.Item.Meta title={<Link href={item.link}>{item.title}</Link>} />
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomerSetting;
