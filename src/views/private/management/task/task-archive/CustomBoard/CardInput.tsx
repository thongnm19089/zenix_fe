import { Button, Input } from "antd";
import React, { useState } from "react";
import { FiX } from "react-icons/fi";

interface CardInputProps {
  text: string;
  onSubmit: (value: string) => void;
  displayClass?: string;
  editClass?: string;
  placeholder?: string;
  defaultValue?: string;
  buttonText?: string;
}
function CardInput(props: CardInputProps) {
  const { text, onSubmit, displayClass, editClass, placeholder, defaultValue, buttonText } = props;
  const [isCardInput, setIsCardInput] = useState(false);
  const [inputText, setInputText] = useState(defaultValue || "");

  const submission = (e: any) => {
    e.preventDefault();
    if (inputText && onSubmit) {
      setInputText("");
      onSubmit(inputText);
    }
    setIsCardInput(false);
  };

  return (
    <div className={`w-full ${isCardInput && "shadow-lg"}`}>
      {isCardInput ? (
        <form className={` p-3 ${editClass ? editClass : ""}`} onSubmit={submission}>
          <Input
            type="text"
            value={inputText}
            placeholder={placeholder || text}
            onChange={(event) => setInputText(event.target.value)}
            autoFocus
          />
          <div className="flex items-center mt-3 gap-2">
            <Button type="primary" htmlType="submit">
              {buttonText || "Add"}
            </Button>
            <FiX onClick={() => setIsCardInput(false)} size={24} />
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
