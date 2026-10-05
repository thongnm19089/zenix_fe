import { useCreateActivityEmojiMutation, useDeleteActivityEmojiMutation } from "@/api/Task/apiTask";
import { Popconfirm, notification } from "antd";
import EmojiPicker from "emoji-picker-react";
import React, { useState } from "react";
import { PiSmileyStickerLight } from "react-icons/pi";

function Emoji({ id }: { id: number }) {
  const [isOpen, setIsOpen] = useState(false);

  const [createActivityEmoji, { isLoading: isLoadingAdd }] = useCreateActivityEmojiMutation();
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsOpen(newOpen);
    }
  };

  const onChangeEmoji = async (value: string) => {
    const body = {
      activity: id,
      emoji_code: value,
    };
    try {
      await createActivityEmoji(body);
      setIsOpen(false);
    } catch (error) {
      notification.error({
        message: "Lỗi ko tạo/cập nhật được hoạt dộng",
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <Popconfirm
      title=""
      placement="bottom"
      description={
        <div className=" w-[300px]">
          <EmojiPicker
            onEmojiClick={(value) => onChangeEmoji(value.emoji)}
            width={300}
            searchDisabled
            skinTonesDisabled
          />
        </div>
      }
      showCancel={false}
      icon={null}
      okText="Lưu thay đổi"
      okButtonProps={{ style: { display: "none" } }}
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <PiSmileyStickerLight size={20} className="cursor-pointer" onClick={() => setIsOpen(true)} />
    </Popconfirm>
  );
}

export default Emoji;
