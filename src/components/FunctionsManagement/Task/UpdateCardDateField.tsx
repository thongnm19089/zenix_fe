import { useEditCardMutation } from "@/api/Task/apiTask";
import { ICard } from "@/types/taskTypes";
import { DatePicker, Form, Popconfirm, TimePicker, notification } from "antd";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { AiOutlineFieldTime } from "react-icons/ai";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

type CardDateField = "start_date" | "deadline";

interface UpdateCardDateFieldProps {
  card: ICard;
  field: CardDateField;
  buttonLabelKey: string;
  titleKey: string;
  errorMessageKey: string;
  refreshCardAndBoard: () => void;
}

const UpdateCardDateField: React.FC<UpdateCardDateFieldProps> = ({
  card,
  field,
  buttonLabelKey,
  titleKey,
  errorMessageKey,
  refreshCardAndBoard,
}) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [editCard, { isLoading: isUpdating }] = useEditCardMutation();
  const [isPopConfirmOpen, setPopConfirmOpen] = useState(false);

  const selectedDateValue = card?.[field] || null;

  useEffect(() => {
    const selectedDate = selectedDateValue ? dayjs(selectedDateValue) : null;
    form.setFieldsValue({
      date: selectedDate,
      time: selectedDate,
    });
  }, [form, selectedDateValue]);

  const onFinish = async () => {
    if (isUpdating) return;

    const values = form.getFieldsValue();
    const body = {
      id: card.id,
      [field]:
        (dayjs(values.date).isValid()
          ? dayjs(values.date).format("YYYY-MM-DD")
          : dayjs(new Date()).format("YYYY-MM-DD")) +
        "T" +
        (dayjs(values.time).isValid() ? dayjs(values.time).format("HH:mm:ss") : "00:00:00"),
    };

    try {
      await editCard(body).unwrap();
      setPopConfirmOpen(false);
      refreshCardAndBoard();
    } catch (error) {
      notification.error({
        message: t(errorMessageKey),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const popContent = (
    <div className="w-[300px]">
      <div className="text-center mb-2">{t(titleKey)}</div>
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="date" noStyle>
          <DatePicker className="mr-3" />
        </Form.Item>
        <Form.Item name="time" noStyle>
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
      disabled={card.archived}
      okButtonProps={{ loading: isUpdating }}
    >
      <div
        className={`flex items-center gap-2 py-1 px-2 border w-full mt-2 ${
          card.archived ? "opacity-50" : "cursor-pointer hover:bg-neutral-200"
        }`}
        onClick={(e) => (card.archived || isUpdating ? e.preventDefault() : setPopConfirmOpen(true))}
      >
        <AiOutlineFieldTime size={16} /> <span>{t(buttonLabelKey)}</span>
      </div>
    </Popconfirm>
  );
};

export default UpdateCardDateField;
