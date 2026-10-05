import { useCreateDivisionMutation, useEditDivisionMutation, useGetDivisionQuery } from "@/api/SetUp/apiDivision";
import { Button, Form, Input, Modal, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

const AddAndUpdateDivision = ({ edit, divisionId }: { edit?: boolean; divisionId?: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createDivision, { isLoading: isLoadingAdd }] = useCreateDivisionMutation();
  const [editDivision, { isLoading: isLoadingEdit }] = useEditDivisionMutation();
  const [form] = Form.useForm();

  const t: any = useTranslations();

  const { data: division } = useGetDivisionQuery(
    { divisionId: divisionId },
    {
      skip: divisionId && isModalOpen ? false : true,
    }
  );

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    try {
      const result = await createDivision(values);

      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationDelete.createDivisionError')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        notification.success({
          message: `${t('noficationDelete.createDivisionSuccess')}`,
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
    form.setFieldsValue({ title: division?.title, code: division?.code });
  }, [isModalOpen, division]);

  const onEdit = async (values: any) => {
    const body = {
      id: divisionId,
      title: values.title,
      code: values.code,
    };
    try {
      await editDivision(body);
      setIsModalOpen(false);
      notification.success({
        message: `${t('noficationDelete.editDivisionSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.editDivisionError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal} size="small">
        {edit ? `${t('general.edit')}` : `${t('noficationDelete.createDivision')}`}
      </Button>
      <Modal title={t('noficationDelete.createDivision')} open={isModalOpen} footer={null} onCancel={handleCancel}>
        <div>
          <Form
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={{ remember: false }}
            onFinish={edit ? onEdit : onFinish}
            form={form}
          >
            <Form.Item
              name="title"
              label={t('admin.divisionName')}
              rules={[{ required: true, message: `${t('admin.divisionTitle')}`}]}
              className="my-4"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="code"
              label={t('admin.code')}
              rules={[{ required: true, message: `${t('admin.codeDivision')}` }]}
            >
              <Input type="text" />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button type="primary" htmlType="submit" className=" mb-2" loading={edit ? isLoadingEdit : isLoadingAdd}>
                {t("general.confirm")}
              </Button>

              <Button onClick={handleCancel}>{t("general.cancel")}</Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default AddAndUpdateDivision;
