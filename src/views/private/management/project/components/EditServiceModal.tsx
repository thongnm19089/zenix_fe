import React, { useEffect,useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { BusinessService, } from '../ServiceTable';

interface EditServiceModalProps {
  isOpen: boolean;
  isAdd?: boolean;
  onClose: () => void;
  initialData: BusinessService | null;
  onSubmit: (values: Partial<BusinessService>) => Promise<void>;
}

export default function EditBussinessServiceModal({
  isOpen,
  isAdd,
  onClose,
  initialData,
  onSubmit,
}: EditServiceModalProps) {
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);

  // 2. Populate form when data changes
  useEffect(() => {
    if (isOpen && initialData) {
      form.setFieldsValue({
        ...initialData,
        // Ant Design DatePickers require Day.js objects, not strings
        start_date: initialData.start_date ? dayjs(initialData.start_date) : null,
        end_date: initialData.end_date ? dayjs(initialData.end_date) : null,
      });
    } else {
      form.resetFields();
    }
  }, [isOpen, initialData, form]);

  // 3. Handle Form Submission
  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields()
      // Convert the Day.js objects back to standard strings for your API
      const formattedValues = {
        ...values,
        id: initialData?.id,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      };

      await onSubmit(formattedValues);
      form.resetFields();
      message.success("Thay đổi thành công")
      onClose()
      setLoading(false);
    } catch (info) {
      console.error('Validation Failed:', info);
      //@ts-ignore
      if (info?.data?.code) {
        //@ts-ignore
        message.error('Có lỗi xảy ra: ' + info.data.code[0])
      } else {
        message.error('Có lỗi xảy ra');
      }
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isAdd ? "Thêm dịch vụ" : "Sửa dịch vụ"}
      open={isOpen}
      onOk={handleOk}
      okButtonProps={{disabled: isLoading}}
      onCancel={onClose}
      confirmLoading={isLoading}
      cancelButtonProps={{disabled: isLoading}}
      okText="Lưu"
      cancelText="Thoát"
      width={750}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">

        {/* Row 1: Code and Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item name="code" label="Service Code" rules={[{ required: true, message: 'Đặt ID vào' }]}>
            <Input disabled={!isAdd} className="bg-gray-50 text-gray-500" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: 'Tên dịch vụ là bắt buộc' }]}
          >
            <Input placeholder="e.g. ERP Implementation" />
          </Form.Item>
        </div>

        {/* Row 2: Type and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            name="service_type"
            label="Kiểu dịch vụ"
            rules={[{ required: true, message: 'Chọn một kiểu' }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="ai">Dịch vụ AI</Select.Option>
              <Select.Option value="bi">Dịch vụ BI</Select.Option>
              <Select.Option value="software">Software</Select.Option>
              <Select.Option value="marketing">Dịch vụ Marketing</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select placeholder="Select status">
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="paused">Đã dừng</Select.Option>
              <Select.Option value="closed">Đóng</Select.Option>
            </Select>
          </Form.Item>
        </div>

        {/* Row 3: Start and End Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            name="start_date"
            label="Bắt đầu"
            rules={[{ required: true, message: 'Thời gian bắt đầu' }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="Kết thúc"
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
        </div>

        {/* Row 5: Description */}
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea rows={4} placeholder="Mô tả chi tiết..." />
        </Form.Item>

      </Form>
    </Modal>
  );
}
