"use client";

import {
  useCreateEmployeeContractMutation,
  useCreateMultiEmployeeContractMutation,
  useEditEmployeeContractMutation,
  useGetEmployeeContractQuery,
} from "@/api/HR/apiHRApp";
import { useGetSetupHrAppQuery, useGetSetupQuery } from "@/api/SetUp/apiSetup";
import ModalDialog from "@/components/ModalDialog/ModalDialog";
import UploadFileList from "@/components/Upload/UploadFileList";
import { dowloadFileExcel } from "@/constants/excelFile/dowloadFileExcel";
import { useWindowSize } from "@/utils/responsiveSm";
import { EMPLOYEE_CONTRACT_EXCEL_FILE } from "@/constants/excelFile/employeeContractExcelFIle";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Upload,
  notification,
} from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { SiMicrosoftexcel } from "react-icons/si";
import * as XLSX from "xlsx";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface bodyDataEmployeeContract {
  employee: string;
  start_date: string;
  end_date: string;
  note: string;
}

const AddAndUpdateEmployeeContract = ({
  edit,
  employeeContractId,
}: {
  edit?: boolean;
  employeeContractId?: number | null | undefined;
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
  const [employeeContractExcel, setEmployeeContractExcel] = useState<bodyDataEmployeeContract[]>([]);
  const [uploadedFile, setUploadedFile] = useState<any>(null); // State để lưu trữ thông tin tập tin đã tải lên

  const [createEmployeeContract, { isLoading: isLoadingAdd }] = useCreateEmployeeContractMutation();
  const [createMultiEmployeeContract, { isLoading: isLoadingAddMulti }] = useCreateMultiEmployeeContractMutation();
  const [editEmployeeContract, { isLoading: isLoadingEdit }] = useEditEmployeeContractMutation();

  const { data: employeeContractData } = useGetEmployeeContractQuery(
    employeeContractId ? { employeeContractId } : undefined,
    {
      skip: !employeeContractId || !open,
    }
  );

  const { data: setupHRList } = useGetSetupHrAppQuery();
  const { data: setupList } = useGetSetupQuery();

  useEffect(() => {
    if (edit && employeeContractData) {
      form.setFieldsValue({
        ...employeeContractData,
        is_valid: employeeContractData?.is_valid,
        date: [dayjs(employeeContractData?.start_date), dayjs(employeeContractData?.end_date)],
      });

      if (employeeContractData.file) {
        const existingFileList = [
          {
            uid: "-1", // Unique identifier, can be any unique string
            name: employeeContractData.file, // You can extract file name from URL
            status: "done",
            url: employeeContractData.file,
          },
        ];
        setUploadedFile(existingFileList);
      } else {
        setUploadedFile([]);
      }
    }
  }, [employeeContractData, form, edit]);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    const formData = new FormData();

    if (edit) {
      let isFileUpdated = false;
      // Check if a new file has been uploaded and is different from the existing file
      if (uploadedFile && uploadedFile.length > 0) {
        const newFile = uploadedFile[0];
        if (!newFile?.status) {
          formData.append("file", newFile);
          isFileUpdated = true;
        }
      }
    } else {
      // console.log("chay vao day tao moi");
      if (uploadedFile && uploadedFile.length > 0) {
        formData.append("file", uploadedFile[0]);
      }
    }

    Object.keys(values).forEach((key) => {
      if (key === "date") {
        const startDate = dayjs(values.date[0]).format("YYYY-MM-DD");
        const endDate = dayjs(values.date[1]).format("YYYY-MM-DD");
        formData.append("start_date", startDate);
        formData.append("end_date", endDate);
      } else {
        formData.append(key, values[key]);
      }
    });

    try {
      let result = edit
        ? await editEmployeeContract({
          id: employeeContractId,
          formData,
        }).unwrap()
        : await createEmployeeContract(formData).unwrap();
      form.resetFields();
      setOpen(false);
      notification.success({
        message: edit ? t("error.successfullyRepaired") : t("general.success"),
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: edit ? t("error.fixFailure") : t("error.failure"),
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
          const newEmployCt = {
            employee: item?.employee,
            start_date: item?.start_date,
            end_date: item?.end_date,
            note: item?.note,
          };
          setEmployeeContractExcel((employeeContractExcel) => [...employeeContractExcel, newEmployCt]);
        });
      };
    }
  };

  // Define an interface for your expected API response structure
  interface ApiSuccessResponse {
    data: {
      employee_contracts_created?: any; // Assuming this is a number
      errors?: any; // Replace 'any' with a more specific type if possible
    };
  }

  const createDataByExcel = async (data: bodyDataEmployeeContract[], checkBox: string) => {
    if (data && checkBox === "Tải lên file excel") {
      try {
        const result = await createMultiEmployeeContract(data);
        if (result && "error" in result) {
          notification.error({
            message: `Thêm hồ sơ nhân sự thất bại`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          setOpen(false);
          setModalDialog({
            ...modalDialog,
            open: true,
            success: result?.data?.employee_contracts_created,
            error: result?.data?.errors,
          });
        }
      } catch (error) {
        console.error(error);
        notification.error({
          message: edit ? t("error.fixFailure") : t("error.failure"),
          placement: "bottomRight",
          className: "h-16",
        });
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
        size={`${edit ? "small" : "middle"}`}
      >
        {edit ? `${t("general.edit")}` : `${t("general.add")}`}
      </Button>
      <Drawer
        title={`${edit ? `${t("general.edit")}` : `${t("general.add")}`} ${t("nav.contract")}`}
        width={sizeDrawer ? 768 : 350}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80, display: "fle" }}
        extra={
          <Space>
            <Button
              onClick={() => {
                if (selectCheckbox === "Nhập thông tin") {
                  form.submit();
                } else {
                  createDataByExcel(employeeContractExcel, selectCheckbox);
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
          <Form disabled={selectCheckbox === "Tải lên file excel"} form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="employee" label={t("hr.employee")} required>
              <Select
                placeholder={t("hr.selectPersonnel")}
                allowClear
                showSearch
                filterOption={(input, option: any) => {
                  // Concatenate the last name, first name, and username with spaces
                  const fullName = `${option?.children}`;
                  // Check if the input is part of the concatenated string
                  return fullName.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}
              >
                {setupList?.employee_list?.map(
                  (item: { id: number; username: string; first_name: string; last_name: string }) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.last_name} {item.first_name} @{item.username}
                    </Select.Option>
                  )
                )}
              </Select>
            </Form.Item>
            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item name="type" label={t("hr.contractType")} required>
                  <Select
                    placeholder={t("hr.selectContractType")}
                    allowClear
                    showSearch
                    filterOption={(input, option: any) =>
                      option?.children?.toLowerCase()?.indexOf(input?.toLowerCase()) >= 0
                    }
                  >
                    {setupHRList?.contract_type_list?.map((item: { id: number; title: string }) => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.title}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item name="duration" label={t("hr.contractDuration")} required>
                  <Select
                    placeholder={t("hr.selectContractDuration")}
                    allowClear
                    showSearch
                    filterOption={(input, option: any) =>
                      option?.children?.toLowerCase()?.indexOf(input?.toLowerCase()) >= 0
                    }
                  >
                    {setupHRList?.contract_duration_list?.map((item: { id: number; title: string }) => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.title}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="date" label={t("general.time")} required>
              <RangePicker className="w-full" />
            </Form.Item>

            <Row>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item
                  name="is_active"
                  valuePropName="checked"
                  initialValue={true} // Sets the checkbox to be checked by default
                >
                  <Checkbox>{t("hr.is_active")} </Checkbox>
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label={t("nav.contract")} required>
                  <UploadFileList setFileList={setUploadedFile} fileList={uploadedFile} maxCount={1} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="note" label={t("general.note")}>
              <Input.TextArea />
            </Form.Item>
          </Form>
          {!edit && (
            <>
              <Radio className="mb-2 mt-2" value={"Tải lên file excel"}>
                Tải lên file excel
                <span
                  className="cursor-pointer underline italic text-primary"
                  onClick={() => dowloadFileExcel(EMPLOYEE_CONTRACT_EXCEL_FILE, "Mẫu-thông-tin-hồ-sơ-nhân-sự.xlsx")}
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
          object_str="Các hồ sơ nhân sự"
        />
      </Drawer>
    </>
  );
};

export default AddAndUpdateEmployeeContract;
