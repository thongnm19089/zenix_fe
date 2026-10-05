"use client";

import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useGetSupplierQuery,
  useCreateMultiSupplierMutation,
} from "@/api/Procurement/apiProcurement";
import { useGetSetupQuery } from "@/api/SetUp/apiSetup";
import ModalDialog from "@/components/ModalDialog/ModalDialog";
import { dowloadFileExcel } from "@/constants/excelFile/dowloadFileExcel";
import { SUPPLIER_EXCEL_FILE } from "@/constants/excelFile/supplierExcelFIle";
import { Button, Col, Drawer, Form, Input, Radio, Row, Select, Space, notification } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { SiMicrosoftexcel } from "react-icons/si";
import * as XLSX from "xlsx";
import { useWindowSize } from "@/utils/responsiveSm";

const { Option } = Select;

interface bodyDataSupplier {
  name: string;
  short_name: string;
  MST: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

const AddAndUpdateSupplierManagement = ({
  edit,
  id,
  brandList,
  paymentTermList,
}: {
  edit?: boolean | undefined;
  id?: number | null | undefined;
  brandList?: any;
  paymentTermList: any;
}) => {
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: supplierData } = useGetSupplierQuery({ supplierId: id } || undefined, {
    skip: id && open ? false : true,
  });

  const [selectCheckbox, setSelectCheckbox] = useState<string>("Nhập thông tin");

  const [supplierExcel, setSupplierExcel] = useState<bodyDataSupplier[]>([]);

  const [modalDialog, setModalDialog] = useState({
    open: false,
    success: [],
    error: [],
  });
  const [fileData, setFileData] = useState<{ name: string }>();

  const [createSupplier, { isLoading: isLoadingAdd }] = useCreateSupplierMutation();
  const [createMultiSupplier, { isLoading: isLoadingAddMulti }] = useCreateMultiSupplierMutation();
  const [updateSupplier, { isLoading: isLoadingUpdate }] = useUpdateSupplierMutation();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (edit && id && supplierData) {
      form.setFieldsValue({
        ...supplierData,
        brands: supplierData?.brands.map((id: any) => id), // This will set an array of user ids
      });
    }
  }, [supplierData, form, edit, id]);

  const onFinish = async (values: any) => {
    try {
      if (edit && id) {
        const result = await updateSupplier({ id, ...values });
        if (result && "error" in result) {
          notification.error({
            message: `${t("noficationAddAndUpdate.editError")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          setOpen(false);
          form.resetFields();
          notification.success({
            message: `${t("noficationAddAndUpdate.editInvoiceSuccess")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else {
        const result = await createSupplier(values);
        if (result && "error" in result) {
          notification.error({
            message: `${t("noficationAddAndUpdate.editError")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          setOpen(false);
          form.resetFields();
          notification.success({
            message: `${t("noficationAddAndUpdate.createInvoice")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      }
      // Bạn có thể sử dụng result ở đây nếu cần
    } catch (error) {
      console.error(error); // Log lỗi ra console để dễ dàng gỡ lỗi
      notification.error({
        message: `${t("noficationAddAndUpdate.editInvoiceError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
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
          const newSupplier = {
            name: item?.name,
            short_name: item?.short_name,
            MST: item?.MST,
            mobile: item?.mobile,
            email: item?.email,
            address: item?.address,
            city: item?.city,
            district: item?.district,
            ward: item?.ward,
          };
          setSupplierExcel((supplierExcel) => [...supplierExcel, newSupplier]);
        });
      };
    }
  };

  // Define an interface for your expected API response structure
  interface ApiSuccessResponse {
    data: {
      suppliers_created?: any; // Assuming this is a number
      errors?: any; // Replace 'any' with a more specific type if possible
    };
  }

  const createDataByExcel = async (data: bodyDataSupplier[], checkBox: string) => {
    if (data && checkBox === "Tải lên file excel") {
      try {
        const result = await createMultiSupplier(data);
        if (result && "error" in result) {
          notification.error({
            message: `Thêm nhà cung cấp thất bại`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          setModalDialog({
            ...modalDialog,
            open: true,
            success: result?.data?.suppliers_created,
            error: result?.data?.errors,
          });
        }
        setOpen(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <Button
        type={width < 640 && edit ? "text" : "primary"}
        className={` ${width > 640 && edit ? "bg-teal-600 hover:!bg-teal-500" : ""}`}
        onClick={showDrawer}
        block={edit ? true : false}
        size={edit ? "small" : "middle"}
      >
        {edit ? `${t("general.edit")}` : `${t("general.add")}`}
      </Button>
      <Drawer
        title={`${edit ? `${t("general.edit")}` : `${t("general.add")}`} ${t("nav.supplier")}`}
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
                  createDataByExcel(supplierExcel, selectCheckbox);
                }
              }}
              type="primary"
              loading={edit ? isLoadingUpdate : isLoadingAdd || isLoadingAddMulti}
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
          <Form disabled={selectCheckbox === "Tải lên file excel"} form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label={t("nav.supplierName")} name="name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label={t("nav.abbreviatedName")} name="short_name">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label={t("table.sellerTaxCode")} name="MST" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label={t("table.sellerAddress")} name="address">
                  <TextArea />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label={t("auth.email")} name="email">
                  <Input type="email" />
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label={t("auth.numberPhone")} name="mobile" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={t("nav.termsOfPayment")} name="payment_term">
              <Select>
                {paymentTermList?.map((term: any) => (
                  <Option key={term.id} value={term.id}>
                    {term.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={t("admin.bankAccount")} name="banking_account">
              <TextArea />
            </Form.Item>
            <Form.Item label={t("admin.brand")} name="brands">
              <Select mode="multiple">
                {brandList?.map((brand: any) => (
                  <Option key={brand.id} value={brand.id}>
                    {brand.brand_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
          {!edit && (
            <>
              <Radio className="mb-2 mt-2" value={"Tải lên file excel"}>
                Tải lên file excel
                <span
                  className="cursor-pointer underline italic text-primary"
                  onClick={() => dowloadFileExcel(SUPPLIER_EXCEL_FILE, "Mẫu-thông-tin-nhà-cung-cấp.xlsx")}
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
        <ModalDialog
          open={modalDialog.open}
          setOpen={(value) => setModalDialog({ ...modalDialog, open: value })}
          success={modalDialog.success}
          error={modalDialog.error}
          object_str="Các nhà cung cấp"
        />
      </Drawer>
    </>
  );
};

export default AddAndUpdateSupplierManagement;
