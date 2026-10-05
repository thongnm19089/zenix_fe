import { useEditCardMutation } from "@/api/Task/apiTask";
import { Button, Form, Input, Select, notification, Popconfirm, DatePicker, Space, TimePicker, DatePickerProps } from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { IBoard, ICard } from "@/types/taskTypes";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { AiOutlineFieldTime } from "react-icons/ai";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

interface UpdateCardDeadlineProps {
  board: IBoard;
  card: ICard;
  refreshCardAndBoard: () => void;
}

const UpdateCardDeadline: React.FC<UpdateCardDeadlineProps> = ({ board, card, refreshCardAndBoard }) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [editCard, { isLoading: isLoadingEdit }] = useEditCardMutation();
  const [deadline, setDeadline] = useState<dayjs.Dayjs | null>(null);
  const [isPopConfirmOpen, setPopConfirmOpen] = useState(false);

  useEffect(() => {
    const reformattedDeadline = card?.deadline ? dayjs(card?.deadline) : null;
    setDeadline(reformattedDeadline);
  }, [card]);

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
      setPopConfirmOpen(false);
      refreshCardAndBoard();
    } catch (error) {
      notification.error({
        message: t("error_adding_deadline"),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const popContent = (
    <div className=" w-[300px]">
      <div className="text-center mb-2">{t('table.deadline')}</div>
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="date" noStyle initialValue={deadline && dayjs(deadline)}>
          <DatePicker className="mr-3" />
        </Form.Item>
        <Form.Item name="time" noStyle initialValue={deadline && dayjs(deadline)}>
          <TimePicker format="HH:mm" />
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <Popconfirm
      title={popContent}
      open={isPopConfirmOpen}
      onOpenChange={setPopConfirmOpen}
      onConfirm={onFinish}
      onCancel={() => setPopConfirmOpen(false)}
      okText={t("general.confirm")}
      cancelText={t("general.cancel")}
      placement="bottom"
    >
      <div className="flex items-center gap-2 py-1 px-2 border w-full mt-2 cursor-pointer hover:bg-neutral-200"
        onClick={() => setPopConfirmOpen(true)}>
        <AiOutlineFieldTime size={16} /> <span>{t('task.date')}</span>{" "}
      </div>
    </Popconfirm>
  );
};

export default UpdateCardDeadline;
