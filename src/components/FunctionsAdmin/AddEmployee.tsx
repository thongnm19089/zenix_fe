"use client";

import ModalDialog from "../ModalDialog/ModalDialog";
import { useCreateAccountMutation, useCreateMultiAccountMutation } from "@/api/SetUp/apiAccount";
import { dowloadFileExcel } from "@/constants/excelFile/dowloadFileExcel";
import { USER_EXCEL_FILE } from "@/constants/excelFile/userExcelFile";
import { Button, Checkbox, Col, Drawer, Form, Input, Radio, Row, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { SiMicrosoftexcel } from "react-icons/si";
import * as XLSX from "xlsx";

const { Option } = Select;

interface bodyUserData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

const AddEmployee = ({
  divisionData,
  branchData,
  positionData,
  detailFunctionData,
  refetchSetupList,
}: {
  divisionData?: any[];
  branchData?: any[];
  positionData?: any[];
  detailFunctionData?: any[];
  refetchSetupList: () => void;
}) => {
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const [userExcel, setUserExcel] = useState<bodyUserData[]>([]);
  const t: any = useTranslations();
  const [open, setOpen] = useState(false);
  const [selectCheckbox, setSelectCheckbox] = useState<string>("Nhập thông tin");
  const [form] = Form.useForm();
  const [modalDialog, setModalDialog] = useState({
    open: false,
    success: [],
    error: [],
  });
  const [fileData, setFileData] = useState<{ name: string }>();
  const [createAccount, { isLoading: isLoadingAdd, isError, error }] = useCreateAccountMutation();
  const [createMultiAccount, { isLoading: isLoadingAddMulti }] = useCreateMultiAccountMutation();
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    try {
      // Use unwrap to ensure that the promise will reject in case of an API error
      await createAccount(values).unwrap();
      notification.success({
        message: "Success",
        description: "Account created successfully!",
      });
      // form.resetFields();
      refetchSetupList();
      onClose();
    } catch (error) {
      console.log(error);
      const typedError = error as { data: { detail: string } };
      notification.error({
        message: "API Call Failed",
        description: typedError.data.detail || "An unexpected error occurred",
      });
    }
  };

  // Define an interface for your expected API response structure
  interface ApiSuccessResponse {
    data: {
      accounts_created?: any; // Assuming this is a number
      errors?: any; // Replace 'any' with a more specific type if possible
    };
  }

  const createUserByExcel = async (userData: bodyUserData[]) => {
    if (userData && selectCheckbox === "Tải lên file excel") {
      try {
        // Use unwrap to ensure that the promise will reject in case of an API error
        const result = await createMultiAccount(userExcel);
        if (result && "error" in result) {
          notification.error({
            message: `Thêm tài khoản người dùng thất bại`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          setModalDialog({
            ...modalDialog,
            open: true,
            success: result?.data?.accounts_created,
            error: result?.data?.errors,
          });
          refetchSetupList();
        }
        onClose();
      } catch (error) {
        console.log(error);
        const typedError = error as { data: { detail: string } };
        notification.error({
          message: "API Call Failed",
          description: typedError.data.detail || "An unexpected error occurred",
        });
      }
    }
  };

  // Hàm để lấy danh sách nhóm duy nhất
  const getUniqueCategories = (data: any[] | undefined) => {
    const categories = new Set(data?.map((item) => item.category_str));
    return Array.from(categories);
  };

  // Trong component AddEmployee
  const uniqueCategories = getUniqueCategories(detailFunctionData);

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
          const newUser = {
            username: item?.username,
            email: item?.email,
            password: item?.password,
            first_name: item?.first_name,
            last_name: item?.last_name,
            phone_number: item?.phone_number,
          };
          setUserExcel((userExcel) => [...userExcel, newUser]);
        });
      };
    }
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer} size="middle">
        {t("admin.addStaff")}
      </Button>

      <Drawer
        title={t("admin.createAccount")}
        width={sizeDrawer ? 768 : 350}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 40 }}
        footer={
          <div>
            <Button
              type="primary"
              onClick={() => {
                if (selectCheckbox === "Nhập thông tin") {
                  form.submit();
                } else {
                  createUserByExcel(userExcel);
                }
              }}
              loading={isLoadingAdd}
              block
            >
              {t("general.confirm")}
            </Button>
            <Button className="max-md:hidden mt-2" onClick={() => SetSizeDrawer(!sizeDrawer)} block>
              {sizeDrawer ? t("general.collapse") : t("general.expand")}
            </Button>
          </div>
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
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              numberphone: null,
              gender: null,
              division: null,
              position: null,
            }}
            disabled={selectCheckbox === "Tải lên file excel"}
          >
            <div className="text-lg font-semibold mb-4">{t("admin.infoAccount")}</div>
            <Form.Item
              label={t("auth.username")}
              name="username"
              rules={[{ required: true, message: t("auth.errorUsername") }]}
            >
              <Input />
            </Form.Item>
            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item
                  label={t("auth.password")}
                  name="password"
                  rules={[{ required: true, message: t("auth.errorPassword") }]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item
                  label={t("admin.confirmPassword")}
                  name="confirmPassword"
                  rules={[{ required: true, message: t("auth.errorPassword") }]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
            </Row>
            <div className="text-lg font-semibold mb-4">{t("nav.profile")}</div>

            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item
                  label={t("auth.firstName")}
                  name="first_name"
                  rules={[{ required: true, message: t("auth.firstName") }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item
                  label={t("auth.lastName")}
                  name="last_name"
                  rules={[{ required: true, message: t("auth.lastName") }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label={t("auth.numberPhone")} name="numberphone">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item label="Email" name="email" rules={[{ required: true, message: t("auth.errorEmail") }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item name="gender" label={t("user.gender")}>
                  <Select placeholder={t("user.gender")}>
                    <Select.Option value="">{t("user.genderValues.NA")}</Select.Option>
                    <Select.Option value="MA">{t("user.genderValues.MA")}</Select.Option>
                    <Select.Option value="FE">{t("user.genderValues.FE")}</Select.Option>
                    <Select.Option value="OT">{t("user.genderValues.OT")}</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item name="division" label={t("user.division")}>
                  <Select placeholder={t("user.division")} allowClear>
                    {divisionData?.map((division) => (
                      <Option key={division.key} value={division.key}>
                        {division.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item name="branch" label={t("user.branch")}>
                  <Select placeholder={t("user.branch")} allowClear>
                    {branchData?.map((branch) => (
                      <Option key={branch.key} value={branch.key}>
                        {branch.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={sizeDrawer ? 12 : 24}>
                <Form.Item name="position" label={t("user.position")}>
                  <Select placeholder={t("user.position")} allowClear>
                    {positionData?.map((position) => (
                      <Option key={position.id} value={position.id}>
                        {position.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label={t("auth.address")} name="address">
              <Input.TextArea />
            </Form.Item>

            <div className="text-lg font-semibold mb-4">{t("admin.setting")}</div>
            <Form.Item name="detailFunction">
              <Checkbox.Group style={{ width: "100%" }}>
                {uniqueCategories.map((category: React.Key | null | undefined) => (
                  <div key={category} className="mb-4">
                    <Row gutter={[16, 16]} wrap>
                      <Col span={24} className="font-bold mb-2">
                        {t(`functionCategory.${category}`)}
                      </Col>
                      {detailFunctionData &&
                        detailFunctionData
                          .filter((item) => item.category_str === category)
                          .map((filteredItem) => (
                            <Col span={sizeDrawer ? 8 : 24} key={filteredItem.key}>
                              <Checkbox value={filteredItem.key}>
                                {t(`detailFunction.${filteredItem.en_title}`)}
                              </Checkbox>
                            </Col>
                          ))}
                    </Row>
                  </div>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </Form>
          <Radio className="mb-2 mt-2" value={"Tải lên file excel"}>
            Tải lên file excel
            <span
              className="cursor-pointer underline italic text-primary"
              onClick={() => dowloadFileExcel(USER_EXCEL_FILE, "Mẫu-thông-tin-người-dùng.xlsx")}
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
        </Radio.Group>
        <div className="flex w-100% justify-center">
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
      </Drawer>
      <ModalDialog
        open={modalDialog.open}
        setOpen={(value) => setModalDialog({ ...modalDialog, open: value })}
        success={modalDialog.success}
        error={modalDialog.error}
        object_str="Các tài khoản"
      />
    </>
  );
};

export default AddEmployee;
