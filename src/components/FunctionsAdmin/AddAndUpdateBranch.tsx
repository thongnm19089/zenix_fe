import { useCreateBranchMutation, useEditBranchMutation, useGetBranchQuery } from "@/api/SetUp/apiBranch";
import { Button, Form, Input, Modal, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

const AddAndUpdateBranch = ({ edit, branchId }: { edit?: boolean; branchId?: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createBranch, { isLoading: isLoadingAdd }] = useCreateBranchMutation();
  const [editBranch, { isLoading: isLoadingEdit }] = useEditBranchMutation();
  const [form] = Form.useForm();

  const t: any = useTranslations();

  const { data: branch } = useGetBranchQuery(
    { branchId: branchId },
    {
      skip: branchId && isModalOpen ? false : true,
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
      const result = await createBranch(values);

      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.createBranchError')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.createBranch')}`,
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
    form.setFieldsValue({ name: branch?.name, code: branch?.code });
  }, [isModalOpen, branch]);

  const onEdit = async (values: any) => {
    const body = {
      id: branchId,
      name: values.name,
      code: values.code,
    };
    try {
      await editBranch(body);
      setIsModalOpen(false);
      notification.success({
        message: `${t('noficationAddAndUpdate.editInfo')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationAddAndUpdate.editInfoError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal} size="small">
        {edit ? `${t('general.edit')}` : `${t('admin.createBranch')}`}
      </Button>
      <Modal title={t('admin.createBranch')} open={isModalOpen} footer={null} onCancel={handleCancel}>
        <div>
          <Form
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={{ remember: false }}
            onFinish={edit ? onEdit : onFinish}
            form={form}
          >
            <Form.Item
              name="name"
              label={t('admin.branchName')}
              rules={[{ required: true, message: `${t('admin.pleaseBranch')}` }]}
              className="my-4"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="code"
              label={t('admin.code')}
              rules={[{ required: true, message: `${t('admin.code')}` }]}
            >
              <Input type="text" />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button type="primary" htmlType="submit" className=" mb-2" loading={edit ? isLoadingAdd : isLoadingEdit }>
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

export default AddAndUpdateBranch;
