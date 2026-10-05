import React, { useState } from "react";
import { Button, ColorPicker, Form, Input, Modal, notification, Popover, Tag } from "antd";
import { useTranslations } from "next-intl";
import { useCreateTaskDifficultyMutation } from "@/api/Project/apiProject"; // Import the mutation hook
import colorToString from "@/utils/colorToString";

export default function AddTaskDifficultyToProject({
  projectId,
  taskDifficultyData,
  refetchProject,
}: {
  projectId?: any; // The project ID passed as a prop
  taskDifficultyData?: any;
  refetchProject: () => void;
}) {
  const [form] = Form.useForm();
  const t: any = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [createTaskDifficulty, { isLoading }] = useCreateTaskDifficultyMutation(); // Hook for creating task difficulty

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const onFinish = async (values: any) => {
    // Prepare the data to send in the request
    const taskDifficultyData = {
      name: values.name,
      color: colorToString(values.color.metaColor),
      project: projectId, // Assign the project ID to the task difficulty
    };

    try {
      // Call the API mutation to create the task difficulty
      await createTaskDifficulty(taskDifficultyData).unwrap();
      notification.success({
        message: "Mức độ khó công việc đã được thêm thành công",
        placement: "bottomRight",
        className: "h-16",
      });
      refetchProject()
      form.resetFields();
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      notification.error({
        message: "Thêm mức độ khó công việc thất bại",
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const content = (
    <div>
      {taskDifficultyData?.map((status: any) => (
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
        overlayStyle={{ maxWidth: 300 }}
      >
        <Button type="default" size="middle" onClick={showModal}>
          Thêm mức độ khó công việc
        </Button>
      </Popover>
      <Modal
        title="Thêm mức độ khó công việc"
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <Form onFinish={onFinish} form={form} initialValues={{ color: "#39A9FF" }}>
          <Form.Item
            name="name"
            label="Mức độ khó"
            className="my-4"
            rules={[{ required: true, message: "Vui lòng nhập tên mức độ khó!" }]}
          >
            <Input placeholder="Khó/ Trung bình/ Dễ" />
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
