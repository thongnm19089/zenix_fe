"use client";

import {
  useCreateCustomerMutation,
  useCreateMultiCustomerMutation,
  useEditCustomerMutation,
  useGetCustomerQuery,
} from "@/api/CRM/apiLead";
import AddressForm from "@/components/FunctionsManagement/CRM/Order/AddressForm";
import ModalDialog from "@/components/ModalDialog/ModalDialog";
import { CUSTOMER_EXCEL_FILE } from "@/constants/excelFile/customerExcelFile";
import { dowloadFileExcel } from "@/constants/excelFile/dowloadFileExcel";
import { useWindowSize } from "@/utils/responsiveSm";
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Dropdown,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  notification,
} from "antd";
import { MenuProps } from "antd/lib";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { MdOutlineFileUpload } from "react-icons/md";
import { SiMicrosoftexcel } from "react-icons/si";
import * as XLSX from "xlsx";

function joinAddressFields(address: string, ward: string, district: string, city: string) {
  return [address, ward, district, city].filter(Boolean).join(", ");
}

const { Option } = Select;

interface bodyDataCustomer {
  name: string;
  email: string;
  mobile: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  zip_code: string;
  date_of_birth: string;
  gender: string;
  loyalty_points: number;
  customer_type: string;
  note: string;
}

const AddAndUpdateCustomer = ({
  edit,
  customerId,
  customerType,
}: {
  edit?: boolean;
  customerId?: number | null | undefined;
  customerType: string;
}) => {
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const [createCustomer, { isLoading: isLoadingAdd }] = useCreateCustomerMutation();

  const [editCustomer, { isLoading: isLoadingEdit }] = useEditCustomerMutation();

  const { data: customerData } = useGetCustomerQuery({ customerId: customerId } || undefined, {
    skip: customerId && open ? false : true,
  });

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      customer_type: customerType,
      MST: values.MST,
      name: values.name,
      short_name: values.short_name,
      note: values.note,
      contact_person: values.contact_person,
      mobile: values.mobile,
      email: values.email,
      address: values.address,
      ward: values.ward,
      district: values.district,
      city: values.city,
      date_of_birth: dayjs(values.date_of_birth).format("YYYY-MM-DD"),
      gender: values.gender,
      billing_address: values.billing_address
        ? values.billing_address
        : joinAddressFields(values.address, values.ward, values.district, values.city),
    };
    try {
      const result = await createCustomer(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t("noficationAddAndUpdate.createCustomerError")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setOpen(false);
        notification.success({
          message: `${t("noficationAddAndUpdate.createCustomerSuccess")}`,
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
      customer_type: customerData?.customer_type,
      MST: customerData?.MST,
      name: customerData?.name,
      short_name: customerData?.short_name,
      note: customerData?.note,
      contact_person: customerData?.contact_person,
      mobile: customerData?.mobile,
      email: customerData?.email,
      address: customerData?.address,
      billing_address: customerData?.billing_address
        ? customerData?.billing_address
        : joinAddressFields(customerData?.address, customerData?.ward, customerData?.district, customerData?.city),
      ward: customerData?.ward,
      district: customerData?.district,
      city: customerData?.city,
      date_of_birth: dayjs(customerData?.date_of_birth),
      gender: customerData?.gender,
    });
  }, [open, customerData]);

  const onEdit = async (values: any) => {
    try {
      const body = {
        id: customerId,
        customer_type: customerType,
        MST: values.MST,
        name: values.name,
        short_name: values.short_name,
        note: values.note,
        contact_person: values.contact_person,
        mobile: values.mobile,
        email: values.email,
        address: values.address,
        billing_address: values.billing_address,
        ward: values.ward,
        district: values.district,
        city: values.city,
        date_of_birth: dayjs(values.date_of_birth).format("YYYY-MM-DD"),
        gender: values.gender,
      };
      const result = await editCustomer(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t("noficationAddAndUpdate.editLeadMarketerError")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setOpen(false);
        notification.success({
          message: `${t("noficationAddAndUpdate.editCustomerSuccess")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setOpen(true);
    }
  };

  const items: MenuProps["items"] = [
    {
      label: <UploadByExcel />,
      key: "1",
    },
  ];

  return (
    <div className="flex gap-2 mb-2">
      {edit ? (
        <Button
          type={width < 640 && edit ? "text" : "primary"}
          className={` ${edit && width < 640 ? "" : "bg-teal-600 hover:!bg-teal-500"}`}
          onClick={showDrawer}
          size="small"
        >
          {t("general.edit")}
        </Button>
      ) : (
        <Dropdown.Button type="primary" menu={{ items }} onClick={showDrawer}>
            {t("noficationAddAndUpdate.addCustomers")}
        </Dropdown.Button>
      )}

      <Drawer
        title="Thêm khách hàng"
        width={sizeDrawer ? 768 : 350}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button
              onClick={() => {
                form.submit();
              }}
              type="primary"
              loading={edit ? isLoadingEdit : isLoadingAdd}
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
        <Form form={form} layout="vertical" onFinish={edit ? onEdit : onFinish}>
          <Form.Item
            label={`${customerType === "individual" ? t("user.fullName") : "Tên doanh nghiệp"}`}
            rules={[{ required: true }]}
            name="name"
          >
            <Input />
          </Form.Item>

          {customerType === "individual" && (
            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label={t("table.birthday")} name="date_of_birth">
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item name="gender" label={t("user.gender")}>
                  <Select placeholder={t("table.chooseGender")}>
                    <Option key="1" value="MA">
                      {t("user.genderValues.MA")}
                    </Option>
                    <Option key="2" value="FE">
                      {t("user.genderValues.FE")}
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item
                label={customerType === "individual" ? t("user.phone") : "Số điện thoại doanh nghiệp"}
                name="mobile"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={customerType === "individual" ? t("user.email") : "Email doanh nghiệp"} name="email">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {customerType === "business" && (
            <>
              <Row gutter={16}>
                <Col span={sizeDrawer ? 12 : 24}>
                  <Form.Item label="Tên viết tắt" name="short_name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={sizeDrawer ? 12 : 24}>
                  <Form.Item label="MST" name="MST">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Người liên hệ" name="contact_person">
                <Input.TextArea />
              </Form.Item>
            </>
          )}
              <Form.Item label={customerType === "individual" ? "Ghi chú" : "Ghi chú"} name="note">
                <Input.TextArea />
              </Form.Item>

          <AddressForm sizeDrawer={sizeDrawer} customerType={customerType} />
        </Form>
      </Drawer>
    </div>
  );
};

export default AddAndUpdateCustomer;

const UploadByExcel = () => {
  const t: any = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDialog, setModalDialog] = useState({
    open: false,
    success: [],
    error: [],
  });
  const [customerExcel, setCustomerExcel] = useState<bodyDataCustomer[]>([]);
  const [fileData, setFileData] = useState<{ name: string }>();
  const [createMultiCustomer, { isLoading: isLoadingAddMulti }] = useCreateMultiCustomerMutation();
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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
          const newCustomer = {
            name: item?.name,
            email: item?.email,
            mobile: item?.mobile,
            address: item?.address,
            ward: item?.ward,
            district: item?.district,
            city: item?.city,
            country: item?.country,
            zip_code: item?.zip_code,
            date_of_birth: item?.date_of_birth,
            gender: item?.gender,
            loyalty_points: item?.loyalty_points,
            customer_type: item?.customer_type,
            note: item?.note,
          };
          setCustomerExcel((customerExcel) => [...customerExcel, newCustomer]);
        });
      };
    }
  };

  const createDataByExcel = async (data: bodyDataCustomer[]) => {
    if (data) {
      try {
        const result = await createMultiCustomer(data);
        if (result && "error" in result) {
          notification.error({
            message: `${t("noficationAddAndUpdate.createCustomerError")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          setIsModalOpen(true);
          setModalDialog({
            ...modalDialog,
            open: true,
            success: result?.data?.customers_created,
            error: result?.data?.errors,
          });
        }
      } catch (error) {
        console.log(error);
        setIsModalOpen(true);
      }
    }
  };
  return (
    <div>
      <div onClick={showModal} className="flex items-center gap-2">
        <MdOutlineFileUpload /> {t("noficationAddAndUpdate.uploadUsingExcel")}
      </div>
      <Modal title="" open={isModalOpen} onCancel={handleCancel} footer={null} width={350}>
        <div className="flex justify-center items-center w-100% mt-5">
          <Input
            id="file"
            hidden
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            onClick={(e: any) => (e.target.value = "")}
          />
          <SiMicrosoftexcel onClick={handleChangeFile} fill="green" size={60} cursor={"pointer"} />
        </div>

        <div className="flex w-100% justify-center mb-2">
          {!fileData ? (
            <div>Click vào icon để tải file lên</div>
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
        <div
          className="cursor-pointer underline italic text-primary text-center"
          onClick={() => dowloadFileExcel(CUSTOMER_EXCEL_FILE, "Mẫu-thông-tin-khách-hàng.xlsx")}
        >
          (Click vào đây để tải file mẫu)
        </div>
        <ModalDialog
          open={modalDialog.open}
          setOpen={(value) => setModalDialog({ ...modalDialog, open: value })}
          success={modalDialog.success}
          error={modalDialog.error}
          object_str="Các khách hàng"
        />
        <Button
          block
          className="mt-4"
          onClick={() => createDataByExcel(customerExcel)}
          disabled={!fileData ? true : false}
        >
          Tải lên
        </Button>
      </Modal>
    </div>
  );
};
