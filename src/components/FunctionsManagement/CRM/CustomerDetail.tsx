import { useGetCustomerOrderQuery } from "@/api/CRM/apiLead";
import { Button, Modal, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import React, { useState } from "react";

interface DataType {
  amount_payable: any;
  order_date: string;
  order_status: any;
  payment_status: string;
  status: number;
  status_info: { color: string; status: string };
}

const CustomerDetail = ({ customer, isOrder }: { customer: any, isOrder?: boolean | undefined }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();

  const params = useParams();
  const [locale, setLocale] = useState(
    params?.locale === "vi" ? "vi-VN" : "en-US"
  );

  const { data: customerOrder } = useGetCustomerOrderQuery(customer?.id, {
    skip: !isModalOpen,
  });

  // Count the number of orders with 'fully_paid' and 'deposit' status
  const fullyPaidCount =
    customerOrder?.filter(
      (order: { payment_status: string }) =>
        order?.payment_status === "fully_paid"
    ).length || 0;
  const depositCount =
    customerOrder?.filter(
      (order: { payment_status: string }) => order?.payment_status === "deposit"
    ).length || 0;

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: `Ngày đặt hàng`,
      dataIndex: "order_date",
      width: 150,
      sorter: (a, b) => dayjs(a.order_date).unix() - dayjs(b.order_date).unix(),
      render: (_, { order_date }) => {
        return <div>{dayjs(order_date).format("DD/MM/YYYY")}</div>;
      },
    },
    {
      title: `Đơn hàng`,
      dataIndex: "ref_code",
    },
    {
      title: `${t("finance.paymentAmount")}`,
      dataIndex: "total_price",
      render: (_, record) => {
        return (
          <div className="texr-right">
            {new Intl.NumberFormat(locale).format(record?.amount_payable)}
          </div>
        );
      },
    },
    {
      title: `Trạng thái đơn hàng`,
      render: (_, { status, status_info }) => {
        return (
          <div>
            {" "}
            {status ? (
              <Tag color={status_info.color}>{status_info.status}</Tag>
            ) : (
              <Tag color="#87d068">Đã lên đơn</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: `Trạng thái thanh toán`,
      dataIndex: "payment_status",
      width: 160,
      render: (_, { payment_status }) => {
        return (
          <div className="text-center">
            {payment_status === "fully_paid" ? (
              <Tag color="#008000">{t("finance.fullyPaid")}</Tag>
            ) : (
              <Tag color="#cd201f">{t("finance.deposit")}</Tag>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div onClick={showModal} className="cursor-pointer">
        {customer?.customer_info?.name} {customer?.name}
      </div>
      <Modal
        title={`${t("crm.infoCustomer")} ${customer?.customer_info?.name ? customer?.customer_info.name : customer?.name}`}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={1000}
      >
        <div className="p-3">
          {customer?.short_name && (
            <div className="flex gap-1">
              <span className=" font-semibold"> {"admin.abbreviations"}: </span>
              {customer?.short_name}
            </div>
          )}
          {customer?.MST && (
            <div className="flex gap-1">
              <span className=" font-semibold"> {"admin.taxCode"}: </span>
              {customer?.MST}
            </div>
          )}
          <div className="flex gap-1">
            <span className=" font-semibold">
              {customer?.customer_type === "business"
                ? " Số điện thoại công ty"
                : t("user.phone")}
              :{" "}
            </span>
            <a href={`tel:${customer?.mobile}`} target="_blank">
              {customer?.mobile}
            </a>
          </div>
          {customer?.email && (
            <div className="flex gap-1">
              <span className=" font-semibold">
                {customer?.customer_type === "business"
                  ? "Email công ty"
                  : t("user.email")}
                :{" "}
              </span>
              <a href={`tel:${customer?.email}`} target="_blank">
                {customer?.email}
              </a>
            </div>
          )}

          {customer?.address && (
            <div className="flex gap-1">
              <span className=" font-semibold">{t("user.address")}: </span>
              {customer.address}, {customer.ward}, {customer.district},
              {customer.city}
            </div>
          )}
        </div>
        {isOrder && (
          <>
            <div className="mb-3 flex justify-between px-3 font-semibold">
              <div>Tổng số đơn hàng : {customerOrder?.length || 0}</div>
              <div className="text-green-500">
                Đơn hàng đã thanh toán hết : {fullyPaidCount}
              </div>
              <div className="text-red-500">
                Đơn hàng còn nợ : {depositCount}
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={customerOrder || []}
              locale={{ emptyText: "Khách hàng này chưa có đơn nào" }}
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default CustomerDetail;
