import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, Upload, Select, DatePicker, notification } from "antd";
import { useCreateAssignmentMutation } from "@/api/Learning/apiLearning";
import { RcFile, UploadChangeParam } from "antd/lib/upload";
import { GoUpload } from "react-icons/go";

interface LessonProps {
  id: number;
  title: string;
}

interface ModuleProps {
  id: number;
  title: string;
}

const AddAssignment: React.FC<any> = ({ course, refetchAdminCourses }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [createAssignment] = useCreateAssignmentMutation();
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    // No need for any effect based on edit mode since we're only creating assignments
  }, []);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("course", course.id.toString());
      if (values.due_date) {
        formData.append("due_date", values.due_date.toISOString());
      }
      if (values.module) {
        formData.append("module", values.module);
      }
      if (values.lesson) {
        formData.append("lesson", values.lesson);
      }

      // Append files to formData
      fileList.forEach((file: any) => {
        formData.append("files", file.originFileObj || file);
      });

      // Call the mutation with formData
      await createAssignment(formData).unwrap();

      notification.success({ message: "Assignment created successfully" });
      setVisible(false);
      form.resetFields();
      setFileList([]); // Clear the file list after successful submission
      refetchAdminCourses()
    } catch (error) {
      notification.error({ message: "Error creating assignment" });
    }
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
    setFileList([]); // Clear the file list on cancel
  };

  const handleFileChange = (info: UploadChangeParam) => {
    setFileList(info.fileList as RcFile[]);
  };

  const handleModuleChange = (value: string) => {
    const selectedModule = course.modules.find((m: { id: number | string }) => m.id === value);
    setLessons(selectedModule ? selectedModule.lessons : []);
    form.setFieldsValue({ lesson: undefined });
  };

  return (
    <>
      <Button type="primary" onClick={showModal} style={{ marginTop: "8px", width: "100%", borderRadius: "8px" }}>
        Add Assignment
      </Button>
      <Modal
        title="Add Assignment"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="due_date" label="Due Date">
            <DatePicker showTime />
          </Form.Item>
          <Form.Item name="module" label="Module">
            <Select
              options={course.modules.map((module: ModuleProps) => ({
                value: module.id,
                label: module.title,
              }))}
              onChange={handleModuleChange}
            />
          </Form.Item>
          <Form.Item name="lesson" label="Lesson">
            <Select
              options={lessons.map((lesson: LessonProps) => ({ value: lesson.id, label: lesson.title }))}
              disabled={!form.getFieldValue("module")}
            />
          </Form.Item>
          <Form.Item label="Files">
            <Upload fileList={fileList} onChange={handleFileChange} beforeUpload={() => false} multiple>
              <Button icon={<GoUpload />}>Upload Files</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddAssignment;
