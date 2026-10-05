import { useCreateCategoryMutation, useEditCategoryMutation } from "@/api/Procurement/apiProducts";
import { Button, Form, Input, Modal, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useWindowSize } from "@/utils/responsiveSm";

const { Option } = Select;

interface categoryDataProps {
  id: number;
  category_name: string;
}

const AddAndUpdateCategory = ({
  edit,

  categoryId,
  categoryName,
  categoryData,
}: {
  edit?: boolean;

  categoryId?: number;
  categoryName?: string;
  categoryData?: categoryDataProps[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createCategory, { isLoading: isLoadingAdd }] = useCreateCategoryMutation();
  const [editCategory, { isLoading: isLoadingEdit }] = useEditCategoryMutation();
  const [form] = Form.useForm();

  const t: any = useTranslations();
  const [width] = useWindowSize();

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (value: any) => {
    try {
      const result = await createCategory(value);

      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.haveThisCategory')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.addedCategorySuccess')}`,
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
    form.setFieldsValue({ category_name: categoryName });
  }, [isModalOpen, categoryName]);

  const onEdit = async (value: any) => {
    const body = {
      id: categoryId,
      category_name: value.category_name,
    };
    try {
      await editCategory(body);
      setIsModalOpen(false);
      notification.success({
        message: `${t('noficationAddAndUpdate.directorySuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message:`${t('noficationAddAndUpdate.haveThisCategory')}` ,
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
        {edit ? `${t('general.edit')}` : `${t('noficationAddAndUpdate.addCategories')}`}
      </Button>
      <Modal title={`${edit ? `${t('general.edit')}` : `${t('admin.more')}`} ${t('table.categories')}`} open={isModalOpen} footer={null} onCancel={handleCancel}>
        <div>
          <Form
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            initialValues={{ remember: false }}
            onFinish={edit ? onEdit : onFinish}
            form={form}
          >
            <Form.Item
              name="category_name"
              label={t('admin.categoryName')}
              rules={[{ required: true, message: `${t('noficationAddAndUpdate.pleaseCategoryName')}` }]}
              className="my-4"
            >
              <Input />
            </Form.Item>
            <Form.Item name="parent_category" label={t('admin.mainCategory')}>
              <Select allowClear>
                {edit
                  ? categoryData
                      ?.filter((item: categoryDataProps) => item.category_name !== categoryName)
                      .map((item: categoryDataProps) => (
                        <Option key={item.id} value={item.id}>
                          {item.category_name}
                        </Option>
                      ))
                  : categoryData?.map((item: categoryDataProps) => (
                      <Option key={item.id} value={item.id}>
                        {item.category_name}
                      </Option>
                    ))}
              </Select>
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

export default AddAndUpdateCategory;
