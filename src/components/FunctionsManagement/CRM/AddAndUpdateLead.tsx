"use client";

import {
  useCreateLeadFollowerMutation,
  useCreateLeadMarketerMutation,
  useCreateLeadSellerMutation,
  useCreateMultiLeadMarketerMutation,
  useCreateMultiLeadSellerMutation,
  useDeleteLeadSellerMutation,
  useEditLeadMarketerMutation,
  useEditLeadSellerMutation,
  useGetLeadMarketerQuery,
  useGetLeadSellerQuery,
} from "@/api/CRM/apiLead";
import ModalDialog from "@/components/ModalDialog/ModalDialog";
import { dowloadFileExcel } from "@/constants/excelFile/dowloadFileExcel";
import { MARKETER_EXCEL_FILE } from "@/constants/excelFile/marketerExcel";
import { SELLER_EXCEL_FILE } from "@/constants/excelFile/sellerExcelFile";
import { OptionListProps } from "@/types/optionListType";
import { useWindowSize } from "@/utils/responsiveSm";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Dropdown,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  notification,
} from "antd";
import { MenuProps } from "antd/lib";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { MdOutlineFileUpload } from "react-icons/md";
import { SiMicrosoftexcel } from "react-icons/si";
import * as XLSX from "xlsx";

const { Option } = Select;

interface bodyMarketerData {
  name: string;
  mobile: string;
  email: string;
  seller: string;
  note: string;
}

interface bodySellerData {
  name: string;
  mobile: string;
  email: string;
  note: string;
}

const AddAndUpdateLead = ({
  edit,
  isMarketer,
  leadId,
  stageList,
  sourceList,
  productList,
  locationList,
  sellerList,
  titleName,
}: {
  edit?: boolean;
  isMarketer?: boolean;
  leadId?: number | null | undefined;
  stageList: OptionListProps[];
  sourceList: OptionListProps[];
  productList: OptionListProps[];
  locationList: OptionListProps[];
  sellerList: OptionListProps[];
  titleName?: string;
}) => {
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [createLeadSeller, { isLoading: isLoadingAdd }] = useCreateLeadSellerMutation();
  const [editLeadSeller, { isLoading: isLoadingEdit }] = useEditLeadSellerMutation();
  const [createLeadMarketer, { isLoading: isLoadingAddMarketer }] = useCreateLeadMarketerMutation();
  const [editLeadMarketer, { isLoading: isLoadingEditMarketer }] = useEditLeadMarketerMutation();
  const [createLeadFollower, { isLoading: isLoadingAddFollower }] = useCreateLeadFollowerMutation();

  const { data: leadSeller } = useGetLeadSellerQuery(
    { leadSellerId: leadId },
    {
      skip: leadId && open && !isMarketer ? false : true,
    }
  );

  const { data: leadMarketer } = useGetLeadMarketerQuery(
    { leadMarketerId: leadId },
    {
      skip: leadId && open && isMarketer ? false : true,
    }
  );

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      name: values.name,
      mobile: values.mobile,
      email: values.email,
      seller: values.seller,
      source: values.source,
      location: values.location,
      stage: values.stage,
      product: values.product,
      note: values.note,
    };

    try {
      if (isMarketer) {
        const result = await createLeadMarketer(body);
        if (result && "error" in result) {
          notification.error({
            message: `${t("noficationAddAndUpdate.createLeadMarketerError")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setOpen(false);
          notification.success({
            message: `${t("noficationAddAndUpdate.createLeadMarketerSuccess")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else {
        const result = await createLeadSeller(body);
        if (result && "error" in result) {
          notification.error({
            message: `${t("noficationAddAndUpdate.createLeadMarketerError")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          const data = {
            lead: result?.data?.id,
            note: result?.data?.note,
            stage: result?.data?.stage,
          };
          await createLeadFollower(data);
          form.resetFields();
          setOpen(false);
          notification.success({
            message: `${t("noficationAddAndUpdate.createLeadMarketerSuccess")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      }
    } catch (error) {
      console.log(error);
      setOpen(true);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      name: leadSeller?.name || leadMarketer?.name,
      mobile: leadSeller?.mobile || leadMarketer?.mobile,
      email: leadSeller?.email || leadMarketer?.email,
      source: leadSeller?.source || leadMarketer?.source,
      location: leadSeller?.location || leadMarketer?.location,
      seller: leadSeller?.seller || leadMarketer?.seller,
      stage: leadSeller?.stage || leadMarketer?.stage,
      product: leadSeller?.product || leadMarketer?.product,
      note: leadSeller?.note || leadMarketer?.note,
    });
  }, [open, leadSeller, leadMarketer]);

  const onEdit = async (values: any) => {
    const body = {
      id: leadSeller?.id || leadMarketer?.id,
      name: values.name,
      mobile: values.mobile,
      email: values.email,
      seller: values.seller,
      source: values.source,
      location: values.location,
      stage: values.stage,
      product: values.product,
      note: values.note,
    };

    try {
      if (isMarketer) {
        const result = await editLeadMarketer(body);
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
            message: `${t("noficationAddAndUpdate.editLeadMarketerSuccess")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else {
        const result = await editLeadSeller(body);
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
            message: `${t("noficationAddAndUpdate.editLeadMarketerSuccess")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      }
    } catch (error) {
      console.log(error);
      setOpen(true);
    }
  };
  const [deleteLeadSeller, { isLoading: isLoadingDeleteL }] = useDeleteLeadSellerMutation();
  const onDelete = async (leadSellerId: any) => {
    try {
      await deleteLeadSeller({ leadSellerId });
      notification.success({
        message: `${t("noficationDelete.leadMarketerSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.leadMarketerError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => {};

  const items: MenuProps["items"] = [
    {
      label: <UploadByExcel />,
      key: "1",
    },
  ];

  return (
    <>
      {edit ? (
        <Button
          type={edit ? "text" : "primary"}
          className={` ${titleName ? "" : "bg-teal-600 hover:!bg-teal-500"}`}
          onClick={showDrawer}
          size={edit ? "small" : "middle"}
        >
          {titleName ? titleName : t("general.edit")}
        </Button>
      ) : (
        <Dropdown.Button type="primary" menu={{ items }} onClick={showDrawer}>
            {t("noficationAddAndUpdate.addNew")}
        </Dropdown.Button>
      )}

      <Drawer
        title={t("crm.addLead")}
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
              loading={
                edit
                  ? isLoadingEdit || isLoadingEditMarketer
                  : isLoadingAdd || isLoadingAddMarketer || isLoadingAddFollower
              }
            >
              {t("general.confirm")}
            </Button>
            <Popconfirm
              title={t("noficationDelete.customerTitle")}
              description={t("noficationDelete.customerDescription")}
              onConfirm={() => onDelete(leadId)}
              onCancel={cancel}
              okText={t("general.confirm")}
              cancelText={t("general.close")}
              placement="left"
              okButtonProps={{ loading: isLoadingDeleteL }}
            >
              <Button danger>Xóa</Button>
            </Popconfirm>
          </Space>
        }
        footer={
          <Button type="link" className="w-full h-full text-center" onClick={() => SetSizeDrawer(!sizeDrawer)}>
            {sizeDrawer ? t("general.collapse") : t("general.expand")}
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={edit ? onEdit : onFinish}>
          <div className="text-lg font-semibold mb-4">{t("crm.infoCustomer")}</div>
          <Form.Item label={t("table.customerName")} name="name" required>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={t("user.phone")} name="mobile" required>
                <Input />
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={t("auth.email")} name="email">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <div className="text-lg font-semibold mb-4">{t("crm.consultingStatus")}</div>

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="seller" label={t("table.salesConsultant")} className="w-full">
                <Select
                  showSearch
                  placeholder={t("noficationAddAndUpdate.sellerList")}
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
                  }
                >
                  {sellerList?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.last_name} {item.first_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {!(edit || isMarketer) && (
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item name="stage" label={t("general.status")} rules={[{ required: true }]}>
                  <Select
                    showSearch
                    placeholder={t("noficationAddAndUpdate.stageList")}
                    allowClear
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
                    }
                  >
                    {stageList?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.stage}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="source" label={t("crm.sourcesLead")} rules={[{ required: true }]} className="w-full">
                <Select
                  showSearch
                  placeholder={t("noficationAddAndUpdate.sourceList")}
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
                  }
                >
                  {sourceList?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="location" label={t("table.addressCustomer")} className="w-full">
                <Select
                  showSearch
                  placeholder={t("noficationAddAndUpdate.locationList")}
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
                  }
                >
                  {locationList?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.city}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="product" label={t("nav.products")} rules={[{ required: true }]}>
            <Select
              mode="multiple"
              showSearch
              placeholder={t("noficationAddAndUpdate.listOfProducts")}
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
              }
            >
              {productList?.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.product_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="note" label={t("general.note")} required>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default AddAndUpdateLead;

const UploadByExcel = () => {
  const t: any = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDialog, setModalDialog] = useState({
    open: false,
    success: [],
    error: [],
  });
  const [marketingExcel, setMarketingExcel] = useState<bodyMarketerData[]>([]);
  const [fileData, setFileData] = useState<{ name: string }>();
  const [createMultiMarketing, { isLoading: isLoadingAddMulti }] = useCreateMultiLeadMarketerMutation();
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
          const newMarketing = {
            name: item?.name,
            email: item?.email,
            mobile: item?.mobile,
            seller: item?.seller,
            note: item?.note,
          };
          setMarketingExcel((marketingExcel) => [...marketingExcel, newMarketing]);
        });
      };
    }
  };

  const createDataByExcel = async (data: bodyMarketerData[]) => {
    if (data) {
      try {
        const result = await createMultiMarketing(data);
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
            success: result?.data?.marketer_created,
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
          onClick={() => dowloadFileExcel(MARKETER_EXCEL_FILE, "Mẫu-thông-tin-khách-hàng.xlsx")}
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
          loading={isLoadingAddMulti}
          onClick={() => createDataByExcel(marketingExcel)}
          disabled={!fileData ? true : false}
        >
          Tải lên
        </Button>
      </Modal>
    </div>
  );
};
