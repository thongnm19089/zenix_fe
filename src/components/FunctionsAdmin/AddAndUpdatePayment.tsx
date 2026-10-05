import {
  useCreateBankAccountMutation,
  useCreatePaymentMethodMutation,
  useCreatePaymentStatusMutation,
  useEditBankAccountMutation,
  useEditPaymentMethodMutation,
  useEditPaymentStatusMutation,
  useGetBankAccountQuery,
  useGetPaymentMethodQuery,
  useGetPaymentStatusQuery,
} from "@/api/Finance/apiPayment";

import {
  useCreatePaymentTermMutation,
  useGetPaymentTermIdQuery,
  useUpdatePaymentTermMutation,
} from "@/api/Procurement/apiProcurement";

import colorToString from "@/utils/colorToString";
import { Button, ColorPicker, Form, Input, Modal, notification } from "antd";
import type { ColorPickerProps } from "antd/es/color-picker";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";

const AddAndUpdatePayment = ({
  edit,
  title,
  titleLabel,
  paymentMethodId,
  paymentStatusId,
  bankAccountId,
  paymentTermId,
  isTab,
}: {
  edit?: boolean;
  title: string;
  titleLabel: string;
  userId?: number | null | undefined;
  paymentMethodId?: number;
  paymentStatusId?: number;
  bankAccountId?: number;
  paymentTermId?: number;
  isTab: string;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [createPaymentMethod, { isLoading: isLoadingAdd }] = useCreatePaymentMethodMutation();
  const [editLeadPaymentMethod, { isLoading: isLoadingEdit }] = useEditPaymentMethodMutation();
  const [createPaymentStatus, { isLoading: isLoadingAddPaymentStatus }] = useCreatePaymentStatusMutation();
  const [editPaymentStatus, { isLoading: isLoadingEditPaymentStatus }] = useEditPaymentStatusMutation();
  const [createBankAccount, { isLoading: isLoadingAddBankAccount }] = useCreateBankAccountMutation();
  const [editBankAccount, { isLoading: isLoadingEditBankAccount }] = useEditBankAccountMutation();
  const [createPaymentTerm, { isLoading: isLoadingAddPaymentTerm }] = useCreatePaymentTermMutation();
  const [editPaymentTerm, { isLoading: isLoadingEditPaymentTerm }] = useUpdatePaymentTermMutation();
  const [value, setValue] = useState<ColorPickerProps["value"]>("#1677ff");

  const { data: paymentMethodData } = useGetPaymentMethodQuery({ paymentMethodId: paymentMethodId } || undefined, {
    skip: paymentMethodId && isModalOpen && isTab === "PM" ? false : true,
  });

  const { data: paymentStatusData } = useGetPaymentStatusQuery({ paymentStatusId: paymentStatusId } || undefined, {
    skip: paymentStatusId && isModalOpen && isTab === "PS" ? false : true,
  });

  const { data: bankAccountData } = useGetBankAccountQuery({ bankAccountId: bankAccountId } || undefined, {
    skip: bankAccountId && isModalOpen && isTab === "BA" ? false : true,
  });

  const { data: paymentTermData } = useGetPaymentTermIdQuery({ paymentTermId: paymentTermId } || undefined, {
    skip: paymentTermId && isModalOpen && isTab === "PT" ? false : true,
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
      code: values.code,
      color: colorToString(values?.color?.metaColor || "#1677ff"),
    };
    try {
      if (isTab === "PS") {
        const result = await createPaymentStatus(body);
        handleNotification(result, "paymentStatus", "newPaymentStatus");
      } else if (isTab === "PM") {
        const result = await createPaymentMethod(body);
        handleNotification(result, "paymentMethod", "addedNewPayment");
      } else if (isTab === "PT") {
        const result = await createPaymentTerm(body);
        handleNotification(result, "paymentTerm", "addedNewPaymentTerm");
      } else {
        const result = await createBankAccount(body);
        handleNotification(result, "bankAccount", "addedBankAccount");
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  const handleNotification = (result: any, type: string, successMessage: string) => {
    if (result && "error" in result) {
      notification.error({
        message: `${t(`noficationAddAndUpdate.${type}`)}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } else {
      form.resetFields();
      setIsModalOpen(false);
      notification.success({
        message: `${t(`noficationAddAndUpdate.${successMessage}`)}`,
        placement: "bottomRight",
        className: "h-[86px]",
      });
    }
  };

  useEffect(() => {
    if (isTab === "PS") {
      form.setFieldsValue({ title: paymentStatusData?.title, color: paymentStatusData?.color });
    } else if (isTab === "PM") {
      form.setFieldsValue({ title: paymentMethodData?.title });
    } else if (isTab === "PT") {
      form.setFieldsValue({ title: paymentTermData?.title, color: paymentTermData?.color });
    } else {
      form.setFieldsValue({ title: bankAccountData?.title, code: bankAccountData?.code });
    }
  }, [isModalOpen, paymentMethodData, paymentStatusData, paymentTermData, bankAccountData]);

  const onEdit = async (values: any) => {
    const body = {
      id: paymentMethodId || paymentStatusId || paymentTermId || bankAccountId,
      title: values.title,
      stage: values.stage,
      color: values.color && colorToString(values.color.metaColor || values.color),
    };
    try {
      if (isTab === "PS") {
        await editPaymentStatus(body);
      } else if (isTab === "PM") {
        await editLeadPaymentMethod(body);
      } else if (isTab === "PT") {
        await editPaymentTerm(body);
      } else {
        editBankAccount(body);
      }
      setIsModalOpen(false);
      notification.success({
        message: `${t('noficationAddAndUpdate.update')} ${isTab === "PM" ? `${t('admin.paymentMethod')}` : isTab === "PS" ? `${t('admin.paymentStatus')}` : isTab === "PT" ? `${t('admin.paymentTerm')}` : `${t('admin.bankAccount')}`}${t('general.success')}`,
        placement: "bottomRight",
        className: "h-[86px]",
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
          <Form labelCol={{ span: 9 }} wrapperCol={{ span: 15 }} onFinish={edit ? onEdit : onFinish} form={form}>
            {isTab === "BA" && (
              <Form.Item name="code" label={t('admin.code')} className="my-4">
                <Input />
              </Form.Item>
            )}

            <Form.Item name="title" label={titleLabel} className="my-4">
              <Input />
            </Form.Item>

            {(isTab === "PS" || isTab === "PT") && (
              <Form.Item name="color" label={t('admin.color')} className="my-4">
                <ColorPicker
                  value={value}
                  onChangeComplete={(color) => {
                    setValue(color);
                  }}
                />
              </Form.Item>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="primary"
                htmlType="submit"
                className=" mb-2"
                loading={
                  edit
                    ? isLoadingEdit || isLoadingEditPaymentStatus || isLoadingEditPaymentTerm || isLoadingEditBankAccount
                    : isLoadingAdd || isLoadingAddPaymentStatus || isLoadingAddPaymentTerm || isLoadingAddBankAccount
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

export default AddAndUpdatePayment;
