"use client";

import {
  useEditPaymentSellerMutation,
  useCreatePaymentSellerMutation,
} from "@/api/Finance/apiPayment";
import { useGetSetupFinanceAppQuery } from "@/api/SetUp/apiSetup";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Tabs,
  notification,
} from "antd";
import type { DatePickerProps, TabsProps } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { BsFileCheck } from "react-icons/bs";

const { Option } = Select;

const SellerDebtPayment = ({
  form,
  edit,
  isPlan,
  orderId,
  beneficiary,
  refetch,
  paymentSellerId,
  paymentAmount,
  paymentDate,
  accountChoice,
}: {
  form: any;
  edit?: boolean;
  isPlan?: boolean;
  orderId?: number;
  refetch: any;
  beneficiary?: string;
  paymentSellerId?: number;
  paymentAmount?: number;
  paymentDate?: number;
  accountChoice?: number;
}) => {
  const t: any = useTranslations();
  const { data: setupFinanceApp } = useGetSetupFinanceAppQuery();

  const [createPayment, { isLoading: isLoadingAdd }] =
    useCreatePaymentSellerMutation();
  const [editPayment, { isLoading: isLoadingEdit }] =
    useEditPaymentSellerMutation();
  const [checkPlan, setCheckPlan] = useState(false);

  const returnErr = (props: string) => { };

  const onFinish = async (values: any) => {
    const body = {
      order: orderId,
      beneficiary: beneficiary,
      title: `Payment for ` + beneficiary,
      payment_amount: values.payment_amount,
      payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
      account_choice: values.account_choice,
      detail: values.detail,
      is_plan: isPlan,
    };

    try {
      const result = await createPayment(body);
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
      console.error(error);
    }
  };

  useEffect(() => {
    if (edit) {
      form.setFieldsValue({
        payment_amount: paymentAmount,
        payment_date: dayjs(paymentDate),
        account_choice: accountChoice,
      });
    }
  }, [edit, paymentAmount, paymentDate, accountChoice]);

  const onEdit = async (values: any) => {
    const body = {
      id: paymentSellerId,
      payment_amount: values.payment_amount,
      payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
      account_choice: values.account_choice,
      detail: values.detail,
      is_plan: checkPlan,
    };

    try {
      const result = await editPayment(body);
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

  const onChange: DatePickerProps["onChange"] = (date, dateString) => { };
  return (
    <Form form={form} layout="vertical" onFinish={edit ? onEdit : onFinish}>
      {isPlan && edit && (
        <Radio.Group
          onChange={(e) => setCheckPlan(e.target.value)}
          value={checkPlan}
          className="mb-4"
        >
          <Radio value={false}>Thanh toán công nợ</Radio>
          <Radio value={true}>Sửa Dự kiến thanh toán</Radio>
        </Radio.Group>
      )}
      <Form.Item
        label={t("finance.paymentAmount")}
        name="payment_amount"
        rules={[{ required: true, message: "Xin nhập số tiền thanh toán!" }]}
      >
        <InputNumber
          // min={0}
          // defaultValue={0}
          className="w-full !px-2"
          // formatter={(value: any) => value ? `${value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : ''}
          // parser={(value: any) => value.replace(/(,*)/g, '')}
          // formatter={(value) => value ? new Intl.NumberFormat('vi-VN').format(value) : ''}
          // parser={(value: any) => value.replace(/(,*)/g, '')}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} // Định dạng với dấu phẩy
          parser={(value) => (value ? parseFloat(value.replace(/\$\s?|(,*)/g, "")) : 0)} // Chuyển chuỗi về số
          prefix="đ" // Thêm tiền tố đ
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={t("finance.paymentDate")}
            name="payment_date"
            rules={[{ required: true, message: "Xin chọn ngày thanh toán!" }]}
          >
            <DatePicker onChange={onChange} className="w-full" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="account_choice"
            label={t("admin.bankAccount")}
            rules={[
              { required: true, message: "Xin chọn tài khoản ngân hàng!" },
            ]}
          >
            <Select placeholder={t("finance.accountChoice")} allowClear>
              {setupFinanceApp?.bank_account_list?.map(
                (item: { id: number; title: string }) => (
                  <Option key={item.id} value={item.id}>
                    {item.title}
                  </Option>
                )
              )}
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

export const SellerDebtPaymentPlan = ({
  refetch,
  paymentSellerId,
  paymentAmount,
  paymentDate,
  accountChoice,
}: {
  refetch: any;
  paymentSellerId?: number;
  paymentAmount?: number;
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
      form.resetFields();
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

      <Modal
        title={`Thanh toán công nợ`}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={onSubmit}
      >
        <SellerDebtPayment
          form={form}
          edit={true}
          refetch={refetch}
          isPlan={true}
          paymentSellerId={paymentSellerId}
          paymentAmount={paymentAmount}
          paymentDate={paymentDate}
          accountChoice={accountChoice}
        />
      </Modal>
    </div>
  );
};

export const CreateSellerDebtPayment = ({
  orderId,
  beneficiary,
  refetch,
}: {
  orderId: number;
  beneficiary?: string;
  refetch: any;
}) => {
  const t: any = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [width, setWidth] = useState(window.innerWidth);
  const [showButton, setShowButton] = useState(true);
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
      // form.resetFields();
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
        <SellerDebtPayment
          form={form}
          orderId={orderId}
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
        <SellerDebtPayment
          form={form}
          orderId={orderId}
          beneficiary={beneficiary}
          refetch={refetch}
          isPlan={true}
        />
      ),
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (width < 576) {
      setShowButton(false);
    } else {
      setShowButton(true);
    }
  }, [width]);

  return (
    <>
      <div>
        {showButton ? (
          <Button
            className="max-sm:hidden"
            type="primary"
            onClick={showModal}
            size="small"
          >
            {t("finance.debtPayment")}
          </Button>
        ) : (
          <BsFileCheck
            onClick={showModal}
            style={{ cursor: "pointer", fontSize: "20px" }}
          />
        )}
      </div>

      <Modal
        title={`Thanh toán công nợ`}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={onSubmit}
      >
        <Tabs defaultActiveKey="1" items={items} />
      </Modal>
    </>
  );
};
