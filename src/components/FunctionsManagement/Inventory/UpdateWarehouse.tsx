import { useEditInventoryMutation, useGetWarehouseListQuery } from "@/api/Inventory/apiInventory";
import { Button, Form, Modal, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const { Option } = Select;

const UpdateWarehouse = ({ inventoryId }: { inventoryId: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editInventory, { isLoading: isLoadingEdit }] = useEditInventoryMutation();
  const t: any = useTranslations();

  const { data: warehouseList } = useGetWarehouseListQuery();

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    try {
      const body = {
        id: inventoryId,
        warehouse: values.warehouse,
      };

      const result = await editInventory(body);

      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.createStockEntriesError')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.createStockEntriesSuccess')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Button type="primary" danger ghost className="!border-lime-700 !text-lime-700" size="small" onClick={showModal}>
        {t('table.chooseWarehouse')}
      </Button>
      <Modal title={t('detailFunction.Stock-entry')} open={isModalOpen} footer={null} onCancel={handleCancel}>
        <div>
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={onFinish} form={form}>
            <Form.Item name="warehouse" label={t('nav.warehouse')}>
              <Select placeholder={t('table.warehouseList')} allowClear>
                {warehouseList?.results?.map((item: { id: number; name: string }) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button type="primary" htmlType="submit" className=" mb-2" loading={isLoadingEdit }>
                {t('general.confirm')}
              </Button>

              <Button onClick={handleCancel}>{t("general.cancel")}</Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default UpdateWarehouse;
