import { Button, Form, Input, message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useCreateSheetsMutation } from '@/api/Project/apiProject';
import React from 'react';

interface Sheet {
  id: string;
  name: string;
  data: any[];
}

const AddSheets = ({
  isModalOpen,
  setIsModalOpen,
  setSheets,
  projectId,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  setSheets: React.Dispatch<React.SetStateAction<Sheet[]>>;
  projectId: string;
}) => {
  const [form] = Form.useForm();
  const [createSheet, { isLoading }] = useCreateSheetsMutation();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = async () => {
    try {
      await form.validateFields();
      const result = await createSheet({
        name: form.getFieldValue('name'),
        project: projectId,
      }).unwrap();

      if (result) {
        message.success('Thêm sheet thành công');
      }

      setSheets((prev: Sheet[]) => [
        ...prev,
        {
          id: result.id,
          name: form.getFieldValue('name'),
          data: [],
        },
      ]);
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('Thêm sheet thất bại');
    }
  };

  return (
    <Modal
      title='Thêm Sheet'
      // open={isModalOpen}
      // onOk={handleOk}

      // onCancel={handleCancel}

      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isLoading}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          label='Tên bảng'
          name='name'
          rules={[{ required: true, message: 'Vui lòng nhập tên bảng!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSheets;
