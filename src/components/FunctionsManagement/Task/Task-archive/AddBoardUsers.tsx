import { useGetSetupQuery } from "@/api/SetUp/apiSetup";
import { useAddUserBoardMutation } from "@/api/Task/apiTask";
import { IBoard } from "@/types/taskTypes";
import { Avatar, Button, Checkbox, Form, Input, Modal, Popconfirm, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { AiOutlineUser } from "react-icons/ai";

const AddBoardUsers = ({
  board,
}: {
  board?: IBoard;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [addUserBoard, { isLoading: isLoadingAdd } ] = useAddUserBoardMutation();
  const { data: setupList, error, isLoading } = useGetSetupQuery();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      id: board?.id,
      user_ids: values.user_ids || [],
    };
    try {
      if (!board) {
        throw new Error("Board is not defined");
      }
      await addUserBoard(body);
      setIsModalOpen(false);
      notification.success({
        message: `${t('noficationAddAndUpdate.editBoardSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationAddAndUpdate.editBoardError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <div onClick={showModal}>
        <AiOutlineUser className="inline-block mr-2" />
        {t("task.addMembers")}
      </div>

      <Modal
        title={t("task.addMembers")}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <div>
          <Form
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            initialValues={{ remember: false }}
            onFinish={onFinish}
            form={form}
          >
            <Form.Item name="user_ids" label={t('task.newMember')} className="my-4">
              <Select
                mode="multiple" // Cho phép chọn nhiều người dùng
                showSearch // Hiển thị thanh tìm kiếm
                placeholder={t('table.chooseUserToBoard')} // Văn bản gợi ý
                optionFilterProp="children" // Lọc dựa trên nội dung của mỗi lựa chọn
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .includes(input.toLowerCase()) // Hàm lọc để tìm kiếm người dùng
                }
              >
                {setupList?.employee_list
                  ?.filter(
                    (emp: { id: number; }) => !board?.users.some((boardUser) => boardUser.id === emp.id)
                  )
                  .map((user: any) => (
                    <Select.Option key={user?.id} value={user?.id}>
                      {`${user.last_name} ${user.first_name} @${user.username}`}
                    </Select.Option>
                  ))
                }

              </Select>
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button type="primary" htmlType="submit" className=" mb-2" loading={isLoadingAdd}>
                {t("general.confirm")}
              </Button>
              <Button onClick={handleCancel}>{t("general.cancel")}</Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default AddBoardUsers;
