"use client";
import React, { useState } from "react";
import { Button, Input, Table } from "antd";
import { useTranslations } from "next-intl";
import Modal from "antd/lib/modal/Modal";
import { ColumnsType } from "antd/lib/table";

interface DataType {
  key: React.Key;
  accountName: string;
  bankAccount: string;
  voucher: {
    ref_code: string;
    date: string;
  };
  amount_incurred: {
    debit: number;
    credit: number;
  };
  ending_balance: {
    debit: number;
    credit: number;
  };
}
const columns: ColumnsType<DataType> = [

  {
    title: "Số hiệu TK",
    dataIndex: "accountName",
    key: "accountName",
    width: 70,
    fixed: "left",
  },

  {
    title: "Tên Tài Khoản",
    dataIndex: "bankAccount",
    key: "bankAccount",
    width: 300,
    align: "center",
    render: (text: string) => <div className="text-left">{text}</div>,
  },
  {
    title: "Số dư đầu năm",
    children: [
      {
        title: "Nợ",
        width: 100,
        render: (_, { amount_incurred }) => {
          return new Intl.NumberFormat("vi-VN").format(amount_incurred.debit);
        },
      },

      {
        title: "Có",
        width: 100,
        render: (_, { amount_incurred }) => {
          return new Intl.NumberFormat("vi-VN").format(amount_incurred.credit);
        },
      },
    ],
  },
  {
    title: "Số phát sinh trong năm",
    children: [
      {
        title: "Nợ",
        width: 100,
        render: (_, { amount_incurred }) => {
          return new Intl.NumberFormat("vi-VN").format(amount_incurred.debit);
        },
      },

      {
        title: "Có",
        width: 100,
        render: (_, { amount_incurred }) => {
          return new Intl.NumberFormat("vi-VN").format(amount_incurred.credit);
        },
      },
    ],
  },
  {
    title: "Số dư cuối năm",
    children: [
      {
        title: "Nợ",
        width: 100,
        render: (_, { amount_incurred }) => {
          return new Intl.NumberFormat("vi-VN").format(amount_incurred.debit);
        },
      },

      {
        title: "Có",
        width: 100,
        render: (_, { amount_incurred }) => {
          return new Intl.NumberFormat("vi-VN").format(amount_incurred.credit);
        },
      },
    ],
  },
];

const tableHeader = (
  <div className="p-5 mt-[100px]">
    <div className="w-[200px] text-center absolute -top-10 right-8 z-10 mt-[150px] text-xs">
      <h1 className="font-bold">Mẫu số F01 - DNN</h1>
      <p>(Ban hành theo Thông tư số 133/2016/TT-BTC ngày 26/8/2016 của Bộ Tài chính)</p>
    </div>
    <div className="text-center font-semibold text-2xl mt-[20px]">
      Bảng cân đối tài khoản
    </div>
    <div className="text-center">
      <span>
        Năm <Input size="small" className="w-15 ml-1"></Input>
      </span>
    </div>
  </div>
);

const data: DataType[] = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    accountName: "1121",
    voucher: { ref_code: `HD00 ${i + 1}`, date: "13/1/2024" },
    bankAccount: "Khoản phải thu của khách hàng",
    amount_incurred: { debit: 20000, credit: 10000 },
    ending_balance: { debit: 20000, credit: 10000 },
  });
}

function FinancialStatements() {
  const renderFooter = () => {
    return (
      <div className="mr-[12px]">
        <div className="flex font-semibold">
          <div className="flex-1 py-2 px-5 text-center">Tổng Cộng</div>
          <div className="w-[157px] border-l py-2 px-3"></div>
          <div className="w-[157px] border-l py-2 px-3 "></div>
          <div className="w-[157px] border-l py-2 px-3"></div>
          <div className="w-[157px] border-l py-2 px-3"></div>
          <div className="w-[157px] border-l py-2 px-3 "></div>
          <div className="w-[157px] border-l py-2 px-3"></div>
        </div>
      </div>
    );
  };
  return (
    <div className="px">
      {/* <Row gutter={16} className="font-semibold">
        <Col span={2} className="border border-red-800 flex justify-center items-center py-1">
          Ngày ghi sổ
        </Col>
        <Col span={4} className="border-r border-y border-red-800 !px-0">
          <Row className="h-full">
            <Col span={24} className="border-b border-red-800 flex justify-center items-center">
              Chứng từ
            </Col>
            <Col span={12} className="border-r border-red-800 flex justify-center items-center">
              Số
            </Col>
            <Col span={12} className="flex justify-center items-center">
              Ngày
            </Col>
          </Row>
        </Col>
        <Col span={5} className="border-r border-y border-red-800 flex justify-center items-center">
          Diễn giải
        </Col>
        <Col span={1} className="border-r border-y border-red-800 flex justify-center items-center text-center">
          Tk đối ứng
        </Col>
        <Col span={6} className="border-r border-y border-red-800 !px-0">
          <Row className="h-full">
            <Col span={24} className="border-b border-red-800 flex justify-center items-center py-1">
              Số tiền phát sinh
            </Col>
            <Col span={12} className="border-r border-red-800 flex justify-center items-center py-1">
              Nợ
            </Col>
            <Col span={12} className="flex justify-center items-center py-1">
              Có
            </Col>
          </Row>
        </Col>
        <Col span={6} className="border-r border-y border-red-800 !px-0">
          <Row className="h-full">
            <Col span={24} className="border-b border-red-800 flex justify-center items-center">
              Số dư cuối kỳ
            </Col>
            <Col span={12} className="border-r border-red-800 flex justify-center items-center">
              Nợ
            </Col>
            <Col span={12} className="flex justify-center items-center">
              Có
            </Col>
          </Row>
        </Col>
      </Row>
    
      <Row gutter={16}>
        <Col span={2} className="border-x border-b border-red-800 flex justify-center items-center py-1">
          12/1/2024
        </Col>

        <Col span={2} className="border-r border-b border-red-800 flex justify-center items-center">
          HD0001
        </Col>
        <Col span={2} className="border-b border-r border-red-800 flex justify-center items-center">
          12/1/2024
        </Col>

        <Col span={5} className="border-r border-b border-red-800 flex justify-center items-center">
          Mua rau thịt
        </Col>
        <Col span={1} className="border-r border-b border-red-800 flex justify-center items-center text-center">
          111
        </Col>
        <Col span={3} className="border-r border-b border-red-800 flex justify-center items-center">
          200.0000
        </Col>
        <Col span={3} className="border-b border-r border-red-800 flex justify-center items-center">
          100.0000
        </Col>
        <Col span={3} className="border-r border-b border-red-800 flex justify-center items-center">
          200.0000
        </Col>
        <Col span={3} className="border-b border-r border-red-800 flex justify-center items-center">
          100.0000
        </Col>
      </Row> */}
      <div>
        {tableHeader}
        <Table columns={columns} dataSource={data} bordered size="middle" scroll={{ y: 450 }} footer={renderFooter} />
      </div>

    </div>
  );
}

export default FinancialStatements;

