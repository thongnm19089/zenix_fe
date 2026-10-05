import {
  useEditCardMutation,
} from "@/api/Task/apiTask";
import { Button, Form, Modal, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { IBoard, ICard } from "@/types/taskTypes"; // Make sure to import your types

interface AddAndUpdateUserProps {
  isOpen: boolean;
  closeModal: () => void;
  board: IBoard;
  card: ICard;

  listId: number;
  patchCard: (listId: number, cardId: number, patch: Partial<ICard>) => void;
}

const AddAndUpdateUser: React.FC<AddAndUpdateUserProps> = ({
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

  useEffect(() => {
    form.setFieldsValue({
      user_ids: card?.users?.map((u: any) => u.id) || [],
    });
  }, [isOpen, card, form]);

  const onFinish = (values: any) => {
    const newUserIds: number[] = values.user_ids || [];
    const oldUsers = card.users;

    // build new users from board.users
    const newUsers = (board?.users || []).filter((u: any) => newUserIds.includes(u.id));

    // ✅ 1) UI fake trước + đóng modal
    patchCard(listId, card.id, { users: newUsers });
    closeModal();

    // ✅ 2) API gọi sau
    editCard({ id: card.id, user_ids: newUserIds })
      .unwrap()
      .then(() => {
        notification.success({
          message: "Sửa thành viên thành công",
          placement: "bottomRight",
          className: "h-16",
        });
      })
      .catch(() => {
        // ✅ rollback
        patchCard(listId, card.id, { users: oldUsers });
        notification.error({
          message: "Sửa thành viên thất bại",
          placement: "bottomRight",
          className: "h-16",
        });
      });
  };

  return (
    <>
      <Modal
        title={t('noficationAddAndUpdate.addEditMembers')}
        open={isOpen}
        footer={null}
        onCancel={closeModal}
        centered
        width={300}
        bodyStyle={{ padding: '10px 20px' }}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          form={form}
        >
          <Form.Item name="user_ids" label="Users" className="my-4">
            <Select
              mode="multiple" // Cho phép chọn nhiều người dùng
              showSearch // Hiển thị thanh tìm kiếm
              placeholder="Select users for the board" // Văn bản gợi ý
              optionFilterProp="children" // Lọc dựa trên nội dung của mỗi lựa chọn
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  .toLowerCase()
                  .includes(input.toLowerCase()) // Hàm lọc để tìm kiếm người dùng
              }
            >
              {board?.users?.map((user: any) => (
                <Select.Option key={user?.id} value={user?.id}>
                  {`${user.last_name} ${user.first_name}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-2">
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

export default AddAndUpdateUser;