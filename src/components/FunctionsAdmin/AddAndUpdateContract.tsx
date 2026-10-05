import {
  useCreateContractDurationMutation,
  useCreateContractTypeMutation,
  useEditContractDurationMutation,
  useEditContractTypeMutation,
  useGetContractDurationQuery,
  useGetContractTypeQuery,
} from "@/api/HR/apiContract";
import colorToString from "@/utils/colorToString";
import { Button, ColorPicker, Form, Input, Modal, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";

const AddAndUpdateContract = ({
  edit,
  title,
  titleLabel,
  contractDurationId,
  contractTypeId,
  isType,
}: {
  edit?: boolean;
  title: string;
  titleLabel: string;
  contractDurationId?: number;
  contractTypeId?: number;
  isType?: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [createContractDuration, { isLoading: isLoadingAdd }] = useCreateContractDurationMutation();
  const [editContractDuration, { isLoading: isLoadingEdit }] = useEditContractDurationMutation();
  const [createContractType, { isLoading: isLoadingAddContractType }] = useCreateContractTypeMutation();
  const [editContractType, { isLoading: isLoadingEditContractType }] = useEditContractTypeMutation();

  const { data: contractDurationData } = useGetContractDurationQuery(contractDurationId, {
    skip: contractDurationId && isModalOpen ? false : true,
  });

  const { data: contractTypeData } = useGetContractTypeQuery(contractTypeId, {
    skip: contractTypeId && isModalOpen && isType ? false : true,
  });

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      title: values.title,
      status: values.status,
      color: colorToString(values?.color?.metaColor || "#1677ff"),
    };
    try {
      if (isType) {
        const result = await createContractType(body);
        if (result && "error" in result) {
          notification.error({
            message: `Bạn đã có loại hợp đồng này`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `Thêm loại hợp đồng mới thành công`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else {
        const result = await createContractDuration(body);
        if (result && "error" in result) {
          notification.error({
            message: `Bạn đã có thời hạn đồng này`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `Thêm thời hạn hợp đồng mới thành công`,
            placement: "bottomRight",
            className: "h-[86px]",
          });
        }
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    if (isType) {
      form.setFieldsValue({ title: contractTypeData?.title, color: contractTypeData?.color });
    } else {
      form.setFieldsValue({ title: contractDurationData?.title, color: contractDurationData?.color });
    }
  }, [isModalOpen, contractDurationData, contractTypeData]);

  const onEdit = async (values: any) => {
    const body = {
      id: contractDurationId || contractTypeId,
      title: values.title,
      color: colorToString(values.color.metaColor || values.color),
    };
    try {
      if (isType) {
        await editContractType(body);
      } else {
        await editContractDuration(body);
      }
      setIsModalOpen(false);
      notification.success({
        message: `Cập nhật ${isType ? "loại" : "thời hạn"} thành công`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `Thay đổi thất bại`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}
        size={edit ? "small" : "middle"}
        className={edit ? "bg-teal-600 hover:!bg-teal-500" : ""}
      >
        {edit ? t("general.edit") : t("general.createNew")}
      </Button>
      <Modal
        title={`${edit ? t("general.edit") : t("general.createNew")} ${title}`}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <div>
          <Form
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            initialValues={{ remember: false }}
            onFinish={edit ? onEdit : onFinish}
            form={form}
          >
            <Form.Item name="title" label={titleLabel} className="my-4">
              <Input />
            </Form.Item>
            <Form.Item name="color" label={t('admin.color')} className="my-4">
              <ColorPicker />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button
                type="primary"
                htmlType="submit"
                className=" mb-2"
                loading={edit ? isLoadingEdit || isLoadingEditContractType : isLoadingAdd || isLoadingAddContractType}
              >
                {t("general.confirm")}
              </Button>

              <Button onClick={handleCancel}>{t("general.cancel")}</Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default AddAndUpdateContract;
