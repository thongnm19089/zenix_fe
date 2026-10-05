import React, { useState } from "react";
import { Button, ColorPicker, Form, Input, Modal, notification, Popover, Tag } from "antd";
import { useTranslations } from "next-intl";
import { useCreateTaskPriorityMutation } from "@/api/Project/apiProject"; // Import the mutation hook
import colorToString from "@/utils/colorToString";

export default function AddTaskPriorityToProject({
  projectId,
  taskPriorityData,
  refetchProject,
}: {
  projectId?: any; // The project ID passed as a prop
  taskPriorityData?: any;
  refetchProject: () => void;
}) {
  const [form] = Form.useForm();
  const t: any = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [createTaskPriority, { isLoading }] = useCreateTaskPriorityMutation(); // Hook for creating task priority

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const onFinish = async (values: any) => {
    // Prepare the data to send in the request
    const taskPriorityData = {
      name: values.name,
      color: colorToString(values.color.metaColor),
      project: projectId, // Assign the project ID to the task priority
    };

    try {
      // Call the API mutation to create the task priority
      await createTaskPriority(taskPriorityData).unwrap();
      notification.success({
        message: "Ưu tiên công việc đã được thêm thành công",
        placement: "bottomRight",
        className: "h-16",
      });
      refetchProject()
      form.resetFields();
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      notification.error({
        message: "Thêm ưu tiên công việc thất bại",
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const content = (
    <div>
      {taskPriorityData?.map((status: any) => (
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
          Thêm ưu tiên công việc
        </Button>
      </Popover>
      <Modal
        title="Thêm ưu tiên công việc"
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <Form onFinish={onFinish} form={form} initialValues={{ color: "#39A9FF" }}>
          <Form.Item
            name="name"
            label="Ưu tiên"
            className="my-4"
            rules={[{ required: true, message: "Vui lòng nhập tên ưu tiên!" }]}
          >
            <Input placeholder="Gấp/ Quan trọng" />
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
