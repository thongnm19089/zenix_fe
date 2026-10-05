import { useCreateBrandMutation, useEditBrandMutation } from "@/api/Procurement/apiProducts";
import { useCreateDivisionMutation, useEditDivisionMutation, useGetDivisionQuery } from "@/api/SetUp/apiDivision";
import { Button, Form, Input, Modal, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useWindowSize } from "@/utils/responsiveSm";

const AddAndUpdateBrand = ({ edit, brandId, brandName }: { edit?: boolean; brandId?: number; brandName?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createBrand, { isLoading: isLoadingAdd }] = useCreateBrandMutation();
  const [editBrand, { isLoading: isLoadingEdit }] = useEditBrandMutation();
  const [form] = Form.useForm();

  const t: any = useTranslations();
  const [width] = useWindowSize();

  //   const { data: division } = useGetBrandQuery({ divisionId: divisionId, userId: userId } || undefined, {
  //     skip: userId && divisionId && isModalOpen ? false : true,
  //   });

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (value: any) => {
    try {
      const result = await createBrand(value);

      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.haveThisBrand')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.successBranding')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    form.setFieldsValue({ brand_name: brandName });
  }, [isModalOpen, brandName]);

  const onEdit = async (value: any) => {
    const body = {
      id: brandId,
      brand_name: value.brand_name,
    };
    try {
      await editBrand(body);
      setIsModalOpen(false);
      notification.success({
        message: `${t('noficationAddAndUpdate.successEditedTheBrand')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationAddAndUpdate.haveThisBrand')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type={width < 640 && edit ? "text" : "primary"}
        className={` ${width > 640 && edit ? "bg-teal-600 hover:!bg-teal-500" : ""}`}
        onClick={showModal}
        size={`${edit ? "small" : "middle"}`}
        >
        {edit ? `${t('general.edit')}` : `${t('noficationAddAndUpdate.addBrand')}`}
      </Button>
      <Modal title={`${edit ? `${t('general.edit')}` : `${t('admin.more')}`} ${t('admin.brand')}`} open={isModalOpen} footer={null} onCancel={handleCancel}>
        <div>
          <Form
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            initialValues={{ remember: false }}
            onFinish={edit ? onEdit : onFinish}
            form={form}
          >
            <Form.Item
              name="brand_name"
              label={t('admin.brandName')}
              rules={[{ required: true, message: `${t('noficationAddAndUpdate.theBrandName')}` }]}
              className="my-4"
            >
              <Input />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button type="primary" htmlType="submit" className=" mb-2" loading={edit ? isLoadingEdit : isLoadingAdd}>
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

export default AddAndUpdateBrand;
