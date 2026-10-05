import React, { useEffect,useState } from 'react';
import { Modal, Form, Input, Select, Switch, InputNumber, message, Typography,Upload, Button } from 'antd';
import { PortalVideo } from '../VideoTable';
import { UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;

// 2. Component Props
interface EditPortalVideoModalProps {
  isOpen: boolean;
  isAdd?: boolean;
  onClose: () => void;
  initialData: Partial<PortalVideo> | null;
  onSubmit: (values: Partial<PortalVideo>) => Promise<void>;
  availableGroups?: { id: number; name: string }[];
}

export default function EditPortalVideoModal({
  isOpen,
  onClose,
  isAdd,
  initialData,
  onSubmit,
  availableGroups = []
}: EditPortalVideoModalProps) {
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);

  // 3. Populate form when opened or when data changes
  useEffect(() => {
    if (isOpen && initialData) {
      form.setFieldsValue(initialData);
    } else if (!isOpen) {
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
      onClose()
      setLoading(false);
    } catch(info) {
      console.error('Validation Failed:', info);
      message.error('Please complete all required fields.');
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isAdd ? "Add Portal Video" : "Edit Portal Video" }
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      okText="Save Video"
      cancelText="Cancel"
      width={800} // Slightly wider to accommodate media fields
      okButtonProps={{disabled: isLoading}}
      cancelButtonProps={{disabled: isLoading}}
      confirmLoading={isLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        
        {/* Status Header */}
        <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">Video Visibility</span>
            <Text type="secondary" className="text-xs">Toggle whether users can watch this video in the portal</Text>
          </div>
          
          <div className="flex flex-col items-end">
            <Text type="secondary" className="text-[10px] uppercase tracking-wider mb-1">Status</Text>
            <Form.Item name="is_active" valuePropName="checked" className="mb-0">
              <Switch checkedChildren="ACTIVE" unCheckedChildren="HIDDEN" disabled={isLoading} />
            </Form.Item>
          </div>
        </div>

        {/* Row 1: Title and Sort Order */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4">
          <Form.Item 
            name="title" 
            label="Video Title" 
            className="md:col-span-3"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="e.g. Introduction to ERP Dashboard" disabled={isLoading} />
          </Form.Item>

          <Form.Item 
            name="sort_order" 
            label="Display Order"
            className="md:col-span-1"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber className="w-full" min={0} disabled={isAdd} />
          </Form.Item>
        </div>

        {/* Row 2: Service and Group Routing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item 
            name="group" 
            label="Video Category Group"
            rules={[{ required: true, message: 'Group is required' }]}
          >
            <Select placeholder="Select video group" disabled={isLoading}>
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
            name="video_url" 
            label="External Video URL"
            extra="e.g. YouTube or Vimeo link"
          >
            <Input placeholder="https://..." allowClear disabled={isLoading} />
          </Form.Item>

          <Form.Item 
            name="video_file" 
            label="Hosted File Path"
            extra="Direct link to S3/Cloudfront MP4"
          >
            <Upload
              name="File Path"
              multiple={false}
              maxCount={1}
              accept="video/*"
            >
              {initialData?.video_file && <Input value={initialData.video_file} disabled className="flex-grow-0" />}
              <Button className="mt-2" icon={<UploadOutlined rev />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
        </div>

        {/* Row 4: Thumbnail and Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4">
          <Form.Item 
            name="thumbnail" 
            label="Thumbnail URL"
            className="md:col-span-3"
            extra="Image poster shown before the video plays"
          >
            <Input placeholder="https://..." allowClear disabled={isLoading} />
          </Form.Item>

          <Form.Item 
            name="duration_seconds" 
            label="Duration"
            className="md:col-span-1"
            extra="In seconds"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber 
              className="w-full" 
              min={0} 
              addonAfter="sec"
              disabled={isLoading} 
            />
          </Form.Item>
        </div>

        {/* Row 5: Description */}
        <Form.Item 
          name="description" 
          label="Video Description"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Provide context about what this video covers..." 
            disabled={isLoading}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}
