"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, notification, ColorPicker, Select } from "antd";
import { useTranslations } from "next-intl";
import { useCreateCreatorMutation, useEditCreatorMutation, useGetCreatorQuery, useSetUpBrandQuery, useGetCreatorListQuery } from "@/api/Branding/apiBranding";

const { Option } = Select;

const AddAndUpdateCreator = ({
  edit,
  creatorId,
  title,
}: {
  edit?: boolean;
  creatorId?: number;
  title?: string;
}) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [value, setValue] = useState<string>("#1677ff");

  const [createCreator] = useCreateCreatorMutation();
  const [editCreator] = useEditCreatorMutation();
  const { data: creatorData } = useGetCreatorQuery(creatorId, { skip: !creatorId });
  const { data: setUpBrandData } = useSetUpBrandQuery({});
  const { data: creatorListData } = useGetCreatorListQuery({});

  useEffect(() => {
    if (edit && creatorData) {
      form.setFieldsValue({
        user: creatorData?.user,
        color: creatorData?.color,
      });
      setValue(creatorData.color);
    }
  }, [edit, creatorData]);

  const filteredEmployeeList = setUpBrandData?.employee_list.filter(
    (employee: { id: number }) =>
      !creatorListData?.results?.some(
        (creator: { user: number }) => creator.user === employee.id && creator.user !== creatorData?.user
      )
  );

  const resetForm = () => {
    form.resetFields();
    setValue("#1677ff");
  };

  const showModal = () => {
    setIsModalVisible(true);
    if (edit && creatorData) {
      form.setFieldsValue({
        user: creatorData.user,
      });
      if (value !== creatorData.color) {
        setValue(creatorData.color);
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields(["user"]);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedValues = {
        ...values,
        color: value,
      };

      if (edit) {
        await editCreator({ creatorId, ...updatedValues }).unwrap();
        notification.success({
          message: t('noficationAddAndUpdate.creatorEditSuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        await createCreator(updatedValues).unwrap();
        notification.success({
          message: t('noficationAddAndUpdate.creatorCreateSuccess'),
          placement: "bottomRight",
          className: "h-16",
        });
        resetForm();
      }
      setIsModalVisible(false);
    } catch (error: any) {
      if (error.data && error.data.non_field_errors) {
        notification.error({
          message: t('notificationCreate.creatorError'),
          description: error.data.non_field_errors.join(', '),
          placement: "bottomRight",
          className: "h-16",
        });
      }
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}
        className={edit ? "bg-teal-600 hover:!bg-teal-500" : ""}
        size={edit ? "small" : "middle"}
      >
        {edit ? `${t('general.edit')}` : title}
      </Button>
      <Modal
        title={title}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            {t("general.cancel")}
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            {t("general.confirm")}
          </Button>
        ]}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {edit ? (
            <Form.Item
              name="user"
              label={t('form.creatorName')}
              rules={[{ required: true, message: t('form.required') }]}
            >
              <Select
                placeholder={t('form.selectUser')}
                defaultValue={creatorData?.user}
              >
                {filteredEmployeeList?.map((employee: { id: number, first_name: string, last_name: string }) => (
                  <Option key={employee.id} value={employee.id}>
                    {`${employee.last_name} ${employee.first_name}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            // Hiển thị khi tạo mới (create)
            <Form.Item
              name="users"
                label={t('form.creatorName')}
              rules={[{ required: true, message: t('form.required') }]}
            >
              <Select
                mode="multiple" // multiple select for create
                placeholder={t('form.selectUsers')}
              >
                {filteredEmployeeList?.map((employee: { id: number, first_name: string, last_name: string }) => (
                  <Option key={employee.id} value={employee.id}>
                    {`${employee.last_name} ${employee.first_name}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item
            name="color"
            label={t('form.color')}
          >
            <ColorPicker
              value={value}
              onChange={(color) => setValue(color.toHexString())}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddAndUpdateCreator;
