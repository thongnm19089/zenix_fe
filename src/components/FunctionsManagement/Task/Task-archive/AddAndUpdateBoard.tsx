import { useCreateNotificationMutation } from "@/api/SetUp/apiNotification";
import { useGetSetupQuery } from "@/api/SetUp/apiSetup";
import { useCreateBoardMutation, useEditBoardMutation } from "@/api/Task/apiTask";
import { IBoard } from "@/types/taskTypes";
import { Button, Form, Input, Modal, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { FiEdit } from "react-icons/fi";

const AddAndUpdateBoard = ({
  edit,
  title,
  titleLabel,
  board,
}: {
  edit?: boolean;
  title: string;
  titleLabel: string;
  board?: IBoard;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [createBoard, { isLoading: isLoadingAdd }] = useCreateBoardMutation();
  const [createNotification] = useCreateNotificationMutation();

  const [editBoard, { isLoading: isLoadingEdit }] = useEditBoardMutation();
  const { data: setupList, error, isLoading } = useGetSetupQuery();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      name: values.name,
      user_ids: values.user_ids || [],
    };

    try {
      const result = await createBoard(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t("task.errorTask")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        await createNotification({ type_code: "task", text: "Đã tạo thêm bảng" });
        notification.success({
          message: `${t("noficationAddAndUpdate.createBoard")}`,
          placement: "bottomRight",
          className: "h-[86px]",
        });
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    if (edit) {
      // Check if edit is true
      form.setFieldsValue({
        name: board?.name,
        user_ids: board?.users.map((user: { id: any }) => user.id), // This will set an array of user ids
      });
    }
  }, [isModalOpen, board, edit]);

  const onEdit = async (values: any) => {
    try {
      if (!board) {
        throw new Error("Board is not defined");
      }
      await editBoard({ boardId: board.id, body: values });
      setIsModalOpen(false);
      notification.success({
        message: `${t("noficationAddAndUpdate.editBoardSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationAddAndUpdate.editBoardError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      {edit ? (
        <div onClick={showModal}>
          <FiEdit className="inline-block mr-2" />
          {t("general.edit")}
        </div>
      ) : (
        <Button type="dashed" block className="h-28" onClick={showModal}>
          {t("general.createNew")}
        </Button>
      )}

      <Modal
        title={`${edit ? t("general.edit") : t("general.createNew")} ${title}`}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <div>
          <Form
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            initialValues={{ remember: false }}
            onFinish={edit ? onEdit : onFinish}
            form={form}
          >
            <Form.Item
              name="name"
              label={titleLabel}
              className="my-4"
              rules={[{ required: true, message: "Please input a name!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="user_ids" label={t("table.user")} className="my-4">
              <Select
                mode="multiple" // Cho phép chọn nhiều người dùng
                showSearch // Hiển thị thanh tìm kiếm
                placeholder={t("table.chooseUserToBoard")} // Văn bản gợi ý
                optionFilterProp="children" // Lọc dựa trên nội dung của mỗi lựa chọn
                filterOption={
                  (input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase()) // Hàm lọc để tìm kiếm người dùng
                }
              >
                {setupList?.employee_list?.map((user: any) => (
                  <Select.Option key={user?.id} value={user?.id}>
                    {`${user.last_name} ${user.first_name}`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button type="primary" htmlType="submit" className=" mb-2" loading={edit ? isLoadingEdit : isLoadingAdd}>
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

export default AddAndUpdateBoard;
