"use client";

import LedgerTable from "@/components/FunctionsManagement/Accounting/LedgerTable";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import React from "react";

const DetailedLedger = () => {
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Sổ chi tiết hàng tồn kho",
      children: <InventoryLedger />,
    },
    {
      key: "2",
      label: "Sổ chi tiết các tài khoản",
      children: <AccountSubsidiaryLedger />,
    },
  ];

  return <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;
};

export default DetailedLedger;

const InventoryLedger = () => {
  return (
    <div className="px-6">
      <div className="my-2 flex gap-10 font-semibold">
        <div>Số tài khoản</div>
        <div>Tên tài khoản</div>
      </div>

      <LedgerTable />
    </div>
  );
};

const AccountSubsidiaryLedger = () => {
  return (
    <div className="px-6">
      <div className="my-2 flex gap-10 font-semibold">
        <div>Số tài khoản</div>
        <div>Tên tài khoản</div>
      </div>

      <LedgerTable />
    </div>
  );
};
