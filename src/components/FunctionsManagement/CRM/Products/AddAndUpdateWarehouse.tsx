import { useCreateWarehouseMutation, useEditWarehouseMutation, useGetWarehouseQuery } from "@/api/Inventory/apiInventory";
import { useGetSetupQuery } from "@/api/SetUp/apiSetup";
import { Button, Form, Input, InputNumber, Modal, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

const { Option } = Select;

interface categoryDataProps {
  id: number;
  category_name: string;
}

const AddAndUpdateWarehouse = ({
  edit,
  warehouseId,
}: {
  edit?: boolean;
  warehouseId?: number;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: setupList } = useGetSetupQuery(undefined, {
    skip: isModalOpen ? false : true,
  });
  const { data: warehouseData } = useGetWarehouseQuery({ warehouseId: warehouseId } || undefined, {
    skip: warehouseId && isModalOpen ? false : true,
  });
  const [createWarehouse, { isLoading: isLoadingAdd }] = useCreateWarehouseMutation();
  const [editWarehouse, { isLoading: isLoadingEdit }] = useEditWarehouseMutation();
  const [form] = Form.useForm();

  const t: any = useTranslations();
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (value: any) => {
    try {
      const result = await createWarehouse(value);

      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.haveThisInventory')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.addWarehouseSuccess')}`,
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
      name: warehouseData?.name,
      location: warehouseData?.location,
      address: warehouseData?.address,
      capacity: warehouseData?.capacity,
      contact: warehouseData?.contact,
      keeper: warehouseData?.keeper,
      operating_hours: warehouseData?.operating_hours,
      special_requirements: warehouseData?.special_requirements,
    });
  }, [isModalOpen, warehouseData]);

  const onEdit = async (values: any) => {
    const body = {
      id: warehouseId,
      name: values.name,
      location: values.location,
      address: values.address,
      capacity: values.capacity,
      contact: values.contact,
      keeper: values.keeper,
      operating_hours: values.operating_hours,
      special_requirements: values.special_requirements,
    };
    try {
      await editWarehouse(body);
      setIsModalOpen(false);
      notification.success({
        message: `${t('noficationAddAndUpdate.repairedWarehouseSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationAddAndUpdate.haveThisInventory')}`,
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
        {edit ? `${t('general.edit')}` : `${t('noficationAddAndUpdate.addWarehouse')}`}
      </Button>
      <Modal title={`${edit ? `${t('general.edit')}` : `${t('admin.more')}`} ${t('nav.warehouse')}`} open={isModalOpen} footer={null} onCancel={handleCancel}>
        <div>
          <Form
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            initialValues={{ remember: false }}
            onFinish={edit ? onEdit : onFinish}
            form={form}
          >
            <Form.Item
              name="name"
              label={t('nav.warehouseName')}
              rules={[{ required: true, message: `${t('noficationAddAndUpdate.pleaseWarehouseName')}` }]}
              className="my-4"
            >
              <Input />
            </Form.Item>
            <Form.Item name="location" label={t('table.location')} rules={[{ required: true }]}>
              <Select placeholder={t('noficationAddAndUpdate.listLocation')} allowClear>
                {setupList?.location_list?.map((item: { id: number; city: string }) => (
                  <Option key={item.id} value={item.id}>
                    {item.city}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="address"
              label={t('admin.detailedAddress')}
              className="my-4"
            >
              <Input />
            </Form.Item>
            <Form.Item name="keeper" label={t('admin.administrator')} className="my-4">
              <Input />
            </Form.Item>
            <Form.Item name="contact" label={t('nav.contact')} className="my-4">
              <Input />
            </Form.Item>
            <Form.Item name="capacity" label={t('admin.capacity')} className="my-4">
              <InputNumber />
            </Form.Item>
            <Form.Item name="operating_hours" label={t('admin.hoursOfOperation')} className="my-4">
              <Input />
            </Form.Item>
            <Form.Item name="special_requirements" label={t('general.note')} className="my-4">
              <Input.TextArea />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button type="primary" htmlType="submit" className=" mb-2" loading={edit ? isLoadingAdd : isLoadingEdit}>
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

export default AddAndUpdateWarehouse;
