import React, { useEffect,useState } from 'react';
import { Modal, Form, Input, InputNumber, Switch, message } from 'antd';
import { DocumentGroup } from '../DocumentTable';

interface EditDocumentGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: DocumentGroup | null;
  isCreating?: boolean;
  onSubmit: (values: Partial<DocumentGroup>) => Promise<void>;
}

export default function EditDocumentGroupModal({ 
  isOpen, 
  onClose, 
  isCreating,
  initialData, 
  onSubmit 
}: EditDocumentGroupModalProps) {
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
      const values = await form.validateFields()
      // Attach the ID so the API knows which record to update
      await onSubmit({ id: initialData?.id, ...values });
      message.success('Document group updated successfully');
      onClose();
      setLoading(false);
    } catch(info) {
      console.error('Validation Failed:', info);
      message.error('Please check the highlighted fields.');
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isCreating ? "Thêm Nhóm tài liệu" : "Sửa nhóm tài liệu"}
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      okButtonProps={{disabled: isLoading}}
      okText="Lưu"
      cancelText="Thoát"
      confirmLoading={isLoading}
      cancelButtonProps={{disabled: isLoading}}
      width={600} // Kept slightly narrower since there are fewer fields
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        
        {/* Highlighted Status Bar */}
        <div className="flex justify-between items-center mb-6 p-3 bg-gray-50 rounded border border-gray-100">
          <div>
            <span className="font-semibold text-gray-700 block">Group Status</span>
            <span className="text-xs text-gray-500">Determine if this group is active</span>
          </div>
          {/* valuePropName="checked" maps the boolean correctly to the Switch */}
          <Form.Item name="is_active" valuePropName="checked" className="mb-0">
            <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" />
          </Form.Item>
        </div>

        {/* Row 1: Name and Sort Order */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
          <Form.Item 
            name="name" 
            label="Tên nhóm" 
            className="md:col-span-2"
            rules={[{ required: true, message: 'Xin viết tên nhóm' }]}
          >
            <Input placeholder="vd Tài liệu" />
          </Form.Item>

          <Form.Item 
            name="sort_order" 
            label="Trình tự"
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            {/* InputNumber ensures the user can only type integers, not text */}
            <InputNumber 
              disabled={isCreating}
              className="w-full" 
              min={0} 
              placeholder="0" 
            />
          </Form.Item>
        </div>

        {/* Row 2: Description */}
        <Form.Item 
          name="description" 
          label="Mô tả"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Mô tả ngắn về nhóm..." 
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}
