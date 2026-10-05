"use client";

import LedgerTable from "@/components/FunctionsManagement/Accounting/LedgerTable";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import React from "react";

const OtherLedgers = () => {
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Sổ cái",
      children: <GeneralLedger />,
    },
    {
      key: "2",
      label: "Sổ quỹ",
      children: <CashLedger />,
    },
    {
      key: "3",
      label: "Sổ chi phí",
      children: <ExpenseLedge />,
    },
    {
      key: "4",
      label: "Sổ nhật ký chung",
      children: <GeneralJournal />,
    },
  ];

  return <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;
};

export default OtherLedgers;

const GeneralLedger = () => {
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

const ExpenseLedge = () => {
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

const GeneralJournal = () => {
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

const CashLedger = () => {
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
