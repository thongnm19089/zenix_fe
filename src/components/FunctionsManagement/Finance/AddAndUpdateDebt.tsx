"use client";

import { useCreateCostMutation, useEditCostMutation } from "@/api/Finance/apiCost";
import { OptionListProps } from "@/types/optionListType";
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
import { AiOutlineUser } from "react-icons/ai";
import { BsKey } from "react-icons/bs";

const { Option } = Select;

const AddAndUpdateDebt = ({
  edit,
  userId,
  costId,
  subcostCategoryList,
  bankCccountList,
  subcategory,
  title,
  amount,
  paymentDate,
  accountChoice,
  beneficiary,
  detail,
}: {
  edit?: boolean;
  userId: number | null | undefined;
  costId?: number;
  subcostCategoryList: OptionListProps[];
  bankCccountList: OptionListProps[];
  subcategory?: string;
  title?: string;
  amount?: number;
  paymentDate?: string;
  accountChoice?: string;
  beneficiary?: string;
  detail?: string;
}) => {
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const t: any = useTranslations();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const [createCost, { isLoading: isLoadingAdd }] = useCreateCostMutation();
  const [editCost, { isLoading: isLoadingEdit }] = useEditCostMutation();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      user: userId,
      title: values.title,
      amount: values.amount,
      subcategory: values.subcategory,
      payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
      beneficiary: values.beneficiary,
      account_choice: values.account_choice,
      detail: values.detail,
    };

    try {
      const result = await createCost(body);
      console.log(result);
      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.createFailureCosts')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.createSuccessfulCosts')}`,
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
    const body = {
      id: costId,
      user: userId,
      title: values.title,
      amount: values.amount,
      subcategory: values.subcategory,
      payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
      beneficiary: values.beneficiary,
      account_choice: values.account_choice,
      detail: values.detail,
    };

    try {
      const result = await editCost(body);
      console.log(result);
      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.fixCostFailure')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.correctCostsSuccessfully')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setOpen(true);
    }
  };

  const onChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString);
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer} className="w-[120px]">
        {edit ? `${t('general.edit')}` : `${t('noficationAddAndUpdate.additionalCosts')}`}
      </Button>
      <Drawer
        title={edit ? `${t('noficationAddAndUpdate.editCosts')}` : `${t('noficationAddAndUpdate.addNewCosts')}`}
        width={sizeDrawer ? 768 : 350}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => form.submit()} type="primary" loading={edit ? isLoadingEdit : isLoadingAdd}>
            {t('general.confirm')}
            </Button>
          </Space>
        }
        footer={
          <Button type="link" className="w-full h-full text-center" onClick={() => SetSizeDrawer(!sizeDrawer)}>
            {sizeDrawer ? t('general.collapse') : t('general.expand')}
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={edit ? onEdit : onFinish}>
          <Form.Item label={t('table.title')} name="title" required initialValue={title}>
            <Input placeholder="input placeholder" />
          </Form.Item>

          <Form.Item label={t('finance.paymentAmount')} name="amount" required initialValue={amount}>
            <InputNumber min={0} defaultValue={0} className="w-full" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="subcategory" label="Sub Category" required initialValue={subcategory}>
                <Select placeholder="Sub Category List" allowClear>
                  {subcostCategoryList?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={t('finance.paymentDate')} name="payment_date" required initialValue={dayjs(paymentDate)}>
                <DatePicker onChange={onChange} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="account_choice" label="Account Choice" required initialValue={accountChoice}>
                <Select placeholder="Account Choice List" allowClear>
                  {bankCccountList?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              {" "}
              <Form.Item label="Người hưởng thụ" name="beneficiary" required initialValue={beneficiary}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="detail" label="Detail" initialValue={detail}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default AddAndUpdateDebt;
