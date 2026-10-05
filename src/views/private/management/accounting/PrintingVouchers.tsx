"use client";

import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useTranslations } from "next-intl";
import React from "react";
import PrintingVoucherss from "@/components/FunctionsManagement/Accounting/PrintingVouchers";
import AccountingBill from "@/components/FunctionsManagement/Accounting/AccountingBill";


// Phiếu thu
const Receipts = () => {
  const t: any = useTranslations();

  return (
    <>
      <PrintingVoucherss />
    </>
  );
};

// Phiếu chi
const Payments = () => {
  const t: any = useTranslations();

  return (
    <>
      <PrintingVoucherss payment={true}/>
    </>
  );
};

// Phiếu kế toán

const PrintingVouchers: React.FC = () => {
  const t: any = useTranslations();
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Phiếu kế toán",
      children: <AccountingBill />,
    },
    {
      key: "2",
      label: "Phiếu thu",
      children: <Receipts />,
    },
    {
      key: "3",
      label: "Phiếu chi",
      children: <Payments />,
    },

  ];

  return <Tabs className="p-6" defaultActiveKey="1" items={items} onChange={onChange} />;
};

export default PrintingVouchers;
