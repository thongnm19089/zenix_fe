import { useEditInventoryMutation } from "@/api/Inventory/apiInventory";
import { Button, Form, InputNumber, Modal, Select, Tag, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";

const { Option } = Select;

const AlertLevel = ({ inventoryDetail }: { inventoryDetail: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editInventory] = useEditInventoryMutation();
  const t: any = useTranslations();
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    try {
      const body = {
        id: inventoryDetail.id,
        alert_level: values.alert_level,
      };
      const result = await editInventory(body);

      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.addFailureWarning')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.addWarningSuccess')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    form.setFieldsValue({ alert_level: inventoryDetail.alert_level });
  }, [inventoryDetail]);

  return (
    <>
      <Button type="link" onClick={showModal}>
        <Tag color={!inventoryDetail.is_below_alert_level ? "blue" : "red"}>{inventoryDetail.quantity}</Tag>
      </Button>
      <Modal title="Cảnh báo" open={isModalOpen} footer={null} onCancel={handleCancel} width={300}>
        <div>
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={onFinish} form={form}>
            <div className="text-red-500 font-semibold">Hiển thị cảnh báo kho số SP dưới mức</div>
            <div className="my-4 flex gap-1 w-full">
              <Form.Item name="alert_level" noStyle className="w-full">
                <InputNumber className="w-full" />
              </Form.Item>
              <Button type="primary" htmlType="submit">
               {t('general.confirm')}
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default AlertLevel;
