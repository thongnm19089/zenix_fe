"use client";

import { useEditOrderMutation } from "@/api/CRM/apiOrder";
import { Button, Form, DatePicker, Modal, notification } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import dayjs from 'dayjs';

function UpdateOrderDate({
  record,
  // refetch,
}: {
  record: any;
  // refetch: any;
}) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [form] = Form.useForm();
  const [editOrder, { isLoading: isLoadingEdit }] = useEditOrderMutation();

  // Set the initial form value when the component mounts or when dueDate changes
  useEffect(() => {
    if (record.order_date) {
      form.setFieldsValue({ orderDate: dayjs(record.order_date) });
    }
  }, [record, form]);

  const onEdit = async (values: any) => {
    try {
      const body = {
        id: record.id, // Giả sử bạn cần ID của đơn hàng để cập nhật
        order_date: values.orderDate.format("YYYY-MM-DD"), // Định dạng ngày
      };
      let result;
      result = await editOrder(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.editOrderError')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        notification.success({
          message: `${t('noficationAddAndUpdate.editOrderSuccess')}`,
          placement: "bottomRight",
          className: "h-16",
        });
        setIsModalOpen(false);
        // refetch();
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: `${t('general.error')}`,
        placement: "bottomRight",
      });
    }
  };

  return (
    <>
      <Button type="link" onClick={showModal} className="p-0">
        {dayjs(record?.order_date).format("DD/MM/YYYY")}
      </Button>

      <Modal
        title={t('crm.editOrderDate')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={300}
      >
        <Form onFinish={onEdit} form={form} className="mt-4">
          <Form.Item name="orderDate" className="mb-3">
            <DatePicker className="w-full" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={isLoadingEdit}>
            {t('general.confirm')}
          </Button>
        </Form>
      </Modal>
    </>
  );
}

export default UpdateOrderDate;
