import { useEditCardMutation } from "@/api/Task/apiTask";
import { IBoard, ICard } from "@/types/taskTypes";
import { shortenName } from "@/utils/common";
import { Avatar, Button, Checkbox, Form, Popconfirm, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { BiUserPlus } from "react-icons/bi";

function UpdateUserTask({
  card,
  board,
  refreshCardAndBoard,
}: {
  card: ICard;
  board: IBoard;
  refreshCardAndBoard: () => void;
}) {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [editCard, { isLoading: isLoadingEdit }] = useEditCardMutation();

  useEffect(() => {
    form.setFieldsValue({
      user_ids: card?.users?.map((user: any) => user.id) || [], // This will set an array of user ids based on the card's users
    });
  }, [card]);

  const onFinish = async (values: any) => {
    const body = {
      user_ids: values.user_ids || [],
    };

    try {
      await editCard({
        ...body,
        id: card.id,
      }).unwrap();
      await refreshCardAndBoard();
    } catch (error) {
      notification.error({
        message: t("error_editing_card_users"),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <Popconfirm
      placement="bottom"
      title={<div className="text-center">{t('nav.teamMembers')}</div>}
      description={
        <div className=" w-[300px]">
          <Form form={form} onFinish={onFinish}>
            <Form.Item name="user_ids" noStyle>
              <Checkbox.Group>
                {board?.users?.map((user, index) => (
                  <div className="flex flex-1 flex-col justify-center hover:bg-slate-200 p-1" key={index}>
                    <Checkbox value={user.id} className="px-1 flex items-center">
                      <div className="w-full flex flex-1 gap-2 items-center ">
                        <Avatar>{user.first_name.charAt(0) + user.last_name.charAt(0)}</Avatar>
                        <div className="font-semibold ">
                          {shortenName(user.first_name, user.last_name)}
                        </div>
                        <div>@{user.username}</div>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </Form>
        </div>
      }
      showCancel={false}
      icon={null}
      okText={t('admin.saveChanges')}
      okButtonProps={{ block: true }}
      onConfirm={() => form.submit()}
      disabled={card.archived} // Disable Popconfirm when card is archived
    >
      <div
        className={`flex items-center gap-2 py-1 px-2 border w-full mt-2 ${card.archived ? " opacity-50" : "hover:bg-neutral-200 cursor-pointer"
          }`}
        onClick={(e) => card.archived && e.preventDefault()} // Prevent click event when card is archived
      >
        <AiOutlineUser size={16} /> <span>{t('nav.teamMembers')}</span>
      </div>
    </Popconfirm>
  );
}

export default UpdateUserTask;
