"use client";

import LedgerTable from "@/components/FunctionsManagement/Accounting/LedgerTable";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import React from "react";

const GeneralLedger = () => {
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Sổ tổng hợp kho",
      children: <InventoryGeneralLedger />,
    },
    {
      key: "2",
      label: "Sổ tổng họp các tài khoản",
      children: <AccountGeneralLedger />,
    },
  ];

  return <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;
};

export default GeneralLedger;

const InventoryGeneralLedger = () => {
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

const AccountGeneralLedger = () => {
  return (
    <div>
      <div className="my-2 font-semibold">
        <div>Số tài khoản</div>
        <div>Tên tài khoản</div>
      </div>

      <LedgerTable />
    </div>
  );
};
