"use client";

import { useEditOrderMutation } from "@/api/CRM/apiOrder";
import { Button, Form, DatePicker, Modal, notification, Select } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import dayjs from 'dayjs';
const { Option } = Select;

function UpdateOrderSource({
  record,
  sourceList,
  // refetch,
}: {
  record: any;
  sourceList: any[];
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
    if (record.source) {
      form.setFieldsValue({ source: record.source });
    }
  }, [record, form]);

  const onEdit = async (values: any) => {
    try {
      const body = {
        id: record.id, // Giả sử bạn cần ID của đơn hàng để cập nhật
        source: values.source,
      };
      let result;
      result = await editOrder(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.editSourceError')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        notification.success({
          message: `${t('noficationAddAndUpdate.editSourceSuccess')}`,
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
        {record?.source_str || "null"}
      </Button>
      <Modal
        title={t('crm.editSource')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <Form onFinish={onEdit} form={form} className="mt-4">
          <Form.Item name="source" label={t('crm.sourcesLead')} rules={[{ required: true }]} className="w-full">
            <Select
              showSearch
              placeholder={t('noficationAddAndUpdate.sourceList')}
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
              }
            >
              {sourceList?.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={isLoadingEdit}>
            {t('general.confirm')}
          </Button>
        </Form>
      </Modal>
    </>
  );
}

export default UpdateOrderSource;
