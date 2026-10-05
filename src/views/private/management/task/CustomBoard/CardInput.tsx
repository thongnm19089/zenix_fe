import { Button, Input, DatePicker, message } from "antd";
import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import dayjs from "dayjs";

interface CardInputProps {
  text: string;
  onSubmit: (value: string, startDate?: string, deadline?: string) => void;
  displayClass?: string;
  editClass?: string;
  placeholder?: string;
  defaultValue?: string;
  startDate?: dayjs.Dayjs;
  deadline?: dayjs.Dayjs;
  buttonText?: string;
  showDeadlineButton?: boolean;
}

function CardInput(props: CardInputProps) {
  const {
    text, onSubmit, displayClass, editClass,
    placeholder, defaultValue, buttonText,
    showDeadlineButton = false,
  } = props;

  const [isCardInput, setIsCardInput] = useState(false);
  const [inputText, setInputText] = useState(defaultValue || "");
  const [showDate, setShowDate] = useState(showDeadlineButton);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | undefined>(props.startDate);
  const [deadline, setDeadline] = useState<dayjs.Dayjs | undefined>(props.deadline);

  // --- VALIDATION LOGIC FOR UI ---
  const disabledStartDate = (current: dayjs.Dayjs) => {
    // Cannot select days after the chosen deadline
    if (!current || !deadline) return false;
    return current.isAfter(deadline, 'day');
  };

  const disabledDeadline = (current: dayjs.Dayjs) => {
    // Cannot select days before the chosen start date
    if (!current || !startDate) return false;
    return current.isBefore(startDate, 'day');
  };

  const submission = (e: any) => {
    e.preventDefault();

    // --- STRICT TIME VALIDATION ON SUBMIT ---
    if (startDate && deadline && startDate.isAfter(deadline)) {
      message.error("Ngày bắt đầu không được sau deadline!"); 
      return; // Stop the submission
    }

    if (inputText && onSubmit) {
      onSubmit(inputText, startDate?.toISOString(), deadline?.toISOString());
      setInputText("");
    }
    setIsCardInput(false);
  };

  useEffect(() => {
      setShowDate(showDeadlineButton);
      setStartDate(props.startDate);
      setDeadline(props.deadline);
  }, [props.startDate, props.deadline, showDeadlineButton])

  return (
    <div className={`w-full ${isCardInput && "shadow-lg"}`}>
      {isCardInput ? (
        <form className={`p-3 ${editClass ? editClass : ""}`} onSubmit={submission}>
          <Input
            type="text"
            value={inputText}
            placeholder={placeholder || text}
            onChange={(event) => setInputText(event.target.value)}
            autoFocus
          />

          {showDate && (
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn ngày bắt đầu" // Fixed placeholder
              value={startDate}
              disabledDate={disabledStartDate} // Added UI validation
              //@ts-ignore
              onChange={(val) => setStartDate(val)}
              className="mt-2 w-full"
            />
          )}

          {showDate && (
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn deadline"
              value={deadline}
              disabledDate={disabledDeadline} // Added UI validation
              //@ts-ignore
              onChange={(val) => setDeadline(val)}
              className="mt-2 w-full"
            />
          )}


          <div className="flex items-center mt-3 gap-2">
            <Button type="primary" htmlType="submit">
              {buttonText || "Add"}
            </Button>

            {showDate && (
              <Button
                type={showDate ? "default" : "text"}
                onClick={() => setShowDate(!showDate)}
                style={{
                  color: "#dc2626",
                  borderColor: showDate ? "#dc2626" : "transparent",
                  fontWeight: 500,
                }}
              >
                Deadline
              </Button>
            )}

            <FiX
              onClick={() => {
                setIsCardInput(false);
              }}
              size={24}
              className="cursor-pointer" // Added cursor pointer for better UX
            />
          </div>
        </form>
      ) : (
        <Button className={`${displayClass ? displayClass : ""}`} onClick={() => setIsCardInput(true)}>
          {text}
        </Button>
      )}
    </div>
  );
}

export default CardInput;
