import { useEditCardMutation } from "@/api/Task/apiTask";
import { Button, Form, Input, Modal, Select, TimePicker, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { IBoard, ICard } from "@/types/taskTypes";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // for UTC time
import timezone from 'dayjs/plugin/timezone'; // for timezones
import advancedFormat from 'dayjs/plugin/advancedFormat'; // for advanced formatting
import { DatePicker, Space } from 'antd';
import type { DatePickerProps } from 'antd/es/date-picker';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

interface AddAndUpdateDeadlineProps {
  isOpen: boolean;
  closeModal: () => void;
  board: IBoard;
  card: ICard;
  refreshCardAndBoard: () => void;
}

const AddAndUpdateDeadline: React.FC<AddAndUpdateDeadlineProps> = ({
  isOpen,
  closeModal,
  board,
  card,
  refreshCardAndBoard,
}) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [editCard, { isLoading: isLoadingEdit }] = useEditCardMutation();
  const [deadline, setDeadline] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    const reformattedDeadline = card?.deadline ? dayjs(card?.deadline) : null;
    setDeadline(reformattedDeadline);
  }, [isOpen, card]);

  const onFinish = async () => {
    const values = form.getFieldsValue();
    const body = {
      id: card.id,
      deadline:
        (dayjs(values.date).isValid()
          ? dayjs(values.date).format("YYYY-MM-DD")
          : dayjs(new Date()).format("YYYY-MM-DD")) +
        "T" +
        (dayjs(values.time).isValid() ? dayjs(values.time).format("HH:mm:ss") : "00:00:00"),
    };
    try {
      await editCard(body);
      refreshCardAndBoard();
      notification.success({
        message: "Sửa thời hạn thành công",
        placement: "bottomRight",
        className: "h-16",
      });
      closeModal();
    } catch (error) {
      notification.error({
        message: `${t('task.error_adding_deadline')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Modal
        title={t('noficationAddAndUpdate.addEditDeadline')}
        open={isOpen}
        footer={null}
        onCancel={closeModal}
        centered // centers the modal vertically
        width={400} // set a fixed width for the modal
        bodyStyle={{ padding: '10px 20px' }} // minimal padding around the form
      >
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="date" noStyle initialValue={deadline && dayjs(deadline)}>
            <DatePicker className="mr-3" />
          </Form.Item>
          <Form.Item name="time" noStyle initialValue={deadline && dayjs(deadline)}>
            <TimePicker format="HH:mm" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-2"> {/* reduced the top margin */}
            <Button
              type="primary"
              htmlType="submit"
              className="mb-2"
              loading={isLoadingEdit}
            >
              {t("general.confirm")}
            </Button>
            <Button onClick={closeModal}>{t("general.cancel")}</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AddAndUpdateDeadline;
