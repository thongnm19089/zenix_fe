import { useCreatePositionMutation, useEditPositionMutation, useGetPositionQuery } from "@/api/SetUp/apiHRConfiguration";
import { Button, Form, Input, Modal, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

const AddAndUpdateJobTitle = ({
  edit,
  title,
  titleLabel,
  codeLabel,
  positionId,
}: {
  edit?: boolean;
  title: string;
  titleLabel: string;
  codeLabel: string;
  positionId?: number | null | undefined;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createPosition, { isLoading: isLoadingAdd }] = useCreatePositionMutation();
  const [editPosition, { isLoading: isLoadingEdit }] = useEditPositionMutation();
  const [form] = Form.useForm();
  const t: any = useTranslations();

  const { data: position } = useGetPositionQuery({ positionId: positionId } || undefined, {
    skip: positionId && isModalOpen ? false : true,
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    form.setFieldsValue({ title: position?.title, code: position?.code });
  }, [isModalOpen, position]);

  const onFinish = async (values: any) => {
    try {
      const result = await createPosition(values);

      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.createPosition')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.createPositionSuccess')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  const onEdit = async (values: any) => {
    const body = {
      id: positionId,
      title: values.title,
      code: values.code,
    };
    try {
      await editPosition(body);
      setIsModalOpen(false);
      notification.success({
        message: `${t('noficationAddAndUpdate.editPosition')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationAddAndUpdate.edit')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal} size={edit ? "small" : "middle"} className={edit ? "bg-teal-600 hover:!bg-teal-500" : ""}>
        {edit ? t("general.edit") : t("general.createNew")}
      </Button>
      <Modal
        title={`${edit ? t("general.edit") : t("general.createNew")} ${title}`}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <div>
          <Form labelCol={{ span: 5 }} wrapperCol={{ span: 21 }} onFinish={edit ? onEdit : onFinish} form={form}>
            <Form.Item name="title" label={titleLabel} className="my-4">
              <Input />
            </Form.Item>

            <Form.Item name="code" label={codeLabel} className="my-4">
              <Input />
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

export default AddAndUpdateJobTitle;
