import React, { useEffect,useState } from 'react';
import { Modal, Form, Input, Select, Switch, message,InputNumber } from 'antd';
import { BusinessService,
DetailedServicePackage } from '../ServiceTable';

interface EditPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: DetailedServicePackage | null;
  onSubmit: (values: Partial<DetailedServicePackage>) => Promise<void>;
  isCreate?: boolean;
  // Pass available parent services to populate the dropdown
  service: BusinessService | null; 
}

export default function EditDetailedPackageModal({ 
  isOpen, 
  onClose, 
  initialData, 
  onSubmit,
  isCreate,
  service,
}: EditPackageModalProps) {
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);

  // 2. Populate form when opened
  useEffect(() => {
    if (isOpen && initialData) {
      form.setFieldsValue(initialData);
    } else {
      form.resetFields();
    }
  }, [isOpen, initialData, form]);

  // 3. Handle Form Submission
  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      // Attach the ID back onto the payload for the API
      await onSubmit({ id: initialData?.id, ...values });
      message.success('Package updated successfully');
      form.resetFields();
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
      title={isCreate ? "Thêm gói dịch vụ" :"Sửa gói dịch vụ"}
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      okButtonProps={{disabled: isLoading}}
      confirmLoading={isLoading}
      cancelButtonProps={{disabled: isLoading}}
      okText="Lưu"
      cancelText="Thoát"
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        
        <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded border border-gray-100">
          <div>
            <span className="font-semibold text-gray-700 block">Trạng thái</span>
            <span className="text-xs text-gray-500">Kích hoạt hay không kích hoạt</span>
          </div>
          {/* MAGIC LINE: valuePropName="checked" is required for Antd Switches to bind correctly */}
          <Form.Item name="is_active" valuePropName="checked" className="mb-0">
            <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" />
          </Form.Item>
        </div>

        {/* Row 1: Package Name and Parent Service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item 
            name="name" 
            label="Tên gói" 
            rules={[{ required: true, message: 'Nhập tên gói' }]}
          >
            <Input placeholder="e.g. 12 tháng đồng hành..." />
          </Form.Item>
        </div>

        {/* Row 2: Monthly Fee and Billing Cycle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item 
            name="monthly_fee" 
            label="Phí thàng"
            rules={[{ required: true, message: 'Nhập phí thàng' }]}
          >
            {/* Using addonAfter gives it a nice native currency feel */}
            <InputNumber 
              placeholder="3000000.00" addonAfter="VND" 
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
            />
          </Form.Item>

          <Form.Item 
            name="cycle" 
            label="Chu kỳ thu phí"
            rules={[{ required: true, message: 'Chọn một chu kỳ' }]}
          >
            <Select placeholder="Select cycle">
              <Select.Option value="monthly">Hàng tháng</Select.Option>
              <Select.Option value="quarterly">Hàng Quý</Select.Option>
              <Select.Option value="yearly">Hằng năm</Select.Option>
              <Select.Option value="one-time">Trả một lần</Select.Option>
            </Select>
          </Form.Item>
        </div>

        {/* Row 3: Description */}
        <Form.Item 
          name="description" 
          label="Mô tả ngẳn"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={2} placeholder="Brief summary of the package..." />
        </Form.Item>

        {/* Row 4: Benefits (Allows for \r\n line breaks) */}
        <Form.Item 
          name="benefits" 
          label="Phúc lợi"
          extra="Press Enter to create a new bullet point line."
          rules={[{ required: true }]}
        >
          <Input.TextArea 
            rows={5} 
            placeholder="- Hỗ trợ nhiệt tình khi cần&#10;- Fix lỗi trong thời gian cam kết" 
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}
