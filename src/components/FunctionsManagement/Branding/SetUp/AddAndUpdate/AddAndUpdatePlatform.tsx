import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, notification, ColorPicker } from "antd";
import { useTranslations } from "next-intl";
import { useCreatePlatformMutation, useEditPlatformMutation, useGetPlatformQuery } from "@/api/Branding/apiBranding";

const AddAndUpdatePlatform = ({
  edit,
  platformId,
  title,
}: {
  edit?: boolean;
  platformId?: number;
  title?: string;
}) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [createPlatform, { isLoading: isLoadingAdd }] = useCreatePlatformMutation();
  const [editPlatform, { isLoading: isLoadingEdit }] = useEditPlatformMutation();
  const { data: platformData } = useGetPlatformQuery(platformId, { skip: !platformId });
  const [value, setValue] = useState<string>("#1677ff");

  useEffect(() => {
    if (edit && platformData) {
      form.setFieldsValue(platformData);
      setValue(platformData.color);
    }
  }, [edit, platformData]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = async (values: any) => {
    if (edit) {
      const result = await editPlatform({ platformId, ...values, color: value });
      if (result && "error" in result) {
        notification.error({
          message: t('noficationAddAndUpdate.platformEditError'),
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        notification.success({
          message: t('noficationAddAndUpdate.platformEditSuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } else {
      const result = await createPlatform({ ...values, color: value });
      if (result && "error" in result) {
        notification.error({
          message: t('noficationAddAndUpdate.platformCreateError'),
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        notification.success({
          message: t('noficationAddAndUpdate.platformCreateSuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
      }
    }
    setIsModalVisible(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal} size={edit ? "small" : "middle"} className={edit ? "bg-teal-600 hover:!bg-teal-500" : ""}>
        {edit ? `${t('general.edit')}` : title}
      </Button>
      <Modal title={title} visible={isModalVisible} footer={null} onCancel={handleCancel}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label={t('form.platformName')} rules={[{ required: true, message: t('form.required') }]}>
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
          <div className="flex justify-end gap-2">
            <Button type="primary" htmlType="submit" className=" mb-2" loading={edit ? isLoadingEdit : isLoadingAdd}>
              {t("general.confirm")}
            </Button>
            <Button onClick={handleCancel}>{t("general.cancel")}</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AddAndUpdatePlatform;
