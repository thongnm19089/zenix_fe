import { useCreateLocationMutation, useEditLocationMutation, useGetLocationQuery } from "@/api/SetUp/apiLocation";
import { Button, Form, Input, Modal, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

const AddAndUpdateLocation = ({
  edit,
  title,
  titleLabel,
  locationId,
}: {
  edit?: boolean;
  title: string;
  titleLabel: string;
  locationId?: number | null | undefined;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLocation, { isLoading: isLoadingAdd }] = useCreateLocationMutation();
  const [editLocation, { isLoading: isLoadingEdit }] = useEditLocationMutation();
  const [form] = Form.useForm();
  const t: any = useTranslations();

  const { data: location } = useGetLocationQuery({ locationId: locationId } || undefined, {
    skip: locationId && isModalOpen ? false : true,
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    form.setFieldsValue({ city: location?.city });
  }, [isModalOpen, location]);

  const onFinish = async (values: any) => {
    try {
      const result = await createLocation(values);

      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.createLocation')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.createLocationSuccess')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  const onEdit = async (values: any) => {
    const body = {
      id: locationId,
      city: values.city,
    };
    try {
      await editLocation(body);
      setIsModalOpen(false);
      notification.success({
        message: `${t('noficationAddAndUpdate.editLocationSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationAddAndUpdate.editLocationError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal} size="small">
        {edit ? t("general.edit") : t("general.createNew")}
      </Button>
      <Modal
        title={`${edit ? t("general.edit") : t("general.createNew")} ${title}`}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <div>
          <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} onFinish={edit ? onEdit : onFinish} form={form}>
            <Form.Item name="city" label={titleLabel} className="my-4">
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

export default AddAndUpdateLocation;
