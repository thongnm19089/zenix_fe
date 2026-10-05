"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, notification, ColorPicker } from "antd";
import { useTranslations } from "next-intl";
import { useCreateCategoryMutation, useEditCategoryMutation, useGetCategoryQuery } from "@/api/Learning/apiLearning";

const AddAndUpdateCategory = ({
  edit,
  categoryId,
  title
}: {
  edit?: boolean;
  categoryId?: number;
  title?: string;
}) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [value, setValue] = useState<string>("#1677ff");

  const [createCategory] = useCreateCategoryMutation();
  const [editCategory] = useEditCategoryMutation();
  const { data: categoryData } = useGetCategoryQuery(categoryId, { skip: !categoryId });

  useEffect(() => {
    if (edit && categoryData) {
      form.setFieldsValue(categoryData);
      setValue(categoryData.color);
    }
  }, [edit, categoryData]);

  const resetForm = () => {
    form.resetFields();
    setValue("#1677ff"); 
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    resetForm();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (edit) {
        await editCategory({ categoryId, ...values, color: value });
        notification.success({
          message: t('notificationUpdate.categorySuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        await createCategory({ ...values, color: value });
        notification.success({
          message: t('notificationCreate.categorySuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
        resetForm(); 
      }
      setIsModalVisible(false);
    } catch (error) {
      notification.error({
        message: edit ? t('notificationUpdate.categoryError') : t('notificationCreate.categoryError'),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {edit ? `${t('general.edit')}` : title}
      </Button>
      <Modal
        title={title}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            {t("general.cancel")}
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            {t("general.confirm")}
          </Button>
        ]}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t('form.name')}
            rules={[{ required: true, message: t('form.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="color"
            label={t('form.color')}
            rules={[{ required: true, message: t('form.required') }]}
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

export default AddAndUpdateCategory;
