import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, DatePicker } from 'antd';
import {
  useUpdateTaskMutation,
} from '@/api/Project/apiProject';
import dayjs from 'dayjs';
import { useGetSetupQuery } from '@/api/SetUp/apiSetup';

const { Option } = Select;

interface EditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  task: any;
  projectId: string;
  sheetId: string;
  taskStatusList: any;
  taskPriorityData: any;
  taskDifficultyData: any;
  refetchProject: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  visible,
  onClose,
  task,
  projectId,
  sheetId,
  taskStatusList,
  taskPriorityData,  // Thêm prop kiểm tra có hiển thị mức độ ưu tiên không
  taskDifficultyData, // Thêm prop kiểm tra có hiển thị mức độ khó không
  refetchProject

}) => {
  const [form] = Form.useForm();
  const { data: setupList } = useGetSetupQuery();
  const [updateTask] = useUpdateTaskMutation();
  const [assignees, setAssignees] = useState<any[]>([]);

  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        title: task.title,
        assignees: task.assignees,
        description: task.description,
        status: task.status,
        priority: task.priority ?? null, // Nếu không có giá trị thì gán null
        difficulty: task.difficulty ?? null, // Nếu không có giá trị thì gán null
        start_date: task.start_date ? dayjs(task.start_date) : null,
        deadline: task.deadline ? dayjs(task.deadline) : null,
      });
    }
  }, [task, form]);

  const handleUpdate = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
        priority: values.priority || null,  // Đảm bảo nếu không có priority sẽ được cập nhật là null
        difficulty: values.difficulty || null,  // Đảm bảo nếu không có difficulty sẽ được cập nhật là null
      };

      await updateTask({
        id: task.id,
        project: projectId,
        sheet: sheetId,
        ...formattedValues,
      });

      refetchProject()
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <Modal
      open={visible}
      title='Chỉnh sửa Task'
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose}>
          Hủy
        </Button>,
        <Button key='submit' type='primary' onClick={() => form.submit()}>
          Lưu
        </Button>,
      ]}
    >
      <Form form={form} onFinish={handleUpdate} layout='vertical'>
        <Form.Item
          name='title'
          label='Công việc'
          rules={[{ required: true, message: 'Vui lòng nhập công việc' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='assignees'
          label='Người phụ trách'
        >
          <Select
            mode='multiple'
            showSearch  // Bật chức năng tìm kiếm
            onSelect={(value: any) => {
              setAssignees((prev: any[]) => [...prev, value]);
            }}
            filterOption={(input: any, option: any) =>
              (option?.children ?? "").toLowerCase().includes(input.toLowerCase()) // Cung cấp cách lọc theo tên người dùng
            }
          >
            {setupList?.employee_list?.map((employee: any) => (
              <Select.Option key={employee.id} value={employee.id}>
                {employee.username}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name='description'
          label='Mô tả'
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name='status'
          label='Trạng thái'
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select allowClear placeholder="Chọn trạng thái">
            {taskStatusList?.map((status: any) => (
              <Option key={status.id} value={status.id}>
                {status.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {taskPriorityData?.length > 0 && (
          <Form.Item label="Mức độ ưu tiên" name="priority">
            <Select allowClear placeholder="Chọn mức độ ưu tiên">
              {/* Duyệt qua danh sách priority_list và hiển thị các mức độ ưu tiên */}
              {taskPriorityData?.map((priority: any) => (
                <Select.Option key={priority.id} value={priority.id}>
                  {priority.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        {taskDifficultyData?.length > 0 && (
          <Form.Item label="Mức độ khó" name="difficulty">
            <Select allowClear placeholder="Chọn mức độ khó">
              {/* Duyệt qua danh sách difficulty_list và hiển thị các mức độ khó */}
              {taskDifficultyData?.map((difficulty: any) => (
                <Select.Option key={difficulty.id} value={difficulty.id}>
                  {difficulty.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item
          name='start_date'
          label='Ngày bắt đầu'
          rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
        >
          <DatePicker format='YYYY-MM-DD' />
        </Form.Item>
        <Form.Item
          name='deadline'
          label='Ngày kết thúc'
        >
          <DatePicker format='YYYY-MM-DD' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTaskModal;
