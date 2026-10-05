import { useEditProductMutation, useUpdateSuppliersMutation } from "@/api/Procurement/apiProducts";
import { useGetSetupProcurementAppQuery } from "@/api/SetUp/apiSetup";
import { Button, Form, Modal, Select, Tag, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";

const AddSupplier = ({ data, productId }: { data: { id: number; name: string }[]; productId: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [updateSuppliers, { isLoading: isLoadingEdit }] = useUpdateSuppliersMutation();
  const { data: setupProcurementApp } = useGetSetupProcurementAppQuery();
  const supplierIds = useMemo(() => {
    return data.map((item) => item.id);
  }, [data]);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      id: productId,
      supplier_ids: values.supplier_ids || [],
    };

    try {
      await updateSuppliers(body);
      setIsModalOpen(false);
      notification.success({
        message: `${t("noficationAddAndUpdate.editBoardSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationAddAndUpdate.editBoardError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };
  return (
    <>
      <div onClick={showModal}>
        {data.map((item, index) => (
          <div key={index}>- {item.name}</div>
        ))}
        {data.length === 0 && (
          <div className="border-dashed h-full w-full">
            <p>Chưa có nhà cung cấp</p>
            <button onClick={showModal}>Thêm nhà cung cấp</button>
          </div>
        )}
      </div>
      <Modal title="Thêm/Thay đổi nhà cung cấp" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={onFinish} form={form}>
          <Form.Item name="supplier_ids" label="Nhà cung cấp" className="my-4" initialValue={supplierIds || []}>
            <Select
              mode="multiple" // Cho phép chọn nhiều người dùng
              showSearch // Hiển thị thanh tìm kiếm
              placeholder="Chọn nhà cung cấp" // Văn bản gợi ý
              optionFilterProp="children" // Lọc dựa trên nội dung của mỗi lựa chọn
              filterOption={
                (input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase()) // Hàm lọc để tìm kiếm người dùng
              }
            >
              {setupProcurementApp?.supplier_list?.map((option: any) => (
                <Select.Option key={option?.id} value={option?.id}>
                  {option.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-2">
            <Button type="primary" onClick={() => form.submit()} className="mb-2" loading={isLoadingEdit}>
              {t("general.confirm")}
            </Button>
            <Button onClick={handleCancel}>{t("general.cancel")}</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AddSupplier;
