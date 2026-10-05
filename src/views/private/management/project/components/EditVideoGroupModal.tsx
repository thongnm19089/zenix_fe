import React, { useEffect,useState } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { VideoGroup } from '../VideoTable';

interface EditVideoGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreate?: boolean;
  initialData: VideoGroup | null;
  onSubmit: (values: Partial<VideoGroup>) => Promise<void>;
}

export default function EditVideoGroupModal({
  isOpen,
  onClose,
  isCreate,
  initialData,
  onSubmit
}: EditVideoGroupModalProps) {
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);

  // 3. Populate form when opened
  useEffect(() => {
    if (isOpen && initialData) {
      form.setFieldsValue(initialData);
    } else {
      form.resetFields();
    }
  }, [isOpen, initialData, form]);

  // 4. Handle Form Submission
  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      // Attach the ID so the API knows which record to update
      await onSubmit({ id: initialData?.id, ...values });
      message.success('Video group updated successfully');
      onClose();
      setLoading(false);
    } catch(info) {
      console.error('Validation Failed:', info);
      message.error('Please complete the required fields.');
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isCreate ? "Add Video Group" : "Edit Video Group" }
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      okText="Save Group"
      okButtonProps={{disabled: isLoading}}
      cancelButtonProps={{disabled: isLoading}}
      confirmLoading={isLoading}
      cancelText="Cancel"
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        
        {/* Row 1: Name and Sort Order */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4">
          <Form.Item 
            name="name" 
            label="Category Name" 
            className="md:col-span-3"
            rules={[{ required: true, message: 'Please enter a category name' }]}
          >
            <Input placeholder="e.g. Tutorials, Webinars..." />
          </Form.Item>

          <Form.Item 
            name="sort_order" 
            label="Display Order"
            className="md:col-span-1"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber 
              disabled
              className="w-full" 
              min={0} 
              placeholder="0" 
            />
          </Form.Item>
        </div>

        {/* Row 2: Description */}
        <Form.Item 
          name="description" 
          label="Group Description"
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Describe the types of videos that belong in this group..." 
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}
