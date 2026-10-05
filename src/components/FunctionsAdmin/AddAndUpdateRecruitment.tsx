import {
  useCreateSourceMutation,
  useCreateStatusMutation,
  useEditSourceMutation,
  useEditStatusMutation,
  useGetSourceQuery,
  useGetStatusListQuery,
  useGetStatusQuery,
} from "@/api/SetUp/apiHRConfiguration";
import colorToString from "@/utils/colorToString";
import { Button, ColorPicker, Form, Input, Modal, notification } from "antd";
import type { ColorPickerProps } from "antd/es/color-picker";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";

const AddAndUpdateRecruitment = ({
  edit,
  title,
  titleLabel,
  sourceId,
  statusId,
  isStatus,
}: {
  edit?: boolean;
  title: string;
  titleLabel: string;
  sourceId?: number;
  statusId?: number;
  isStatus?: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState<ColorPickerProps["value"]>("#1677ff");
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [createSource, { isLoading: isLoadingAdd }] = useCreateSourceMutation();
  const [editSource, { isLoading: isLoadingEdit }] = useEditSourceMutation();
  const [createStatus, { isLoading: isLoadingAddStatus }] = useCreateStatusMutation();
  const [editStatus, { isLoading: isLoadingEditStatus }] = useEditStatusMutation();

  const { data: source } = useGetSourceQuery({ sourceId: sourceId } || undefined, {
    skip: sourceId && isModalOpen ? false : true,
  });

  const { data: statusData } = useGetStatusQuery({ statusId: statusId } || undefined, {
    skip: statusId && isModalOpen && isStatus ? false : true,
  });

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      title: values.title,
      status: values.status,
      color: colorToString(values?.color?.metaColor || "#1677ff"),
    };
    try {
      if (isStatus) {
        const result = await createStatus(body);
        if (result && "error" in result) {
          notification.error({
            message: `${t("noficationDelete.status")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `${t('noficationAddAndUpdate.createStatus')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else {
        const result = await createSource(body);
        if (result && "error" in result) {
          notification.error({
            message: `${t('noficationDelete.yesSource')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `${t('noficationAddAndUpdate.createSource')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    if (isStatus) {
      form.setFieldsValue({ status: statusData?.status, color: statusData?.color });
    } else {
      form.setFieldsValue({ title: source?.title, color: source?.color });
    }
  }, [isModalOpen, source, statusData]);

  const onEdit = async (values: any) => {
    const body = {
      id: sourceId || statusId,
      title: values.title,
      status: values.status,
      color: colorToString(values.color.metaColor || values.color),
    };
    try {
      if (isStatus) {
        await editStatus(body);
      } else {
        await editSource(body);
      }
      setIsModalOpen(false);
      notification.success({
        message: `${t('admin.update')} ${isStatus ? `${t('general.status')}` : `${t('admin.sources')}`} ${t('general.success')}`,
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
          <Form
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            initialValues={{ remember: false }}
            onFinish={edit ? onEdit : onFinish}
            form={form}
          >
            <Form.Item name={isStatus ? "status" : "title"} label={titleLabel} className="my-4">
              <Input />
            </Form.Item>
            <Form.Item name="color" label={t('admin.color')} className="my-4">
              <ColorPicker />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button
                type="primary"
                htmlType="submit"
                className=" mb-2"
                loading={edit ? isLoadingEdit || isLoadingEditStatus : isLoadingAdd || isLoadingAddStatus}
              >
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

export default AddAndUpdateRecruitment;
