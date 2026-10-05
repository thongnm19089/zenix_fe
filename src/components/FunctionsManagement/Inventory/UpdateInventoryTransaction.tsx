import { useEditInventoryTransactionMutation } from "@/api/Inventory/apiInventory";
import { Button, Form, InputNumber, Modal, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useWindowSize } from "@/utils/responsiveSm";

const UpdateInventoryTransaction = ({
  id,
  quantity,
  refetch
}: {
  id?: number | null | undefined;
  quantity: any;
  refetch: () => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editInventoryTransaction, { isLoading: isLoadingEdit }] = useEditInventoryTransactionMutation();
  const t: any = useTranslations();
  const [width] = useWindowSize();
  

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (quantity) {
      form.setFieldsValue({ quantity: quantity });
    }
  }, [quantity]);

  const onEdit = async (values: any) => {
    try {
      const body = {
        id: id,
        quantity: values.quantity,
      };
      const result = await editInventoryTransaction(body);

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
      <Button type={width < 640 ? "text" : "primary"}
       className={` ${width < 640 ? "" : "bg-teal-600 hover:!bg-teal-500"}`}
      onClick={showModal} 
      size="small">
        {t('general.edit')}
      </Button>
      <Modal title={t('detailFunction.Inventory Transaction')} open={isModalOpen} footer={null} onCancel={handleCancel}>
        <div>
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={onEdit} form={form}>
            <Form.Item name="quantity" label={t('general.quantity')} className="my-4">
              <InputNumber className="w-full" />
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

export default UpdateInventoryTransaction;
