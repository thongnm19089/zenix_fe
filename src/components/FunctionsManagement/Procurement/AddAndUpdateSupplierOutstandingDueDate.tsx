"use client";

import { useEditOrderMutation } from "@/api/CRM/apiOrder";
import { useUpdateSupplierOutstandingDueDateMutation } from "@/api/Procurement/apiProcurement";
import { Button, Form, DatePicker, Modal, notification } from "antd";
import React, { useEffect, useState } from "react";
import { MdMoreTime } from "react-icons/md";
import { useTranslations } from "next-intl";
import dayjs from 'dayjs';

function AddAndUpdateSupplierOutstandingDueDate({
  purchaseOrderId,
  dueDate,
  refetch,
  edit = false
}: {
  purchaseOrderId: any;
  dueDate?: string;
  refetch: any;
  edit?: boolean;
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
  const [useUpdateSupplierOutstandingDueDate, { isLoading: isLoadingUpdate }] = useUpdateSupplierOutstandingDueDateMutation();

  // Set the initial form value when the component mounts or when dueDate changes
  useEffect(() => {
    if (edit && dueDate) {
      form.setFieldsValue({ dueDate: dayjs(dueDate) });
    }
  }, [edit, dueDate, form]);

  const onFinish = async (values: { dueDate: any }) => {
    const { dueDate } = values;

    try {
      const body = {
        id: purchaseOrderId, // Giả sử bạn cần ID của đơn hàng để cập nhật
        due_date: dueDate.format("YYYY-MM-DD"), // Định dạng ngày
      };
      let result;
      result = await useUpdateSupplierOutstandingDueDate(body);
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
        refetch();
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
      <Button
        type="dashed"
        danger
        style={{ backgroundColor: "green", borderColor: "green", color: "white" }}
        onClick={showModal}
        icon={<MdMoreTime className="-mb-1" size={20} />}
      >
        {edit ? t('finance.editDueDate') : t('finance.addDueDate')}
      </Button>

      <Modal
        title={edit ? t('finance.editDueDate') : t('finance.addDueDate')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={300}
      >
        <Form onFinish={onFinish} form={form} className="mt-4">
          <Form.Item name="dueDate" className="mb-3">
            <DatePicker className="w-full" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={isLoadingUpdate}>
            {t('general.confirm')}
          </Button>
        </Form>
      </Modal>
    </>
  );
}

export default AddAndUpdateSupplierOutstandingDueDate;
