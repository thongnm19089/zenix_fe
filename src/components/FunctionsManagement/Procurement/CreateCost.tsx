"use client";

import { useCreateCostMutation, useEditCostMutation } from "@/api/Finance/apiCost";
import { useGetSetupFinanceAppQuery } from "@/api/SetUp/apiSetup";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  notification,
} from "antd";
import type { DatePickerProps } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const { Option } = Select;

const CreateCost = ({
  edit,
  purchaseOrderId,
  beneficiary,
  refetch,
}: {
  edit?: boolean;
  purchaseOrderId: number;
  beneficiary?: string;
  refetch: any;
}) => {
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const t: any = useTranslations();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const [createCost, { isLoading: isLoadingAdd }] = useCreateCostMutation();

  const { data: setupFinanceApp } = useGetSetupFinanceAppQuery();
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      purchase_order: purchaseOrderId,
      beneficiary: beneficiary,
      title: `Payment for ` + beneficiary,
      amount: values.amount,
      payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
      account_choice: values.accountChoice,
      detail: values.detail,
    };

    console.log(body);

    try {
      const result = await createCost(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t("noficationAddAndUpdate.createPaymentSellerError")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setOpen(false);
        refetch();
        notification.success({
          message: `${t("noficationAddAndUpdate.createPaymentSellerSuccess")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setOpen(true);
    }
  };

  const onEdit = async (values: any) => {
    // const body = {
    //   id: costId,
    //   user: userId,
    //   amount: values.amount,
    //   payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
    // };
    // try {
    //   const result = await editCost(body);
    //   console.log(result);
    //   if (result && "error" in result) {
    //     notification.error({
    //       message: `Sửa chi phí thất bại`,
    //       placement: "bottomRight",
    //       className: "h-16",
    //     });
    //   } else {
    //     form.resetFields();
    //     setOpen(false);
    //     notification.success({
    //       message: `Sửa chi phí thành công`,
    //       placement: "bottomRight",
    //       className: "h-16",
    //     });
    //   }
    // } catch (error) {
    //   console.log(error);
    //   setOpen(true);
    // }
  };

  const onChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString);
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer}>
        {t("finance.debtPayment")}
      </Button>

      <Drawer
        title={t("finance.debtPayment")}
        width={sizeDrawer ? 768 : 350}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => form.submit()} type="primary" loading={isLoadingAdd}>
              {t("general.confirm")}
            </Button>
          </Space>
        }
        footer={
          <Button type="link" className="w-full h-full text-center" onClick={() => SetSizeDrawer(!sizeDrawer)}>
            {sizeDrawer ? t("general.collapse") : t("general.expand")}
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={edit ? onEdit : onFinish}>
          <Form.Item label={t("finance.paymentAmount")} name="amount" required>
            <InputNumber min={0} defaultValue={0} className="w-full" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={t("finance.paymentDate")} name="payment_date" required>
                <DatePicker onChange={onChange} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="accountChoice" label={t("admin.bankAccount")} required>
                <Select placeholder={t("finance.accountChoice")} allowClear>
                  {setupFinanceApp?.bank_account_list?.map((item: { id: number; title: string }) => (
                    <Option key={item.id} value={item.id}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="detail" label={t("finance.paymentInfo")}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default CreateCost;
