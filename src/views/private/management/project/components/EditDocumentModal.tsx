import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, InputNumber, message, Space, Typography, Upload, Button } from 'antd';
import {
  DocumentGroup,
  PortalDocument
} from '../DocumentTable';
import { UploadOutlined } from '@ant-design/icons';
import { toFormData } from '@/helper';

const { Text } = Typography;

// 2. Component Props
interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: PortalDocument | null;
  isCreating?: boolean;
  onSubmit: (values: PortalDocument) => Promise<void>;
  // Options for the dropdowns
  availableServices?: { id: number; name: string }[];
  availableGroups?: DocumentGroup[];
}

export default function EditDocumentModal({
  isOpen,
  onClose,
  initialData,
  isCreating,
  onSubmit,
  availableServices = [],
  availableGroups = []
}: EditDocumentModalProps) {
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
      await onSubmit({ id: initialData?.id, ...values });
      message.success('Document updated successfully');
      onClose();
      setLoading(false);
    } catch (info) {
      console.error('Validation Failed:', info);
      message.error('Please check the required fields.');
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isCreating ? "Thêm tài liệu" : "Sửa tài liệu"}
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      okText="Lưu"
      okButtonProps={{disabled: isLoading}}
      cancelText="Thoát"
      confirmLoading={isLoading}
      cancelButtonProps={{disabled: isLoading}}
      width={750}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">

        {/* Status & Analytics Header */}
        <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">Trạng thái</span>
            <Text type="secondary" className="text-xs">Thay đổi trạng thái</Text>
          </div>

          <Space size="large">
            <div className="flex flex-col items-end">
              <Text type="secondary" className="text-[10px] uppercase tracking-wider mb-1">Trạng thái</Text>
              <Form.Item name="is_active" valuePropName="checked" className="mb-0">
                <Switch checkedChildren="ACTIVE" unCheckedChildren="HIDDEN" />
              </Form.Item>
            </div>
          </Space>
        </div>

        {/* Row 1: Title and Document Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
          <Form.Item
            name="title"
            label="Tiêu đề tài liệu"
            className="md:col-span-2"
            rules={[{ required: true, message: 'Xin nhập tiêu đề' }]}
          >
            <Input placeholder="e.g. User Manual v2.0" />
          </Form.Item>

          <Form.Item
            name="doc_type"
            label="Loại tài liệu"
            rules={[{ required: true, message: 'Chọn một loại tài liệu' }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="guide">Guide</Select.Option>
              <Select.Option value="form">Form</Select.Option>
              <Select.Option value="policy">Policy</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
        </div>

        {/* Row 2: Service and Group Routing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">

          <Form.Item
            name="group"
            label="Nhóm tài liệu"
            rules={[{ required: true, message: 'Nhóm tài liệu là bác buộc' }]}
          >
            <Select placeholder="Select category group">
              {availableGroups.map(group => (
                <Select.Option key={group.id} value={group.id}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Row 3: Media Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            name="url"
            label="External URL"
            extra="Use this if redirecting to an external site"
          >
            <Input placeholder="https://..." allowClear />
          </Form.Item>

          <Form.Item
            name="file"
            label="File Path / URL"
            extra="Direct link to the S3/Cloudfront file"
          >
            <Upload
              name="File Path"
              multiple={false}
              maxCount={1}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            >
              {initialData?.file && <Input value={initialData.file} disabled className="flex-grow-0" />}
              <Button className="mt-2" icon={<UploadOutlined rev />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
        </div>

        {/* Row 4: Usage Function */}
        <Form.Item
          name="usage_function"
          label="Sử dụng"
        >
          <Input placeholder="e.g. Internal Training, Client Onboarding..." />
        </Form.Item>

        {/* Row 5: Description */}
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea
            rows={3}
            placeholder="Provide context about what this document contains..."
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}
