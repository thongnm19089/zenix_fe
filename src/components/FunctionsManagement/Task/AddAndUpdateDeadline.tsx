import { useEditCardMutation } from "@/api/Task/apiTask";
import { Button, Form, Modal, TimePicker, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { IBoard, ICard } from "@/types/taskTypes";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // for UTC time
import timezone from 'dayjs/plugin/timezone'; // for timezones
import advancedFormat from 'dayjs/plugin/advancedFormat'; // for advanced formatting
import { DatePicker } from 'antd';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

interface AddAndUpdateDeadlineProps {
  isOpen: boolean;
  closeModal: () => void;
  board: IBoard;
  card: ICard;

  listId: number;
  patchCard: (listId: number, cardId: number, patch: Partial<ICard>) => void;
}

const AddAndUpdateDate: React.FC<AddAndUpdateDeadlineProps> = ({
  isOpen,
  closeModal,
  board,
  card,
  listId,
  patchCard,
}) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [editCard, { isLoading: isLoadingEdit }] = useEditCardMutation();
  const [deadline, setDeadline] = useState<dayjs.Dayjs | null>(null);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    const reformattedDeadline = card?.deadline ? dayjs(card.deadline) : null;
    const reformattedStartdate = card?.start_date ? dayjs(card.start_date) : null;
    setDeadline(reformattedDeadline);
    setStartDate(reformattedStartdate);

    // sync form values
    form.setFieldsValue({
      start_date: reformattedStartdate,
      start_time: reformattedStartdate,
      deadline_date: reformattedDeadline,
      deadline_time: reformattedDeadline,
    });
  }, [isOpen, card, form]);

  const formatDateTimeForm = (key_date: string, key_time: string, key_card_date: 'start_date' | 'deadline') => {
    const values = form.getFieldsValue();

    const datePart = dayjs(values[key_date]).isValid()
      ? dayjs(values[key_date]).format("YYYY-MM-DD")
      : dayjs(new Date()).format("YYYY-MM-DD");

    const timePart = dayjs(values[key_time]).isValid()
      ? dayjs(values[key_time]).format("HH:mm:ss")
      : "00:00:00";

    const newDateTime = `${datePart}T${timePart}`;
    const oldDateTime = card[key_card_date];

    return [oldDateTime, newDateTime]
  }

  const onFinish = () => {
    const [oldStartDate, newStartDate] = formatDateTimeForm('start_date', 'start_time', 'start_date')
    const [oldDeadline, newDeadline] = formatDateTimeForm('deadline_date', 'deadline_time', 'deadline')

    // ✅ 1) UI fake trước + đóng modal ngay
    patchCard(listId, card.id, {
      start_date: newStartDate,
      deadline: newDeadline
    },
    );
    closeModal();

    // ✅ 2) API gọi sau
    editCard({
      id: card.id,
      start_date: newStartDate,
      deadline: newDeadline
    })
      .unwrap()
      .then(() => {
        notification.success({
          message: "Sửa thời hạn thành công",
          placement: "bottomRight",
          className: "h-16",
        });
      })
      .catch(() => {
        // ✅ 3) rollback nếu lỗi
        patchCard(listId, card.id, {
          start_date: oldStartDate,
          deadline: oldDeadline
        });

        notification.error({
          message: `Sửa thời hạn thất bại`,
          placement: "bottomRight",
          className: "h-16",
        });
      });
  };

  return (
    <>
      <Modal
        title={t('noficationAddAndUpdate.addEditDate')}
        open={isOpen}
        footer={null}
        onCancel={closeModal}
        centered // centers the modal vertically
        width={400} // set a fixed width for the modal
        bodyStyle={{ padding: '10px 20px' }} // minimal padding around the form
      >
        <Form form={form} onFinish={onFinish}>
          <label>{t('table.startDate')}</label>
          <div>
            <Form.Item name="start_date" noStyle initialValue={startDate && dayjs(startDate)}>
              <DatePicker className="mr-3" />
            </Form.Item>
            <Form.Item name="start_time" noStyle initialValue={startDate && dayjs(startDate)}>
              <TimePicker format="HH:mm" />
            </Form.Item>
          </div>
          <br></br>
          <label>{t('table.deadline')}</label>
          <div>
            <Form.Item name="deadline_date" noStyle initialValue={deadline && dayjs(deadline)}>
              <DatePicker className="mr-3" />
            </Form.Item>
            <Form.Item name="deadline_time" noStyle initialValue={deadline && dayjs(deadline)}>
              <TimePicker format="HH:mm" />
            </Form.Item>
          </div>

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

export default AddAndUpdateDate;
