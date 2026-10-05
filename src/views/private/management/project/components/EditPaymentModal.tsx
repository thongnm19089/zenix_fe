import React, { useEffect,useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, message, Typography, Progress, Tag } from 'antd';
import dayjs from 'dayjs';
import { PaymentSchedule } from '../PaymentTable';

const { Text } = Typography;

interface EditPaymentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: PaymentSchedule | null;
  onSubmit: (values: Partial<PaymentSchedule>) => Promise<void>;
  isCreating?: boolean;
  availableServices?: { id: number; name: string }[];
  availablePackages?: { id: number; name: string }[];
}

export default function EditPaymentScheduleModal({
  isOpen,
  onClose,
  initialData,
  isCreating,
  onSubmit,
  availableServices = [],
  availablePackages = []
}: EditPaymentScheduleModalProps) {
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);

  // 3. Populate form when opened
  useEffect(() => {
    if (isOpen && initialData) {
      form.setFieldsValue({
        ...initialData,
        // Convert the string due_date to a Day.js object
        due_date: initialData.due_date ? dayjs(initialData.due_date) : null,
      });
    } else if (!isOpen) {
      form.resetFields();
    }
  }, [isOpen, initialData, form]);

  // 4. Handle Form Submission
  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields()
      const formattedValues = {
        ...values,
        id: initialData?.id,
        // Convert Day.js back to API string format
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
        // Ensure the amount is sent back as a clean string without commas
        amount: values.amount.toString(), 
      };
      await onSubmit(formattedValues);
      onClose()
      setLoading(false);
    } catch(info) {
      console.error('Validation Failed:', info);
      //@ts-ignore
      if (info?.data?.non_field_errors) {
        //@ts-ignore
        for (const error of info?.data?.non_field_errors) {
          message.error('Error: ' + error);
        }
      } else {
        message.error('Please complete the required fields.');
      }
      setLoading(false);
    }
  };

  // Helper to calculate the visual progress bar
  const totalAmount = parseFloat(initialData?.amount || '0');
  const paidAmount = parseFloat(initialData?.paid_amount || '0');
  const percentPaid = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <Modal
      title={isCreating ? "Thêm lịch giao dịch" : "Sửa lịch dao dịch"}
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      okText="Lưu"
      cancelText="Thoát"
      width={750}
      confirmLoading={isLoading}
      destroyOnClose
      cancelButtonProps={{disabled: isLoading}}
    >
      <Form form={form} layout="vertical" className="mt-4">
        
        {/* Financial Context Header: Read-only summary of the payment status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">Collection Progress</Text>
              <div className="text-lg font-bold text-gray-800 mt-1">
                {paidAmount.toLocaleString('vi-VN')} / {totalAmount.toLocaleString('vi-VN')} VND
              </div>
            </div>
            {percentPaid >= 100 ? (
              <Tag color="success">FULLY PAID</Tag>
            ) : (
              <Tag color="processing">PENDING BALANCE</Tag>
            )}
          </div>
          <Progress 
            percent={percentPaid} 
            status={percentPaid >= 100 ? 'success' : 'active'} 
            strokeColor={percentPaid >= 100 ? '#52c41a' : '#1890ff'}
          />
        </div>

        {/* Row 1: Period Label and Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item 
            name="period_label" 
            label="Chu kỳ"
            rules={[{ required: true, message: 'Period label is required' }]}
          >
            <Input placeholder="e.g. Q1/2026, Phí duy trì tháng 4..." disabled={isLoading} />
          </Form.Item>

          <Form.Item 
            name="due_date" 
            label="Hạn"
            rules={[{ required: true, message: 'Hạn là bắt buộc' }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" disabled={isLoading} />
          </Form.Item>
        </div>

        {/* Row 2: Amount and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item 
            name="amount" 
            label="Số tền"
            rules={[{ required: true, message: 'Amount is required' }]}
          >
            <InputNumber 
              className="w-full"
              disabled={isLoading}
              addonAfter="VND"
              // Automatically adds commas while typing (e.g. 5,000,000)
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              // Strips the commas out before saving the value to the form state
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
            />
          </Form.Item>

          <Form.Item 
            name="status" 
            label="Trạng thái"
            rules={[{ required: true, message: 'Status is required' }]}
          >
            <Select placeholder="Select status" disabled={isLoading}>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="partial">Partially Paid</Select.Option>
              <Select.Option value="paid">Fully Paid</Select.Option>
              <Select.Option value="overdue">Overdue</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item 
            name="paid_amount" 
            label="Đã trả" 
            rules={[{ required: true, message: 'Amount is required' }]}
          >
            <InputNumber 
              className="w-full"
              disabled={isLoading}
              addonAfter="VND"
              // Automatically adds commas while typing (e.g. 5,000,000)
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              // Strips the commas out before saving the value to the form state
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
            />
          </Form.Item>
        </div>

        {/* Row 4: Note */}
        <Form.Item 
          name="note" 
          label="Ghi chú"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Thêm ghi chú..." 
            disabled={isLoading}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}
