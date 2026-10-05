"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, notification, Select } from "antd";
import { useTranslations } from "next-intl";
import { useCreateSubCategoryMutation, useEditSubCategoryMutation, useGetSubCategoryQuery, useSetUpBrandQuery } from "@/api/Branding/apiBranding";
import { ColorPicker } from 'antd';
import type { ColorPickerProps } from "antd/es/color-picker";

interface AddAndUpdateSubCategoryProps {
  edit?: boolean;
  subCategoryId?: number;
  title?: string;
}

const AddAndUpdateSubCategory: React.FC<AddAndUpdateSubCategoryProps> = ({ edit, subCategoryId, title }) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [value, setValue] = useState<ColorPickerProps["value"]>("#1677ff");

  const [createSubCategory] = useCreateSubCategoryMutation();
  const [editSubCategory] = useEditSubCategoryMutation();
  const { data: subCategoryData } = useGetSubCategoryQuery(subCategoryId, { skip: !subCategoryId });
  const { data: setupData } = useSetUpBrandQuery({});

  const categories = setupData?.category_list || [];

  useEffect(() => {
    if (edit && subCategoryData) {
      form.setFieldsValue(subCategoryData);
      setValue(subCategoryData.color);
    }
  }, [edit, subCategoryData]);

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
      const body = {
        ...values,
        color: value,
      };
      if (edit) {
        await editSubCategory({ subCategoryId, ...body });
        notification.success({
          message: t('noficationAddAndUpdate.editSubCategorySuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        await createSubCategory(body);
        notification.success({
          message: t('noficationAddAndUpdate.subCategorySuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
        resetForm();
      }
      setIsModalVisible(false);
    } catch (error) {
      notification.error({
        message: edit ? t('noficationAddAndUpdate.editSubCategoryError') : t('noficationAddAndUpdate.subCategoryError'),
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
        open={isModalVisible}
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
        <Form form={form} layout="vertical" onFinish={handleOk}>
          <Form.Item name="name" label={t('form.subCategory')} rules={[{ required: true, message: t('form.required') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label={t('form.category')} rules={[{ required: true, message: t('form.required') }]}>
            <Select>
              {categories.map((category: { id: number, name: string }) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
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

export default AddAndUpdateSubCategory;
