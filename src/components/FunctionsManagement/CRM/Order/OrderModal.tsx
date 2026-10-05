// OrderModal Component
import React from "react";
import { Modal, Table } from "antd";
import dayjs from 'dayjs';
import { useTranslations } from "next-intl";


interface OrderModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  order_list: any[];
}

const OrderModal: React.FC<OrderModalProps> = ({ isModalOpen, setIsModalOpen, order_list }) => {
  const handleCancel = () => {
    setIsModalOpen(false);
   

  };
  const t: any = useTranslations();
  const columns = [
    {
      title: `${t('crm.refcode')}`,
      dataIndex: "ref_code",
      key: "ref_code",
    },
    {
      title:`${t('crm.bookingDate')}` ,
      dataIndex: "order_date",
      key: "order_date",
      render: (text: string | number | Date | dayjs.Dayjs | null | undefined) => dayjs(text).format("HH:mm DD/MM/YYYY"),
    },
    {
      title:`${t('crm.theMoneyHaveToPay')}` ,
      dataIndex: "amount_payable",
      key: "amount_payable",
      render: (amount: number | bigint) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
    },
  ];

  return (
    <Modal title={t('crm.informationLine')} open={isModalOpen} footer={null} onCancel={handleCancel}>
      <Table dataSource={order_list} columns={columns} pagination={false} />
    </Modal>
  );
};

export default OrderModal;
