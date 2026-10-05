"use client";

import {
  useCreateCostMutation,
  useCreateMultiCostMutation,
  useEditCostMutation,
  useGetCostQuery,
} from "@/api/Finance/apiCost";
import { useGetSetupFinanceAppQuery } from "@/api/SetUp/apiSetup";
import ModalDialog from "@/components/ModalDialog/ModalDialog";
import { COST_EXCEL_FILE } from "@/constants/excelFile/costExcelFIle";
import { dowloadFileExcel } from "@/constants/excelFile/dowloadFileExcel";
import { useWindowSize } from "@/utils/responsiveSm";
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  notification,
} from "antd";
import type { DatePickerProps } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { SiMicrosoftexcel } from "react-icons/si";
import * as XLSX from "xlsx";

const { Option } = Select;

interface bodyDataCost {
  title: string;
  amount: number;
  payment_date: string;
  beneficiary: string;
  ref_document: string;
  detail: string;
  purchase_order: number;
  is_plan: boolean;
}

const AddAndUpdateCost = ({
  edit,
  costId,
  subcategory,
  title,
  ref_document,
  amount,
  paymentDate,
  accountChoice,
  beneficiary,
  detail,
}: {
  edit?: boolean;
  costId?: number;
  subcategory?: number;
  title?: string;
  ref_document?: string;
  amount?: number;
  paymentDate?: string;
  accountChoice?: number;
  beneficiary?: string;
  detail?: string;
}) => {
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectCheckbox, setSelectCheckbox] = useState<string>("Nhập thông tin");
  const [modalDialog, setModalDialog] = useState({
    open: false,
    success: [],
    error: [],
  });
  const [fileData, setFileData] = useState<{ name: string }>();
  const [costExcel, setCostExcel] = useState<bodyDataCost[]>([]);

  const { data: setupList } = useGetSetupFinanceAppQuery();

  const { data: costManagementData } = useGetCostQuery({ costId: costId } || undefined, {
    skip: costId && open ? false : true,
  });

  const [createCost, { isLoading: isLoadingAdd }] = useCreateCostMutation();
  const [createMultiCost, { isLoading: isLoadingAddMulti }] = useCreateMultiCostMutation();
  const [editCost, { isLoading: isLoadingEdit }] = useEditCostMutation();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      title: values.title,
      ref_document: values.ref_document,
      amount: values.amount,
      subcategory: values.subcategory,
      payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
      beneficiary: values.beneficiary,
      account_choice: values.account_choice,
      detail: values.detail,
    };

    try {
      const result = await createCost(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t("noficationAddAndUpdate.createFailureCosts")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setOpen(false);
        notification.success({
          message: `${t("noficationAddAndUpdate.createSuccessfulCosts")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setOpen(true);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      id: costId,
      title: costManagementData?.title,
      ref_document: costManagementData?.ref_document,
      amount: costManagementData?.amount,
      subcategory: costManagementData?.subcategory,
      payment_date: dayjs(costManagementData?.payment_date),
      beneficiary: costManagementData?.beneficiary,
      account_choice: costManagementData?.account_choice,
      detail: costManagementData?.detail,
    });
  }, [open, costManagementData]);

  const onEdit = async (values: any) => {
    const body = {
      id: costId,
      title: values.title,
      ref_document: values.ref_document,
      amount: values.amount,
      subcategory: values.subcategory,
      payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
      beneficiary: values.beneficiary,
      account_choice: values.account_choice,
      detail: values.detail,
    };

    try {
      const result = await editCost(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t("noficationAddAndUpdate.fixCostFailure")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setOpen(false);
        notification.success({
          message: `${t("noficationAddAndUpdate.correctCostsSuccessfully")}`,
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

  const handleChangeFile = () => {
    const inputFile = document.getElementById("file");
    inputFile?.click();
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    setFileData(file);
    if (file) {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parseData = XLSX.utils.sheet_to_json(sheet);
        parseData?.forEach((item: any) => {
          let payment_date = '';
          if (typeof item?.payment_date === "number") {
            const excelDate = new Date((item?.payment_date - 25569) * 86400 * 1000);
            payment_date = dayjs(excelDate).format("YYYY-MM-DD");
          } else if (typeof item?.payment_date === "string") {
            payment_date = dayjs(item?.payment_date).isValid() ? dayjs(item?.payment_date).format("YYYY-MM-DD") : 'Invalid Date';
          }
          const newCost = {
            title: item?.title,
            amount: item?.amount,
            payment_date: payment_date,
            beneficiary: item?.beneficiary,
            ref_document: item?.ref_document,
            detail: item?.detail,
            purchase_order: item?.purchase_order,
            is_plan: false,
          };
          setCostExcel((costExcel) => [...costExcel, newCost]);
        });
      };
    }
  };

  const createDataByExcel = async (data: bodyDataCost[], checkbox: string) => {
    if (data && checkbox === "Tải lên file excel") {
      try {
        const result = await createMultiCost(data);
        if (result && "error" in result) {
          notification.error({
            message: `${t("noficationAddAndUpdate.createFailureCosts")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          setOpen(false);
          setModalDialog({
            ...modalDialog,
            open: true,
            success: result?.data?.costs_created,
            error: result?.data?.errors,
          });
        }
      } catch (error) {
        console.log(error);
        setOpen(true);
      }
    }
  };


  return (
    <>
      <Button type={width < 640 && edit ? "text" : "primary"}
        onClick={showDrawer}
        className={` ${edit && width > 640 ? "bg-teal-600 hover:!bg-teal-500" : ""}`}
        block={edit ? true : false}
        size={edit ? "small" : "middle"}>
        {edit ? `${t("general.edit")}` : `${t("noficationAddAndUpdate.additionalCosts")}`}

      </Button>

      <Drawer
        title={edit ? `${t("noficationAddAndUpdate.editCosts")}` : `${t("noficationAddAndUpdate.addNewCosts")}`}
        width={sizeDrawer ? 768 : 350}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button
              onClick={() => {
                if (selectCheckbox === "Nhập thông tin") {
                  form.submit();
                } else {
                  createDataByExcel(costExcel, selectCheckbox);
                }
              }}
              type="primary"
              loading={edit ? isLoadingEdit : isLoadingAdd || isLoadingAddMulti}
            >
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
        <Radio.Group
          value={selectCheckbox}
          onChange={(e) => setSelectCheckbox(e.target.value)}
          style={{ width: "100%" }}
        >
          <Radio className="mb-2" value={"Nhập thông tin"}>
            Nhập thông tin
          </Radio>
          <Form
            disabled={selectCheckbox === "Tải lên file excel"}
            form={form}
            layout="vertical"
            onFinish={edit ? onEdit : onFinish}
          >
            <Form.Item label={t("table.title")} name="title" rules={[{ required: true }]} initialValue={title}>
              <Input placeholder="Điền Tiêu Đề" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item
                  label={t("finance.paymentAmount")}
                  name="amount"
                  rules={[{ required: true }]}
                  initialValue={amount}
                >
                  <InputNumber min={0} defaultValue={0} className="w-full" />
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item
                  name="subcategory"
                  label={t("finance.paymentCategories")}
                  rules={[{ required: true }]}
                  initialValue={subcategory}
                >
                  <Select
                    placeholder={t("finance.categoryList")}
                    allowClear
                    showSearch
                    filterOption={(input, option: any) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {setupList?.subcost_category_list?.map((item: any) => (
                      <Option key={item.id} value={item.id}>
                        {item.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item
                  label={t("finance.paymentDate")}
                  name="payment_date"
                  rules={[{ required: true }]}
                  initialValue={dayjs(paymentDate)}
                >
                  <DatePicker onChange={onChange} className="w-full" />
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item name="account_choice" label={t("finance.accountChoice")} initialValue={accountChoice}>
                  <Select
                    placeholder={t("finance.accountCategories")}
                    allowClear
                    showSearch
                    filterOption={(input, option: any) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {setupList?.bank_account_list?.map((item: any) => (
                      <Option key={item.id} value={item.id}>
                        {item.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label={t("finance.beneficiary")} name="beneficiary" required initialValue={beneficiary}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label={t("table.ref_document")} name="ref_document" initialValue={ref_document}>
                  <Input placeholder="Mã tham chiếu" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="detail" label={t("finance.detail")} initialValue={detail}>
              <Input.TextArea />
            </Form.Item>
          </Form>
          {!edit && (
            <>
              <Radio className="mb-2 mt-2" value={"Tải lên file excel"}>
                Tải lên file excel
                <span
                  className="cursor-pointer underline italic text-primary"
                  onClick={() => dowloadFileExcel(COST_EXCEL_FILE, "Mẫu-thông-tin-chi-phí-tài-chính.xlsx")}
                >
                  {" "}
                  (Click vào đây để tải file mẫu và hướng dẫn)
                </span>
              </Radio>
              <div className="flex justify-center items-center w-100%">
                <Input
                  id="file"
                  hidden
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  onClick={(e: any) => (e.target.value = "")}
                  disabled={selectCheckbox === "Nhập thông tin"}
                />
                <SiMicrosoftexcel onClick={handleChangeFile} fill="green" size={60} cursor={"pointer"} />
              </div>
            </>
          )}
        </Radio.Group>
        {!edit && (
          <div className="flex w-100% justify-center mb-2">
            {!fileData ? (
              <div>Không có file nào được tải lên</div>
            ) : (
              <div className="flex justify-center items-center">
                <div>{fileData.name}</div>
                <IoIosCloseCircleOutline
                  className="cursor-pointer ml-1"
                  onClick={() => setFileData(undefined)}
                  size={20}
                />
              </div>
            )}
          </div>
        )}
      </Drawer>
      <ModalDialog
        open={modalDialog.open}
        setOpen={(value) => setModalDialog({ ...modalDialog, open: value })}
        success={modalDialog.success}
        error={modalDialog.error}
        object_str="Các chi phí"
      />
    </>
  );
};

export default AddAndUpdateCost;
