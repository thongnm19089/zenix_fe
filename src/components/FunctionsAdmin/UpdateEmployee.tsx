"use client";

import {
  useEditAccountMutation,
  useGetAccountQuery,
} from "@/api/SetUp/apiAccount";
import { useWindowSize } from "@/utils/responsiveSm";
import { Button, Checkbox, Col, Drawer, Form, Input, Row, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { Collapse } from 'antd';

const { Panel } = Collapse;
const { Option } = Select;

interface Item {
  key: number;
  title: string;
  en_title: string;
  category_str: string;
}

const UpdateEmployee = ({
  userId,
  divisionData,
  branchData,
  positionData,
  detailFunctionData,
  refetchSetupList,
}: {
  userId?: any;
  divisionData?: any[];
  branchData?: any[];
  positionData?: any[];
  detailFunctionData?: any[];
  refetchSetupList: () => void;
}) => {
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [editAccount, { isLoading: isLoadingEdit }] = useEditAccountMutation();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const response = useGetAccountQuery(userId || undefined, { skip: !userId ? true : false });
  const {refetch} = response;
  useEffect(() => {
    const fetchData = async () => {
      if (open && response) {
        const data = await response.data;
        const userDetailFunctionIds = data.user_profile.detail_function.map((func: { id: any; }) => func.id);
        setSelectedItems(userDetailFunctionIds)
        if (data) {
          form.setFieldsValue({
            username: data?.username,
            first_name: data?.first_name,
            last_name: data?.last_name,
            numberphone: data?.user_profile?.user_mobile_number,
            email: data?.email,
            gender: data?.user_profile?.gender || "",
            division: data?.user_profile?.division?.id,
            branch: data?.user_profile?.branch?.id,
            position: data?.user_profile?.position?.id,
            address: data?.user_profile?.user_address,
          });
        }
      }
    };

    fetchData();
  }, [open, response]);

  const onFinish = async (values: any) => {
    try {
      values.user_id = userId;
      values.detailFunction = selectedItems;
      // console.log("thong tin submit update employee", values);
      await editAccount(values).unwrap();
      notification.success({
        message: "Success",
        description: "Account updated successfully!",
      });
      form.resetFields();
      refetchSetupList();
      refetch();
      onClose();
    } catch (error) {
      notification.error({
        message: "API Call Failed",
        description: "Failed to submit the form due to an API error!",
      });
    }
  };

  // Hàm để lấy danh sách nhóm duy nhất
  const getUniqueCategories = (data: any[] | undefined) => {
    const categories = new Set(data?.map(item => item.category_str));
    return Array.from(categories);
  };

  const uniqueCategories = getUniqueCategories(detailFunctionData);
  //@ts-ignore
  const groupedData: Record<string, Item[]> = detailFunctionData.reduce((acc, item) => {
    if (!acc[item.category_str]) {
      acc[item.category_str] = [];
    }
    acc[item.category_str].push(item);
    return acc;
  }, {});

  const handleCheckboxChange = (key: number) => {
    setSelectedItems((prevSelected) =>
      prevSelected?.includes(key)
        ? prevSelected?.filter((item) => item !== key)
        : [...prevSelected, key]
    );
  };

  const handleCategoryChange = (category: string) => {
    const categoryItems = groupedData[category].map((item) => item.key);
    const allSelected = categoryItems.every((key) => selectedItems.includes(key));

    if (allSelected) {
      setSelectedItems((prevSelected) =>
        prevSelected.filter((item) => !categoryItems.includes(item))
      );
    } else {
      setSelectedItems((prevSelected) => [
        ...prevSelected,
        ...categoryItems.filter((key) => !prevSelected.includes(key))
      ]);
    }
  };

  // Hàm kiểm tra tất cả checkbox trong một danh mục đã được chọn hay chưa
  const isCategoryChecked = (category: string) => {
    const categoryItems = groupedData[category].map((item) => item.key);
    return categoryItems.every((key) => selectedItems.includes(key));
  };

  const isCategoryIndeterminate = (category: string) => {
    const categoryItems = groupedData[category].map((item) => item.key);
    const selectedCount = categoryItems.filter((key) => selectedItems.includes(key)).length;
    return selectedCount > 0 && selectedCount < categoryItems.length;
  };

  const handleSelectAll = () => {
    const allKeys = Object.values(groupedData).flat().map((item) => item.key);
    setSelectedItems(allKeys);
  };

  return (
    <>
      <Button
        type={width < 640 ? "text" : "primary"}
        className={` ${width < 640 ? "" : "bg-teal-600 hover:!bg-teal-500"}`}
        onClick={showDrawer}
        size="small"
      >
        {t("general.edit")}
      </Button>
      <Drawer
        title={t('admin.editAccount')}
        width={sizeDrawer ? 768 : 350}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div>
            <Button type="primary" onClick={() => form.submit()} loading={isLoadingEdit} block>
              {t('general.confirm')}
            </Button>
            <Button className="max-md:hidden mt-2" onClick={() => SetSizeDrawer(!sizeDrawer)} block>
              {sizeDrawer ? t("general.collapse") : t("general.expand")}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="text-lg font-semibold mb-4">{t('admin.infoAccount')}</div>
          <Form.Item
            label={t("auth.username")}
            name="username"
            rules={[{ required: true, message: t("auth.errorUsername") }]}
          >
            <Input />
          </Form.Item>

          <div className="text-lg font-semibold mb-4">{t('nav.profile')}</div>
          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item
                label={t("auth.firstName")}
                name="first_name"
                rules={[{ required: true, message: "Please input your first name!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item
                label={t("auth.lastName")}
                name="last_name"
                rules={[{ required: true, message: "Please input your last name!" }]}
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
              <Form.Item label="Email" name="email">
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
              <Form.Item
                name="position"
                label={t("user.position")}
              >
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

          <Form.Item name="is_admin" valuePropName="checked" label={t("user.is_admin")}>
            <Checkbox>{t("user.is_admin")}</Checkbox>
          </Form.Item>

          <div className="text-lg font-semibold mb-4">{t('admin.setting')}</div>
          <div className="flex items-center mb-4">
            <Checkbox
              checked={Object.values(groupedData).flat().every((item) => selectedItems.includes(item.key))}
              onChange={() => {
                if (Object.values(groupedData).flat().every((item) => selectedItems.includes(item.key))) {
                  setSelectedItems([]);
                } else {
                  setSelectedItems(Object.values(groupedData).flat().map(item => item.key));
                }
              }}
            >
              Chọn tất cả
            </Checkbox>
          </div>
        </Form>
        <Collapse>
          {Object.keys(groupedData).map((category) => (
            <Panel
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t(`functionCategory.${category}`)}</span>
                  {/* Checkbox của danh mục */}
                  <Checkbox
                    checked={isCategoryChecked(category)}
                    indeterminate={isCategoryIndeterminate(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                </div>
              }
              key={category}
            >
              {groupedData[category].map((item: Item) => (
                <div key={item.key} style={{ marginBottom: 8 }}>
                  <Checkbox
                    key={item.key}
                    checked={selectedItems.includes(item.key)}
                    onChange={() => handleCheckboxChange(item.key)}
                  >
                    {item.title}
                  </Checkbox>
                </div>
              ))}
            </Panel>
          ))}
        </Collapse>
      </Drawer>
    </>
  );
};

export default UpdateEmployee;
