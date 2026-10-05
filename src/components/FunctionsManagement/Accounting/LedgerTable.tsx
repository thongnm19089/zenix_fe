"use client";

import { Col, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import React from "react";

interface DataType {
  key: React.Key;
  date: string;
  description: string;
  corresponding_acc: number;
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
    title: "Ngày ghi sổ",
    dataIndex: "date",
    key: "date",
    width: 100,
    fixed: "left",
  },

  {
    title: "Chứng từ",
    children: [
      {
        title: "Số",
        width: 150,
        render: (_, { voucher }) => {
          return <div className="">{voucher.ref_code}</div>;
        },
      },

      {
        title: "Ngày",
        width: 150,
        render: (_, { voucher }) => {
          return <div className="">{voucher.date}</div>;
        },
      },
    ],
  },
  {
    title: "Diễn giải",
    dataIndex: "description",
    key: "description",
    width: 400,
    align: "center",
    render: (text: string) => <div className="text-left">{text}</div>,
  },
  {
    title: "TK đối ứng",
    dataIndex: "corresponding_acc",
    key: "corresponding_acc",
    width: 100,
    align: "center",
    render: (text: string) => <div className="text-left">{text}</div>,
  },
  {
    title: "Số tiền phát sinh",
    children: [
      {
        title: "Nợ",
        width: 150,
        render: (_, { amount_incurred }) => {
          return new Intl.NumberFormat("vi-VN").format(amount_incurred.debit);
        },
      },

      {
        title: "Có",
        width: 150,
        render: (_, { amount_incurred }) => {
          return new Intl.NumberFormat("vi-VN").format(amount_incurred.credit);
        },
      },
    ],
  },
  {
    title: "Số dư cuối kỳ",
    children: [
      {
        title: "Nợ",
        width: 150,
        render: (_, { ending_balance }) => {
          return new Intl.NumberFormat("vi-VN").format(ending_balance.debit);
        },
      },

      {
        title: "Có",
        width: 150,
        render: (_, { ending_balance }) => {
          return new Intl.NumberFormat("vi-VN").format(ending_balance.credit);
        },
      },
    ],
  },
];

const data: DataType[] = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    date: "12/1/2024",
    voucher: { ref_code: `HD00 ${i + 1}`, date: "13/1/2024" },
    description: "Lake Street 42, Lake Street 42 Lake Street 42",
    corresponding_acc: 123,
    amount_incurred: { debit: 20000, credit: 10000 },
    ending_balance: { debit: 20000, credit: 10000 },
  });
}

function LedgerTable() {
  const renderFooter = () => {
    return (
      <div className="mr-[12px]">
        <div className="flex  font-semibold">
          <div className="flex-1 py-2 text-center">SỐ DƯ ĐẦU KỲ</div>
          <div className="w-[157px] border-l py-2 px-3"></div>
          <div className="w-[157px] border-l py-2 px-3 "></div>
          <div className="w-[157px] border-l py-2 px-3"></div>
          <div className="w-[157px] border-x py-2 px-3"></div>
        </div>
        <div className="flex  font-semibold border-y">
          <div className="flex-1 py-2 text-center">TỔNG SỐ PHÁT SINH</div>
          <div className="w-[157px] border-l py-2 px-3"></div>
          <div className="w-[157px] border-l py-2 px-3 "></div>
          <div className="w-[157px] border-l py-2 px-3"></div>
          <div className="w-[157px] border-x py-2 px-3"></div>
        </div>
        <div className="flex  font-semibold ">
          <div className="flex-1 py-2 text-center">SỐ DƯ CUỐI KỲ</div>
          <div className="w-[157px] border-l py-2 px-3"></div>
          <div className="w-[157px] border-l py-2 px-3 "></div>
          <div className="w-[157px] border-l py-2 px-3"></div>
          <div className="w-[157px] border-x py-2 px-3"></div>
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

      <Table columns={columns} dataSource={data} bordered size="middle" scroll={{ y: 450 }} footer={renderFooter} />
    </div>
  );
}

export default LedgerTable;
