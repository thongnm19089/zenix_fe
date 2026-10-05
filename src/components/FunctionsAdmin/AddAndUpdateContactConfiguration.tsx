import {
  useCreateLeadContactTypeMutation,
  useCreateLeadSourceMutation,
  useCreateLeadStageMutation,
  useEditLeadContactTypeMutation,
  useEditLeadSourceMutation,
  useEditLeadStageMutation,
  useGetLeadContactTypeQuery,
  useGetLeadSourceQuery,
  useGetLeadStageQuery,
  useCreateOrderStatusMutation,
  useEditOrderStatusMutation,
  useGetOrderStatusQuery,
} from "@/api/CRM/apiContactConfiguration";
import colorToString from "@/utils/colorToString";
import { Button, ColorPicker, Form, Input, Modal, Switch, notification } from "antd";
import type { ColorPickerProps } from "antd/es/color-picker";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";

const AddAndUpdateContactConfiguration = ({
  edit,
  title,
  titleLabel,
  sourceId,
  stageId,
  contactTypeId,
  orderStatusId,
  isTab,
}: {
  edit?: boolean;
  title: string;
  titleLabel: string;
  sourceId?: number;
  stageId?: number;
  contactTypeId?: number;
  orderStatusId?: number;
  isTab: string;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [createLeadSource, { isLoading: isLoadingAdd }] = useCreateLeadSourceMutation();
  const [editLeadSource, { isLoading: isLoadingEdit }] = useEditLeadSourceMutation();
  const [createLeadStage, { isLoading: isLoadingAddLeadStage }] = useCreateLeadStageMutation();
  const [editLeadStage, { isLoading: isLoadingEditLeadStage }] = useEditLeadStageMutation();
  const [createLeadContactType, { isLoading: isLoadingAddLeadContactType }] = useCreateLeadContactTypeMutation();
  const [editLeadContactType, { isLoading: isLoadingEditLeadContactType }] = useEditLeadContactTypeMutation();
  const [createOrderStatus, { isLoading: isLoadingAddOrderStatus }] = useCreateOrderStatusMutation();
  const [editOrderStatus, { isLoading: isLoadingEditOrderStatus }] = useEditOrderStatusMutation();
  const [value, setValue] = useState<ColorPickerProps["value"]>("#1677ff");

  const { data: source } = useGetLeadSourceQuery({ sourceId: sourceId } || undefined, {
    skip: sourceId && isModalOpen && isTab === "source" ? false : true,
  });

  const { data: stageData } = useGetLeadStageQuery({ stageId: stageId } || undefined, {
    skip: stageId && isModalOpen && isTab === "stage" ? false : true,
  });

  const { data: contactTypeData } = useGetLeadContactTypeQuery({ contactTypeId: contactTypeId } || undefined, {
    skip: contactTypeId && isModalOpen && isTab === "contactType" ? false : true,
  });

  const { data: orderStatusData } = useGetOrderStatusQuery({ orderStatusId: orderStatusId } || undefined, {
    skip: orderStatusId && isModalOpen && isTab === "orderStatus" ? false : true,
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
      status: values.title,
      stage: values.stage,
      color: colorToString(values?.color?.metaColor || "#1677ff"),
      is_active: values.is_active,
    };
    try {
      if (isTab === "stage") {
        const result = await createLeadStage(body);
        if (result && "error" in result) {
          notification.error({
            message: `${t('noficationAddAndUpdate.alreadyContactStatus')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `${t('noficationAddAndUpdate.addedContactStatusSuccess')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else if (isTab === "source") {
        const result = await createLeadSource(body);
        if (result && "error" in result) {
          notification.error({
            message: `${t('noficationAddAndUpdate.haveThisSource')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `${t('noficationAddAndUpdate.newSourceAddedSuccess')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else if (isTab === "contactType") {
        const result = await createLeadContactType(body);
        if (result && "error" in result) {
          notification.error({
            message: `${t('noficationAddAndUpdate.youTypeOfContact')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `${t('noficationAddAndUpdate.addedContactTypeSuccess')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else if (isTab === "orderStatus") {
        const result = await createOrderStatus(body);
        if (result && "error" in result) {
          notification.error({
            message: `${t("Thêm trạng thái thất bại")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `${t("Thêm trạng thái thành công")}`,
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
    console.log(orderStatusData)
    if (isTab === "stage") {
      form.setFieldsValue({ stage: stageData?.stage, color: stageData?.color, is_active: stageData?.is_active });
    } else if (isTab === "source") {
      form.setFieldsValue({ title: source?.title, color: source?.color });
    } else if (isTab === "contactType") {
      form.setFieldsValue({ title: contactTypeData?.title });
    } else if (isTab === "orderStatus") {
      form.setFieldsValue({ title: orderStatusData?.status, color: orderStatusData?.color });
    }
  }, [isModalOpen, source, stageData, contactTypeData, orderStatusData]);

  const onEdit = async (values: any) => {
    const body = {
      id: sourceId || stageId || contactTypeId || orderStatusId,
      title: values.title,
      stage: values.stage,
      color: values.color && colorToString(values.color.metaColor || values.color),
      status: values.title,
      is_active: values.is_active,
    };
    try {
      if (isTab === "stage") {
        await editLeadStage(body);
      } else if (isTab === "source") {
        await editLeadSource(body);
      } else if (isTab === "contactType") {
        editLeadContactType(body);
      } else {
        editOrderStatus(body);
      }
      setIsModalOpen(false);
      notification.success({
        message: `${t('admin.update')} ${isTab === "stage" ? `${t('noficationAddAndUpdate.solidarity')}` : isTab === `${t('admin.contactType')}` ? `${t('admin.contactType')}` : `${t('admin.sources')}`
          } ${t('general.success')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationAddAndUpdate.changeFailed')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}
        size={edit ? "small" : "middle"}
        className={edit ? "bg-teal-600 hover:!bg-teal-500" : ""}
      >
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
            labelCol={{ span: isTab === "contactType" ? 5 : 7 }}
            wrapperCol={{ span: isTab === "contactType" ? 19 : 17 }}
            onFinish={edit ? onEdit : onFinish}
            form={form}
          >
            {isTab !== "contactType" ? (
              <>
                <Form.Item name={isTab === "stage" ? "stage" : "title"} label={titleLabel} className="my-4">
                  <Input />
                </Form.Item>
                <Form.Item name="color" label={t('admin.color')} className="my-4">
                  <ColorPicker
                    value={value}
                    onChangeComplete={(color) => {
                      setValue(color);
                    }}
                  />
                </Form.Item>
                {isTab === "stage" && (
                  <Form.Item name="is_active" label={t('admin.isActive')} className="my-4" valuePropName="checked" initialValue={true}>
                    <Switch defaultChecked />
                  </Form.Item>
                )}
              </>
            ) : (
              <Form.Item name="title" label={titleLabel} className="my-4">
                <Input />
              </Form.Item>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="primary"
                htmlType="submit"
                className=" mb-2"
                loading={
                  edit
                    ? isLoadingEdit || isLoadingEditLeadStage || isLoadingEditLeadContactType || isLoadingEditOrderStatus
                    : isLoadingAdd || isLoadingAddLeadStage || isLoadingAddLeadContactType || isLoadingAddOrderStatus
                }
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

export default AddAndUpdateContactConfiguration;
