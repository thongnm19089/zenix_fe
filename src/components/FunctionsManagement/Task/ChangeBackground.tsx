import { useEditBoardMutation } from "@/api/Task/apiTask";
import UploadImage from "@/components/Upload/UploadImage";
import { gradientColors, colors, bgImage } from "@/constants/bgColor";
import { IBoard } from "@/types/taskTypes";
import { Button, Popover, Tabs, notification } from "antd";
import { TabsProps } from "antd/lib";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { BiImageAdd } from "react-icons/bi";

interface bgBoardProps {
  bg_color: null | string;
  bg_color_type: null | number;
  bg_image: any;
}

function ChangeBackground({ board }: { board: IBoard }) {
  const [bgBoard, setBgBoard] = useState<bgBoardProps>({ bg_color: null, bg_color_type: null, bg_image: null });
  const [imageFile, setImageFile] = useState<any>(null);
  const [editBoard, { isLoading: isLoadingEdit }] = useEditBoardMutation();
  const t: any = useTranslations();

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Màu sắc",
      children: (
        <>
          <div className="mb-3 text-sm font-semibold">Đa sắc</div>
          <div className="grid grid-cols-3 gap-2">
            {gradientColors?.map((item, index) => (
              <div
                key={`key-gradient-colors-${index}`}
                className={`w-full h-20 rounded-md cursor-pointer flex items-center justify-center hover:opacity-75  ${item}`}
                onClick={() => onChangeBackground({ bg_color: item, bg_color_type: 1, bg_image: null })}
              >
                {bgBoard?.bg_color === item && <AiOutlineCheck size={20} className="text-white" />}
              </div>
            ))}
          </div>
          <div className="my-3 text-sm font-semibold">Đơn sắc</div>
          <div className="grid grid-cols-6 gap-2">
            {colors?.map((item, index) => (
              <div
                key={`key-checker-${index}`}
                className={`w-full h-[49px] rounded-md cursor-pointer flex items-center justify-center hover:opacity-75 ${item}`}
                onClick={() => onChangeBackground({ bg_color: item, bg_color_type: 1, bg_image: null })}
              >
                {bgBoard?.bg_color === item && <AiOutlineCheck size={20} className="text-white" />}
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      key: "2",
      label: "Ảnh nền",
      children: (
        <>
          <div className="mb-3 text-sm font-semibold">Hình nền của bạn</div>
          <UploadImage
            setImageFile={setImageFile}
            size={1}
            imageList={
              board?.bg_image ? [{ id: Math.random().toString(36).substring(2, 10), image: board?.bg_image }] : null
            }
          />
          <div className="mb-3 mt-1 text-sm font-semibold">Hình nền có sẵn</div>
          <div className="grid grid-cols-3 gap-2">
            {bgImage?.map((item, index) => (
              <div
                key={`key-bg-image-${index}`}
                className="w-full h-20 rounded-md cursor-pointer flex items-center justify-center hover:opacity-75"
                onClick={() => onChangeBackground({ bg_color: item, bg_color_type: 2, bg_image: null })}
                style={{ backgroundImage: `url(${item})`, backgroundSize: "cover", backgroundPosition: "center" }}
              >
                {bgBoard?.bg_color === item && <AiOutlineCheck size={20} className="text-white" />}
              </div>
            ))}
          </div>
        </>
      ),
    },
  ];

  const onChangeBackground = async (values: any) => {
    setBgBoard(values);
    try {
      const result = await editBoard({ boardId: board.id, body: values });
      if (result && "error" in result) {
        notification.error({
          message: `Lỗi xảy ra`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      try {
        const formData = new FormData();
        formData.append("bg_color", "");
        formData.append("bg_color_type", (3).toString());

        if (imageFile && imageFile.length) {
          imageFile.forEach((file: any) => {
            formData.append(`bg_image`, file.originFileObj);
          });
        }
        const result = editBoard({ boardId: board.id, body: formData });
        setBgBoard({ bg_color: null, bg_color_type: 3, bg_image: board?.bg_image });
      } catch (error) {}
    }
  }, [imageFile]);

  return (
    <Popover
      content={
        <div className="p-2 w-[350px] h-[600px]">
          <Tabs defaultActiveKey="1" items={items} />
        </div>
      }
      title={<div className="text-center">{t("general.changeBackground")}</div>}
      trigger="click"
    >
      <Button ghost className="max-sm:hidden">
        <div className="flex items-center gap-2">
          <BiImageAdd size={20} /> <span className="font-semibold ">{t("general.changeBackground")}</span>
        </div>
      </Button>
      <Button type="text" className="sm:hidden px-2">
        <BiImageAdd size={22} className="text-white" />
      </Button>
    </Popover>
  );
}

export default ChangeBackground;
