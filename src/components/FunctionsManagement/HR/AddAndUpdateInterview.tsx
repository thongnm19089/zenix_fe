import {
  useCreateApplicationInterviewScheduleMutation,
  useEditApplicationInterviewScheduleMutation,
} from "@/api/HR/apiHRApp";

import { Button, Form, notification, DatePicker, TimePicker, Modal } from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { FiEdit } from "react-icons/fi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

interface AddAndUpdateInterviewProps {
  interview: boolean;
  applicationId: number;
}

const AddAndUpdateInterview: React.FC<{
  id?: number | null | undefined;
  edit?: boolean | undefined;
  data?: any;
}> = ({
  id,
  edit,
  data,
}) => {
    const t: any = useTranslations();
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [createApplicationInterviewSchedule, { isLoading: isLoadingAdd }] = useCreateApplicationInterviewScheduleMutation();
    const [editApplicationInterviewSchedule, { isLoading: isLoadingEdit }] = useEditApplicationInterviewScheduleMutation();

    const showModal = () => {
      setIsModalOpen(true);
    };

    const handleCancel = () => {
      setIsModalOpen(false);
    };

    const getInterviewColorClass = (start_time: string) => {
      let colorClass = '';
      const today = dayjs();
      const dueDay = dayjs(start_time);

      if (dueDay.isBefore(today, 'minute')) {
        colorClass = 'bg-red-600 text-white'; // Quá hạn
      } else if (dueDay.isSame(today, 'minute')) {
        colorClass = 'bg-yellow-600 text-white'; // Trong ngày hôm nay
      } else {
        colorClass = 'bg-green-600 text-white'; // Chưa đến hạn
      }

      return colorClass;
    };

    const onFinish = async (values: any) => {
      const body = {
        application: id,
        start_time:
          (dayjs(values.date).isValid()
            ? dayjs(values.date).format("YYYY-MM-DD")
            : dayjs(new Date()).format("YYYY-MM-DD")) +
          "T" +
          (dayjs(values.time).isValid() ? dayjs(values.time).format("HH:mm:ss") : "00:00:00"),
      };

      try {
        form.resetFields();
        const result = await createApplicationInterviewSchedule(body);
        console.log(result);
        if (result && "error" in result) {
          notification.error({
            message: `Thêm thất bại`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `Thêm thành công`,
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
      if (data) {
        form.setFieldsValue({
          id: data.id,
          date: dayjs(data?.start_time).isValid() ? dayjs(data?.start_time) : null,
          time: dayjs(data?.start_time).isValid() ? dayjs(data?.start_time) : null,
        });
      }
    }, [isModalOpen, data]);

    const onEdit = async (values: any) => {
      const body = {
        id: data?.id,
        detail: null,
        start_time: (dayjs(values.date).isValid()
          ? dayjs(values.date).format("YYYY-MM-DD")
          : dayjs(new Date()).format("YYYY-MM-DDTHH:mm:ss")) +
          "T" +
          (dayjs(values.time).isValid() ? dayjs(values.time).format("HH:mm:ss") : "00:00:00"),
      };

      try {
        await editApplicationInterviewSchedule(body);
        setIsModalOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.editInfo')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } catch (error) {
        notification.error({
          message: `${t('noficationAddAndUpdate.editInfoError')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    };

    return (
      <>
        {data ? (
          // Show data details if data is available
          <div className="flex gap-2">
            <div className={`flex text-sm text-center px-2 py-2 rounded-br-full cursor-pointer ${getInterviewColorClass(data?.start_time)}`} onClick={showModal}>
              <div>{data?.start_time && dayjs(data?.start_time).format("HH:mm")}</div> -
              <div>{data?.start_time && dayjs(data?.start_time).format("DD/MM/YYYY")} </div>
            </div>
          </div>
        ) : (
          <Button
            type="primary"
            className="w-24"
            onClick={showModal}
            block={true}
            size="small"
          >
            Phỏng vấn
          </Button>
        )
        }

        <Modal
          title={`${edit ? t("general.edit") : t("general.createNew")}`}
          open={isModalOpen}
          footer={null}
          onCancel={handleCancel}
          centered
          width={400}
          bodyStyle={{ padding: '10px 20px' }}
        >
          <Form form={form} layout="vertical" onFinish={edit ? onEdit : onFinish} >
            <Form.Item name="date" noStyle initialValue={data?.start_time && dayjs(data?.start_time)}>
              <DatePicker className="mr-3" />
            </Form.Item>
            <Form.Item name="time" noStyle initialValue={data?.start_time && dayjs(data?.start_time)}>
              <TimePicker format="HH:mm" />
            </Form.Item>

            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="primary"
                htmlType="submit"
                className="mb-2"
                loading={edit ? isLoadingEdit : isLoadingAdd}
              >
                {t("general.confirm")}
              </Button>
              <Button onClick={handleCancel}>{t("general.cancel")}</Button>
            </div>
          </Form>
        </Modal>
      </>
    );
  };

export default AddAndUpdateInterview;
