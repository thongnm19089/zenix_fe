import { useCreateStockEntriesMutation, useGetWarehouseListQuery } from "@/api/Inventory/apiInventory";
import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, notification } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useWindowSize } from "@/utils/responsiveSm";

const { Option } = Select;

const CreateStockEntry = ({
  productId,
  skuId,
}: {
  productId: number;
  skuId?: number | null;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [createStockEntries, { isLoading: isLoadingCreate }] = useCreateStockEntriesMutation();
  const t: any = useTranslations();
  const [width] = useWindowSize();

  const {
    data: warehouseList,
    isLoading,
    isError,
    refetch
  } = useGetWarehouseListQuery();

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    try {
      const body = {
        product: productId,
        sku: skuId,
        warehouse: values.warehouse,
        quantity: values.quantity,
        cost_per_item: values.cost_per_item || 0,
        date_received: dayjs(values.date_received).format("YYYY-MM-DD"),
        origin: values.origin,
        cert_no: values.cert_no,
        note: values.note,
      };
      const result = await createStockEntries(body);

      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.createStockEntriesError')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        refetch();
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
      <Button 
       type={width < 640 ? "text" : "primary"}
       className={` ${width < 640 ? "" : "bg-teal-600 hover:!bg-teal-500"}`}
       onClick={showModal} 
       size="small">
        {t('detailFunction.Stock-entry')}
      </Button>
      <Modal title={t('detailFunction.Stock-entry')} open={isModalOpen} footer={null} onCancel={handleCancel}>
        <div>
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={onFinish} form={form}>
            <Form.Item name="quantity" label={t('general.quantity')} className="my-4" rules={[{ required: true }]}>
              <InputNumber className="w-full" />
            </Form.Item>
            <Form.Item name="cost_per_item" label={t('admin.cost_per_item')} className="my-4 ">
              <InputNumber className="w-full" />
            </Form.Item>
            <Form.Item name="origin" label={t('table.source')}>
              <Input />
            </Form.Item>
            <Form.Item label={t('table.addDate')} name="date_received">
              <DatePicker className="w-full" defaultValue={dayjs()} />
            </Form.Item>
            <Form.Item name="warehouse" label={t('nav.warehouse')} rules={[{ required: true }]}>
              <Select placeholder={t('table.warehouseList')} allowClear>
                {warehouseList?.results?.map((item: { id: number; name: string }) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="cert_no" label={t('table.digitalCertificate')}>
              <Input />
            </Form.Item>
            <Form.Item name="note" label={t('general.note')}>
              <Input.TextArea />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button type="primary" htmlType="submit" className=" mb-2" loading={ isLoadingCreate}>
                {t('general.confirm')}
              </Button>

              <Button onClick={handleCancel}>{t('general.cancel')}</Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default CreateStockEntry;
