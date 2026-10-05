import React, { useEffect,useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { Business } from '../BusinessTable';

// 2. Component Props
interface EditBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Business | null;
  isAdd?: boolean;
  // You can replace this with your actual RTK Query mutation
  onSubmit: (values: Partial<Business>) => Promise<void>; 
}

export default function EditBusinessModal({ isOpen, onClose, initialData, onSubmit, isAdd }: EditBusinessModalProps) {
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);

  // 3. Populate the form whenever the modal opens or the data changes
  useEffect(() => {
    if (isOpen && initialData) {
      form.setFieldsValue(initialData);
    } else {
      form.resetFields();
    }
  }, [isOpen, initialData, form]);

  // 4. Handle Submission
  const handleOk = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      const payload = isAdd ? values : { id: initialData?.id, ...values };
      await onSubmit(payload);
      message.success("Đã thay đổi doanh nghiệp");
      onClose();
      setLoading(false)
    } catch(info) {
      const responseError = (info as any)?.data?.detail || (info as any)?.error || (info as any)?.message;
      message.error(responseError ? `Lỗi: ${responseError}` : "Có lỗi xảy ra");
      console.log('Submit error:', info);
      setLoading(false)
    }
  };

  return (
    <Modal
      title={isAdd ? "Thêm doanh nghiệp" : "Sửa thông tin doanh nghiệp"}
      open={isOpen}
      onOk={handleOk}
      okButtonProps={{disabled: isLoading}}
      onCancel={onClose}
      okText="Lưu"
      confirmLoading={isLoading}
      cancelButtonProps={{disabled: isLoading}}
      cancelText="Thoát"
      width={700} // Made slightly wider to accommodate the 2-column grid
      destroyOnClose
    >
      {/* layout="vertical" puts labels above the inputs for a cleaner look */}
      <Form form={form} layout="vertical" className="mt-4">
        {/* Row 1: Code and Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item 
            name="code" 
            label="Mã doanh nghiệp" 
            rules={[{ required: true, message: 'Vui lòng nhập mã doanh nghiệp' }]}
          >
            <Input disabled={!isAdd} className="bg-gray-50 text-gray-500" />
          </Form.Item>

          <Form.Item 
            name="name" 
            label="Tên Công ty" 
            rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
          >
            <Input placeholder="Enter company name" />
          </Form.Item>
        </div>

        {/* Row 2: Tax Code and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item 
            name="tax_code" 
            label="Mã số thuế"
          >
            <Input placeholder="Enter tax code" />
          </Form.Item>

          <Form.Item 
            name="status" 
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="inactive">Không hoạt động</Select.Option>
              <Select.Option value="pending">Chờ xử lý</Select.Option>
            </Select>
          </Form.Item>
        </div>

        {/* Row 3: Contact Person and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item 
            name="contact_person" 
            label="Liên hệ"
          >
            <Input placeholder="Tên đầy đủ" />
          </Form.Item>

          <Form.Item 
            name="phone" 
            label="Số điện thoại"
          >
            <Input placeholder="e.g. 0901234567" />
          </Form.Item>
        </div>

        {/* Email spans full width if needed, or pair it with something else */}
        <Form.Item 
          name="email" 
          label="Email"
          rules={[
            { type: 'email', message: 'Nhập địa chỉ email chính xác' },
            { required: true, message: 'Vui lòng nhập email' },
          ]}
        >
          <Input placeholder="contact@company.com" />
        </Form.Item>

        {/* Address and Note get TextAreas because they are usually longer */}
        <Form.Item 
          name="address" 
          label="Địa chỉ"
        >
          <Input.TextArea rows={2} placeholder="Địa chỉ đầy đủ" />
        </Form.Item>

        <Form.Item 
          name="note" 
          label="Ghi chú"
        >
          <Input.TextArea rows={3} placeholder="Thêm ghi chú vào đây..." />
        </Form.Item>

      </Form>
    </Modal>
  );
}
