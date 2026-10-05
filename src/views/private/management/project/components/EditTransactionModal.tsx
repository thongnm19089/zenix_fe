import React, { useEffect,useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Typography,InputNumber } from 'antd';
import dayjs from 'dayjs';
import { Transaction } from '../PaymentTable';

const { Text } = Typography;

// 2. Component Props
interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreate?: boolean;
  initialData: Transaction | null;
  onSubmit: (values: Partial<Transaction>) => Promise<void>;
  // Options if you allow changing which schedule this transaction belongs to
  availableSchedules?: { id: number; name: string }[]; 
}

export default function EditTransactionModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isCreate,
  availableSchedules = []
}: EditTransactionModalProps) {
  const [form] = Form.useForm();
  const [isLoading, setLoading] = useState(false);

  // 3. Populate form when opened
  useEffect(() => {
    if (isOpen && initialData) {
      form.setFieldsValue({
        ...initialData,
        // Convert API string to Day.js object for the DatePicker
        payment_date: initialData.payment_date ? dayjs(initialData.payment_date) : null,
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
      // Convert the Day.js object back into a standard date string
      const formattedValues = {
        ...values,
        id: initialData?.id,
        payment_date: values.payment_date ? values.payment_date.format('YYYY-MM-DD') : null,
      };

      await onSubmit(formattedValues);
      onClose()
      setLoading(false);
    } catch(info) {
      console.error('Validation Failed:', info);
      message.error('Please complete the required fields.');
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isCreate ? "Thêm giáo dịch" : "Sửa giao dịch" }
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
      okButtonProps={{disabled: isLoading}}
      okText="Lưu"
      cancelText="Thoát"
      width={700}
      confirmLoading={isLoading}
      cancelButtonProps={{disabled: isLoading}}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        
        {/* Context Header: Read-only info so the user knows what they are editing */}
        <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-100 flex flex-col gap-1">
          <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">Payment For</Text>
          <span className="font-semibold text-blue-900 text-base">
            {initialData?.schedule_portal_service_name || 'Không biết dịch vụ'}
          </span>
          <span className="text-sm text-blue-700">
            Period: {initialData?.schedule_period_label || 'N/A'}
          </span>
        </div>

        {/* Row 1: Amount and Payment Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item 
            name="amount" 
            label="Số tiền giao dịch"
            rules={[{ required: true, message: 'Phải nhập tiền' }]}
          >
            <InputNumber
              placeholder="e.g. 5000000.00" 
              addonAfter="VND" 
              disabled={isLoading} 
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
            />
          </Form.Item>

          <Form.Item 
            name="payment_date" 
            label="Ngày trả"
            rules={[{ required: true, message: 'Phải có ngày trả' }]}
          >
            <DatePicker 
              className="w-full" 
              format="DD/MM/YYYY" 
              disabled={isLoading} 
            />
          </Form.Item>
        </div>

        {/* Row 2: Method and Transaction Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item 
            name="method" 
            label="Phương pháp thanh toán"
            rules={[{ required: true, message: 'Chọn phương pháp thanh toán' }]}
          >
            <Select placeholder="Select method" disabled={isLoading}>
              <Select.Option value="bank">Chuyển khoản ngân hàng</Select.Option>
              <Select.Option value="cash">Tiền mặt</Select.Option>
              <Select.Option value="card">Thẻ tín dụng</Select.Option>
              <Select.Option value="other">Phương pháp khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="transaction_code" 
            label="Mã giao dịch"
            extra="Bank reference number or receipt ID"
          >
            <Input placeholder="e.g. FT20394857" disabled={isLoading} />
          </Form.Item>
        </div>

        <Form.Item 
          name="note" 
          label="Ghi chú"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Add any internal details regarding this payment..." 
            disabled={isLoading}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}
