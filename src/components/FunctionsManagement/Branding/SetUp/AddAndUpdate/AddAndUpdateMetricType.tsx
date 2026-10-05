"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, notification, ColorPicker, Select } from "antd";
import { useTranslations } from "next-intl";
import { useCreateMetricTypeMutation, useEditMetricTypeMutation, useGetMetricTypeQuery } from "@/api/Branding/apiBranding";

const METRIC_FREQUENCY_CHOICES = [
  { value: 'daily', label: 'Daily - Hằng ngày' },
  { value: 'weekly', label: 'Weekly - Hằng tuần' },
  { value: 'monthly', label: 'Monthly - Hằng tháng' },
  { value: 'end', label: 'End - Thời điểm kết thúc' },
  { value: '60days', label: '60 Days - 60 ngày' },
  { value: 'quarterly', label: 'Quarterly - Hằng quý' },
];

const AddAndUpdateMetricType = ({
  edit,
  metricTypeId,
  title,
}: {
  edit?: boolean;
  metricTypeId?: number;
  title?: string;
}) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [createMetricType] = useCreateMetricTypeMutation();
  const [editMetricType] = useEditMetricTypeMutation();
  const { data: metricTypeData } = useGetMetricTypeQuery(metricTypeId, { skip: !metricTypeId });
  const [value, setValue] = useState<string>("#1677ff");

  useEffect(() => {
    if (edit && metricTypeData) {
      form.setFieldsValue(metricTypeData);
      setValue(metricTypeData.color);
    }
  }, [edit, metricTypeData]);

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
        await editMetricType({ metricTypeId, ...values, color: value });
        notification.success({
          message: t('noficationAddAndUpdate.metricTypeEditSuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        await createMetricType({ ...values, color: value });
        notification.success({
          message: t('noficationAddAndUpdate.metricTypeCreateSuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
      }
      setIsModalVisible(false);
    } catch (error) {
      notification.error({
        message: edit ? t('noficationAddAndUpdate.metricTypeEditError') : t('noficationAddAndUpdate.metricTypeCreateError'),
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
          <Form.Item name="name" label={t('form.Metric Type')} rules={[{ required: true, message: t('form.required') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label={t('form.code')} rules={[{ required: true, message: t('form.required') }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="frequency_choices"
            label={t('form.frequency')}
            rules={[{ required: true, message: t('form.required') }]}
          >
            <Select>
              {METRIC_FREQUENCY_CHOICES.map(choice => (
                <Select.Option key={choice.value} value={choice.value}>
                  {choice.label}
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

export default AddAndUpdateMetricType;
