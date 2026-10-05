import { Button, DatePicker, Form, Input, message, Modal, Select } from 'antd';
import { useState } from 'react';
import {
  useCreateTasksMutation,
} from '@/api/Project/apiProject';
import React from 'react';
import { useGetSetupQuery } from '@/api/SetUp/apiSetup';

const AddTasks = ({
  isAddTasksModalOpen,
  setIsAddTasksModalOpen,
  sheetsId,
  projectId,
  taskStatusList,
  taskPriorityData,  // Thêm prop kiểm tra có hiển thị mức độ ưu tiên không
  taskDifficultyData, // Thêm prop kiểm tra có hiển thị mức độ khó không
  refetchProject,
}: {
  isAddTasksModalOpen: boolean;
  setIsAddTasksModalOpen: (isAddTasksModalOpen: boolean) => void;
  sheetsId: string;
  projectId: string;
  taskStatusList: any;
  taskPriorityData: any;  // Truyền vào prop này để kiểm tra mức độ ưu tiên
  taskDifficultyData: any;  // Truyền vào prop này để kiểm tra mức độ khó
  refetchProject: () => void;
}) => {
  const [form] = Form.useForm();
  const [createTasks] = useCreateTasksMutation();
  const { data: setupList } = useGetSetupQuery();
  const [assignee, setAssignee] = useState<any[]>([]);

  const handleCancel = () => {
    setIsAddTasksModalOpen(false);
  };

  const handleOk = async (values: any) => {
    setIsAddTasksModalOpen(false);
  };

  const handleFinish = async (values: any) => {
    try {
      await form.validateFields();
      const result = await createTasks({
        title: values.title,
        assignees: assignee,
        project: projectId,
        sheet: sheetsId,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
        status: values.status,
        priority: values?.priority, // Thêm mức độ ưu tiên
        difficulty: values?.difficulty, // Thêm mức độ khó
        description: values.description,
      }).unwrap();

      if (result) {
        message.success('Thêm tasks thành công');
      }
    } catch (error) {
      message.error('Thêm tasks thất bại');
    }

    refetchProject();
    form.resetFields();
    setAssignee([]);
    setIsAddTasksModalOpen(false);
  };

  return (
    <Modal
      title='Thêm tasks'
      open={isAddTasksModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout='vertical' onFinish={handleFinish}>
        <Form.Item
          label='Tên tasks'
          name='title'
          rules={[{ required: true, message: 'Vui lòng nhập tên bảng!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label='Người phụ trách' name='assignee'>
          <Select
            placeholder='Chọn người phụ trách'
            mode='multiple'
            showSearch  // Bật chức năng tìm kiếm
            onSelect={(value: any) => {
              setAssignee((prev: any[]) => [...prev, value]);
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

        <div className='flex items-center gap-4'>
          <Form.Item label='Ngày bắt đầu' name='start_date'>
            <DatePicker />
          </Form.Item>
          <Form.Item label='Ngày kết thúc' name='deadline'>
            <DatePicker />
          </Form.Item>
        </div>
        <Form.Item label='Trạng thái' name='status'>
          <Select>
            {taskStatusList?.map((status: any) => (
              <Select.Option key={status.id} value={status.id}>
                {status.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {taskPriorityData?.length > 0 && (
          <Form.Item label="Mức độ ưu tiên" name="priority">
            <Select>
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
            <Select>
              {/* Duyệt qua danh sách difficulty_list và hiển thị các mức độ khó */}
              {taskDifficultyData?.map((difficulty: any) => (
                <Select.Option key={difficulty.id} value={difficulty.id}>
                  {difficulty.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item label='Mô tả' name='description'>
          <Input.TextArea />
        </Form.Item>
        <Button type='primary' htmlType='submit'>
          Thêm tasks
        </Button>
      </Form>
    </Modal>
  );
};

export default AddTasks;
