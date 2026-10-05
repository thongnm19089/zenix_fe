import React, { useState } from "react";
import { Button, ColorPicker, Form, Input, Modal, notification, Popover, Tag } from "antd";
import { useTranslations } from "next-intl";
import { useCreateTaskStatusMutation } from "@/api/Project/apiProject"; // Import the mutation hook
import colorToString from "@/utils/colorToString";

export default function AddTaskStatusToProject({
  projectId,
  taskStatusData,
  refetchProject,
}: {
  projectId?: any; // The project ID passed as a prop
  taskStatusData?: any;
  refetchProject: () => void;
}) {
  const [form] = Form.useForm();
  const t: any = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [createTaskStatus, { isLoading }] = useCreateTaskStatusMutation(); // Hook for creating task status

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const onFinish = async (values: any) => {
    // Prepare the data to send in the request
    const taskStatusData = {
      name: values.name,
      color: colorToString(values.color.metaColor),
      project: projectId, // Assign the project ID to the task status
    };

    try {
      // Call the API mutation to create the task status
      await createTaskStatus(taskStatusData).unwrap();
      notification.success({
        message: "Trạng thái công việc đã được thêm thành công",
        placement: "bottomRight",
        className: "h-16",
      });
      refetchProject()
      form.resetFields();
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      notification.error({
        message: "Thêm trạng thái công việc thất bại",
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const content = (
    <div>
      {taskStatusData?.map((status: any) => (
        <Tag color={status.color} key={status.id} style={{ marginRight: 5 }}>
          {status.name}
        </Tag>
      ))}
    </div>
  );

  return (
    <>
      <Popover
        content={content}
        title="Danh sách hiện có"
        trigger="hover"
        placement="bottom"
        overlayStyle={{ maxWidth: 400 }}
      >
        <Button type="default" size="middle" onClick={showModal}>
          Thêm trạng thái công việc
        </Button>
      </Popover>
      <Modal
        title="Thêm trạng thái công việc"
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <Form onFinish={onFinish} form={form} initialValues={{ color: "#39A9FF" }}>
          <Form.Item
            name="name"
            label="Trạng thái"
            className="my-4"
            rules={[{ required: true, message: "Vui lòng nhập tên trạng thái!" }]}
          >
            <Input placeholder="Hoàn thành/ Chưa thực hiện" />
          </Form.Item>

          <Form.Item name="color" label={t('admin.color')} className="my-4">
            <ColorPicker />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              type="primary"
              htmlType="submit"
              className="mb-2"
              loading={isLoading} // Display loading spinner when submitting
            >
              {t("general.confirm")}
            </Button>
            <Button onClick={handleCancel}>{t("general.cancel")}</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
