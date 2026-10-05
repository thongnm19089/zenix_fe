import {
  useCreateClassifyListMutation,
  useEditClassifyListMutation,
  useGetClassifyListQuery,
} from "@/api/Procurement/apiProducts";
import { Button, Form, Input, Modal, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { MdRemoveCircleOutline } from "react-icons/md";
import { useWindowSize } from "@/utils/responsiveSm";

export default function AddAndUpdateProductClassification({
  edit,
  classifyListId,
}: {
  edit?: boolean;
  classifyListId?: number | null | undefined;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [createClassifyList, { isLoading: isLoadingAdd, isError, error }] = useCreateClassifyListMutation();
  const [editClassifyList, { isLoading: isLoadingEdit }] = useEditClassifyListMutation();

  const { data: classifyListData } = useGetClassifyListQuery(
    { classifyListId },
    {
      skip: classifyListId && isModalOpen ? false : true,
    }
  );

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    try {
      values.product_ids = [];

      const result = await createClassifyList(values);

      if (result && "error" in result) {
        notification.error({
          message: `Thêm nhóm phân loại thất bại`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        notification.success({
          message: `Thêm nhóm phân loại thành công`,
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
    form.setFieldsValue({
      title: classifyListData?.title,
      classify_list: classifyListData?.classify_list?.map((item: { title: string }) => {
        return { title: item.title };
      }),
    });
  }, [isModalOpen, classifyListData]);

  const onEdit = async (values: any) => {
    const body = {
      id: classifyListId,
      title: values.title,
      classify_list: values.classify_list,
    };

    try {
      await editClassifyList(body);
      setIsModalOpen(false);
      notification.success({
        message: `Sửa danh mục thành công`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `Bạn đã có danh mục này`,
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
        {edit ? `${t('general.edit')}` : `${t('admin.create')}`}
      </Button>
      <Modal title={t('noficationAddAndUpdate.addSelectionGroup')}open={isModalOpen} footer={null} onCancel={handleCancel}>
        <Form name="classify" onFinish={edit ? onEdit : onFinish} form={form}>
          <Form.Item
            name="title"
            label={t('noficationAddAndUpdate.selectionGroup')}
            rules={[{ required: true, message: `${t('noficationAddAndUpdate.nameOfYourChoice')}` }]}
            className="my-4"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 16 }}
          >
            <Input />
          </Form.Item>

          <Form.List name="classify_list" initialValue={[{ title: "" }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div className="ml-[70px] flex items-center gap-2">
                    <Form.Item {...restField} name={[name, "title"]} label={t('admin.select')} className="mb-2 w-full">
                      <Input className="w-full" />
                    </Form.Item>
                    <MdRemoveCircleOutline onClick={() => remove(name)} />
                  </div>
                ))}
                <Form.Item className=" mb-4 sku-item mr-6" labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
                  <Button type="dashed" onClick={() => add()} block className="ml-1.5">
                  {t('admin.moreOptions')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <div className="flex justify-end gap-2">
            <Button type="primary" htmlType="submit" className=" mb-2" loading={isLoadingAdd || isLoadingEdit}>
              {t("general.confirm")}
            </Button>

            <Button onClick={handleCancel}>{t("general.cancel")}</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
