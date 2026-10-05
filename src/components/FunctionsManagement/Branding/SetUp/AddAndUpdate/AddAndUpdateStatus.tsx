"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, notification, Checkbox, ColorPicker } from "antd";
import { useTranslations } from "next-intl";
import { useCreateStatusMutation, useEditStatusMutation, useGetStatusQuery } from "@/api/Branding/apiBranding";

const AddAndUpdateStatus = ({
  edit,
  statusId,
  title,
}: {
  edit?: boolean;
  statusId?: number;
  title?: string;
}) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [createStatus] = useCreateStatusMutation();
  const [editStatus] = useEditStatusMutation();
  const { data: statusData } = useGetStatusQuery(statusId, { skip: !statusId });
  const [value, setValue] = useState<string>("#1677ff");

  useEffect(() => {
    if (edit && statusData) {
      form.setFieldsValue(statusData);
      setValue(statusData.color);
    }
  }, [edit, statusData]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (edit) {
        await editStatus({ statusId, ...values, color: value });
        notification.success({
          message: t('noficationAddAndUpdate.statusEditSuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        await createStatus({ ...values, color: value });
        notification.success({
          message: t('noficationAddAndUpdate.statusCreateSuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
      }
      setIsModalVisible(false);
    } catch (error) {
      notification.error({
        message: edit ? t('noficationAddAndUpdate.statusEditError') : t('noficationAddAndUpdate.statusCreateError'),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}
        className={edit ? "bg-teal-600 hover:!bg-teal-500" : ""}
        size={edit ? "small" : "middle"}
      >
        {edit ? `${t('general.edit')}` : title}
      </Button>
      <Modal title={title} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('form.status')} rules={[{ required: true, message: t('form.required') }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="color"
            label={t('form.color')}
          >
            <ColorPicker
              value={value}
              onChange={(color) => setValue(color.toHexString())}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddAndUpdateStatus;
