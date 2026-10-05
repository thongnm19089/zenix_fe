"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, notification, Select, ColorPicker } from "antd";
import { useTranslations } from "next-intl";
import { useCreateBrandingChannelMutation, useEditBrandingChannelMutation, useGetBrandingChannelQuery, useSetUpBrandQuery } from "@/api/Branding/apiBranding";

interface AddAndUpdateBrandingChannelProps {
  edit?: boolean;
  brandingChannelId?: number;
  title: string;
}

const AddAndUpdateBrandingChannel: React.FC<AddAndUpdateBrandingChannelProps> = ({ edit = false, brandingChannelId, title }) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [value, setValue] = useState<string>("#1677ff");

  const [createBrandingChannel] = useCreateBrandingChannelMutation();
  const [editBrandingChannel] = useEditBrandingChannelMutation();
  const { data: brandingChannelData } = useGetBrandingChannelQuery(brandingChannelId, { skip: !brandingChannelId });
  const { data: setupData } = useSetUpBrandQuery({});

  const platforms = setupData?.platform_list || [];

  useEffect(() => {
    if (edit && brandingChannelData) {
      form.setFieldsValue(brandingChannelData);
      setValue(brandingChannelData.color);
    }
  }, [edit, brandingChannelData]);

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
        await editBrandingChannel({ brandId: brandingChannelId, ...body });
        notification.success({
          message: t('noficationAddAndUpdate.editBrandingChannelSuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        await createBrandingChannel(body);
        notification.success({
          message: t('noficationAddAndUpdate.brandingChannelSuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
        resetForm();
      }
      setIsModalVisible(false);
    } catch (error) {
      notification.error({
        message: edit ? t('noficationAddAndUpdate.editBrandingChannelError') : t('noficationAddAndUpdate.brandingChannelError'),
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
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('form.channel')} rules={[{ required: true, message: t('form.required') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label={t('form.type')} rules={[{ required: true, message: t('form.required') }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="platform"
            label={t('form.platformName')}
            rules={[{ required: true, message: t('form.required') }]}
          >
            <Select>
              {platforms.map((platform: { id: number, name: string }) => (
                <Select.Option key={platform.id} value={platform.id}>
                  {platform.name}
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

export default AddAndUpdateBrandingChannel;
