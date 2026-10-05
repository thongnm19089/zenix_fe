import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, notification } from 'antd';
import { useCreateModuleMutation, useUpdateModuleMutation } from '@/api/Learning/apiLearning';
import { useTranslations } from 'next-intl';

const AddAndUpdateModule = ({
  edit,
  module,
  courseId,
  refetch
}: {
  edit: boolean;
  module: any;
  courseId: number;
  refetch: () => void;
}) => {
  const t: any = useTranslations();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [createModule, { isLoading: isLoadingAdd }] = useCreateModuleMutation();
  const [updateModule, { isLoading: isLoadingEdit }] = useUpdateModuleMutation();

  useEffect(() => {
    if (visible && edit && module) {
      form.setFieldsValue({
        ...module,
      });
    }
  }, [visible, edit, module, form]);

  const showModal = () => {
    if (edit && module) {
      form.setFieldsValue({
        ...module,
      });
    }
    setVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, course: courseId };

      if (edit) {
        await updateModule({ id: module.id, data: payload });
      } else {
        await createModule(payload);
      }
      notification.success({
        message: edit ? t("noficationAddAndUpdate.editModuleSuccess") : t("noficationAddAndUpdate.addModuleSuccess"),
        placement: "bottomRight",
        className: "h-16",
      });
      setVisible(false);
      form.resetFields();
      refetch(); // Refetch course data after save
    } catch (error) {
      notification.error({
        message: edit ? t("noficationAddAndUpdate.editModuleError") : t("noficationAddAndUpdate.addModuleError"),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {edit ? t("noficationAddAndUpdate.editModule") : t("noficationAddAndUpdate.addModule")}
      </Button>
      <Modal
        title={edit ? t("noficationAddAndUpdate.editModule") : t("noficationAddAndUpdate.addModule")}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={edit ? isLoadingEdit : isLoadingAdd}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label={t("table.title")} rules={[{ required: true, message: t("form.required") }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t("verticalValues.desc")} rules={[{ required: true, message: t("form.required") }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddAndUpdateModule;
