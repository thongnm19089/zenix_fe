import { useEditClassifyListMutation, useGetClassifyListQuery } from "@/api/Procurement/apiProducts";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import { Button, Form, Input, Modal, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { ReactNode, useEffect, useState } from "react";

interface Product {
  id: number;
  product_name: string;
}

export default function LinkProductModal({ classifyListId, onClose }: { classifyListId: number; onClose: () => void }) {
  const [form] = Form.useForm();
  const t: any = useTranslations();

  const { data: setupCrmApp, isLoading } = useGetSetupCrmAppQuery();
  const { data: classifyList } = useGetClassifyListQuery({
    options: {},
    classifyListId: classifyListId,
  });
  const [editClassifyList, { isLoading: isLoadingEdit }] = useEditClassifyListMutation();

  useEffect(() => {
    const productIds = classifyList?.products.map((product: { id: any }) => product.id);
    form.setFieldsValue({ linkedProduct: productIds });
  }, [classifyList]);

  const onEdit = async (values: any) => {
    // Handle linking product here
    const body = {
      id: classifyListId,
      product_ids: values.linkedProduct,
    };
    try {
      await editClassifyList(body);
      notification.success({
        message: "Success",
        description: "Sản phẩm đã được liên kết thành công!",
      });
      form.resetFields();
      onClose();
    } catch (error) {
      notification.error({
        message: `Thất bại`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Modal title="Liên kết sản phẩm" open={true} footer={null} onCancel={onClose}>
      <Form name="link-product" onFinish={onEdit} form={form}>
        <Form.Item name="linkedProduct" label="Chọn sản phẩm">
          <Select mode="multiple">
            {setupCrmApp?.product_list?.map((product: Product) => (
              <Select.Option key={product.id} value={product.id}>
                {product?.product_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button type="primary" htmlType="submit" loading={ isLoadingEdit }>
            {t("general.confirm")}
          </Button>

          <Button onClick={onClose}>{t("general.cancel")}</Button>
        </div>
      </Form>
    </Modal>
  );
}
