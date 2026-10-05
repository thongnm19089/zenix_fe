"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, notification, ColorPicker } from "antd";
import { useTranslations } from "next-intl";
import { useCreateCategoryMutation, useEditCategoryMutation, useGetCategoryQuery } from "@/api/Branding/apiBranding";

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
          message: t('noficationAddAndUpdate.directorySuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        await createCategory({ ...values, color: value });
        notification.success({
          message: t('noficationAddAndUpdate.addedCategorySuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
        resetForm();
      }
      setIsModalVisible(false);
    } catch (error) {
      notification.error({
        message: edit ? t('noficationAddAndUpdate.directoryError') : t('noficationAddAndUpdate.addedCategoryError'),
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
            label={t('form.category')}
            rules={[{ required: true, message: t('form.required') }]}
          >
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

export default AddAndUpdateCategory;
