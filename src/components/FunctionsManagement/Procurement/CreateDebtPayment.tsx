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
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Tabs,
  notification,
} from "antd";
import type { DatePickerProps, TabsProps } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

const { Option } = Select;

const DebtPayment = ({
  form,
  edit,
  isPlan,
  purchaseOrderId,
  beneficiary,
  refetch,
  costId,
  amount,
  paymentDate,
  accountChoice,
}: {
  form: any;
  edit?: boolean;
  isPlan?: boolean;
  purchaseOrderId?: number;
  beneficiary?: string;
  refetch: any;
  costId?: number;
  amount?: number;
  paymentDate?: number;
  accountChoice?: number;
}) => {
  const t: any = useTranslations();
  const { data: setupFinanceApp } = useGetSetupFinanceAppQuery();

  const [createCost, { isLoading: isLoadingAdd }] = useCreateCostMutation();
  const [editCost, { isLoading: isLoadingEdit }] = useEditCostMutation();
  const [checkPlan, setCheckPlan] = useState(false);

  const onFinish = async (values: any) => {
    const body = {
      purchase_order: purchaseOrderId,
      beneficiary: beneficiary,
      title: `Payment for ` + beneficiary,
      amount: values.amount,
      payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
      account_choice: values.account_choice,
      detail: values.detail,
      is_plan: isPlan,
    };

    try {
      const result = await createCost(body);
      if (result && "error" in result) {
        notification.error({
          message: `Thanh toán công nợ thất bại`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        refetch();
        notification.success({
          message: `Thanh toán công nợ thành công`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (edit) {
      form.setFieldsValue({ amount: amount, payment_date: dayjs(paymentDate), account_choice: accountChoice });
    }
  }, [edit, amount, paymentDate, accountChoice]);

  const onEdit = async (values: any) => {
    const body = {
      id: costId,
      amount: values.amount,
      payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
      account_choice: values.account_choice,
      detail: values.detail,
      is_plan: checkPlan,
    };

    try {
      const result = await editCost(body);
      if (result && "error" in result) {
        notification.error({
          message: `Thanh toán công nợ thất bại`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();

        refetch();
        notification.success({
          message: `Thanh toán công nợ thành công`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onChange: DatePickerProps["onChange"] = (date, dateString) => {};
  return (
    <Form form={form} layout="vertical" onFinish={edit ? onEdit : onFinish}>
      {isPlan && edit && (
        <Radio.Group onChange={(e) => setCheckPlan(e.target.value)} value={checkPlan} className="mb-4">
          <Radio value={false}>Thanh toán công nợ</Radio>
          <Radio value={true}>Sửa Dự kiến thanh toán</Radio>
        </Radio.Group>
      )}
      <Form.Item label={t("finance.paymentAmount")} name="amount" required>
        <InputNumber min={0} defaultValue={0} className="w-full" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t("finance.paymentDate")} name="payment_date" required>
            <DatePicker onChange={onChange} className="w-full" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="account_choice" label={t("admin.bankAccount")} required>
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
  );
};

export const DebtPaymentPlan = ({
  refetch,
  costId,
  amount,
  paymentDate,
  accountChoice,
}: {
  refetch: any;
  costId?: number;
  amount?: number;
  paymentDate?: number;
  accountChoice?: number;
}) => {
  const t: any = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const onSubmit = async () => {
    try {
      await form.validateFields();
      await form.submit();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi xử lý biểu mẫu: ", error);
      setIsModalOpen(true);
    }
  };
  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Thanh toán
      </Button>

      <Modal title={`Thanh toán công nợ`} open={isModalOpen} onCancel={handleCancel} onOk={onSubmit}>
        <DebtPayment
          form={form}
          edit={true}
          refetch={refetch}
          isPlan={true}
          costId={costId}
          amount={amount}
          paymentDate={paymentDate}
          accountChoice={accountChoice}
        />
      </Modal>
    </div>
  );
};

export const CreateDebtPayment = ({
  purchaseOrderId,
  beneficiary,
  refetch,
}: {
  purchaseOrderId: number;
  beneficiary?: string;
  refetch: any;
}) => {
  const t: any = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async () => {
    try {
      await form.validateFields();
      await form.submit();
      form.resetFields();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi xử lý biểu mẫu: ", error);
      setIsModalOpen(true);
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Thanh toán ngay`,
      children: (
        <DebtPayment
          form={form}
          purchaseOrderId={purchaseOrderId}
          beneficiary={beneficiary}
          refetch={refetch}
          isPlan={false}
        />
      ),
    },
    {
      key: "2",
      label: `Dự kiến thanh toán`,
      children: (
        <DebtPayment
          form={form}
          purchaseOrderId={purchaseOrderId}
          beneficiary={beneficiary}
          refetch={refetch}
          isPlan={true}
        />
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={showModal} size="small">
        {t("finance.debtPayment")}
      </Button>

      <Modal title={`Thanh toán công nợ`} open={isModalOpen} onCancel={handleCancel} onOk={onSubmit}>
        <Tabs defaultActiveKey="1" items={items} />
      </Modal>
    </>
  );
};
