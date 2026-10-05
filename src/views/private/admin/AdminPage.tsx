"use client";

import { Avatar, List } from "antd";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

const AdminPage = () => {
  const t: any = useTranslations();

  const companyManagement = [
    {
      title: t("nav.companyInformation"),
      link: "/business/admin/company-information",
    },
    {
      title: t("nav.userAccount"),
      link: "/business/admin/user-account",
    },
  ];

  return (
    <div className="flex items-center xl:container h-full">
      <div className=" w-full grid grid-cols-1  md:grid-cols-2 gap-4 md:gap-8 ">
        <div>
          <List
            header={<div className="text-base font-bold text-red-500 uppercase">{t("nav.companyManagement")}</div>}
            className="w-full"
            bordered
            itemLayout="horizontal"
            dataSource={companyManagement}
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

export default AdminPage;
