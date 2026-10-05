import React, { useState, useEffect } from "react";
import { Button, Form, Upload, notification, Select, DatePicker, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});
import "react-quill/dist/quill.snow.css";

const { Option } = Select;

import {
  useCreateAdminProcessMutation,
  useUpdateUserRequestForAdminMutation,
} from "@/api/CustomerService/apiCustomerService";
import { useAvailableFunctionsQuery } from "@/api/SetUp/apiFunction";
import { useGetUserMcsQuery } from "@/api/SetUp/apiAccount";

interface AddAndUpdateAdminProcessProps {
  requestId: number;
  initialProcess?: string;
  processId?: number | null;
  useModal?: boolean;
  refetch?: () => void;
  request: any | null;
  onCloseDrawer?: () => void;
}

const AddAndUpdateAdminProcess: React.FC<AddAndUpdateAdminProcessProps> = ({
  requestId,
  initialProcess = "",
  processId = null,
  useModal = false,
  refetch,
  request,
  onCloseDrawer
}) => {
  const [process, setProcess] = useState(initialProcess);
  const [fileList, setFileList] = useState<File[]>([]);
  const [imageList, setImageList] = useState<File[]>([]);
  const [visible, setVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const [createAdminProcess] = useCreateAdminProcessMutation();
  // State for Select and DatePicker values
  const [statusRequest, setStatusRequest] = useState(request.status);

  useEffect(() => {
    setProcess(initialProcess);
  }, [initialProcess]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log('status ', statusRequest)
      // Tạo process mới
      await createAdminProcess({
        user_request: requestId,
        feedback: process,
        newStatus: statusRequest, // Dùng trạng thái từ request để cập nhật process
        process_images: imageList,
        process_files: fileList,
      }).unwrap();
      if (statusRequest != 'pending' && statusRequest != 'in_progress') {
        onCloseDrawer?.();
      }
      if (refetch) refetch();
      notification.success({
        message: "Cập nhật thành công!",
      });

      setProcess("");
      setFileList([]);
      setImageList([]);
      if (useModal) setVisible(false);
    } catch (error) {
      notification.error({
        message: "Cập nhật thất bại!",
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  const processForm = (
    <Form layout="vertical" onFinish={handleSubmit}>
      {/* Select for status */}
      <Form.Item label="Trạng thái"
        rules={[
          { required: true, message: "Vui lòng chọn trạng thái!" }, // Bắt buộc chọn trạng thái
        ]}>
        <Select
          value={statusRequest}
          onChange={(value) => setStatusRequest(value)}
          placeholder="Chọn trạng thái"
        >
          <Select.Option value="pending">Chờ xử lý</Select.Option>
          <Select.Option value="in_progress">Đang xử lý</Select.Option>
          <Select.Option value="completed">Hoàn thành</Select.Option>
          <Select.Option value="on_hold">Tạm hoãn</Select.Option>
          <Select.Option value="invalid">Không hợp lệ</Select.Option>
        </Select>
      </Form.Item>
      {/* Quill editor for process feedback */}
      <Form.Item label="Phản hồi quy trình"
        rules={[
          { required: true, message: "Vui lòng nhập phản hồi quy trình!" }, // Bắt buộc nhập feedback
        ]}>
        <ReactQuill
          theme="snow"
          value={process}
          onChange={setProcess}
          placeholder="Nhập phản hồi quy trình..."
        />
      </Form.Item>

      {/* Upload for images */}
      <Form.Item label="Tải lên hình ảnh">
        <Upload
          fileList={imageList.map((file) => ({ uid: file.name, name: file.name }))}
          beforeUpload={(file) => {
            setImageList((prev) => [...prev, file]);
            return false;
          }}
          onRemove={(file) => {
            setImageList((prev) => prev.filter((f) => f.name !== file.name));
          }}
          accept="image/*"
          multiple
        >
          <Button icon={<UploadOutlined rev={undefined} />}>Chọn hình ảnh</Button>
        </Upload>
      </Form.Item>

      {/* Upload for files */}
      <Form.Item label="Tải lên tệp">
        <Upload
          fileList={fileList.map((file) => ({ uid: file.name, name: file.name }))}
          beforeUpload={(file) => {
            setFileList((prev) => [...prev, file]);
            return false;
          }}
          onRemove={(file) => {
            setFileList((prev) => prev.filter((f) => f.name !== file.name));
          }}
          multiple
        >
          <Button icon={<UploadOutlined rev={undefined} />}>Chọn tệp</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Tạo
        </Button>
      </Form.Item>
    </Form>
  );
  return (
    <>
      {useModal ? (
        <>
          <Button type="primary" onClick={() => setVisible(true)}>
            {processId ? "Edit Process" : "Thêm tiến trình"}
          </Button>
          <Modal
            title={`${processId ? "Edit" : "Thêm"} Tiến Trình`}
            visible={visible}
            onCancel={() => setVisible(false)}
            footer={null}
            width={800}
          >
            {processForm}
          </Modal>
        </>
      ) : (
        <div>{processForm}</div>
      )}
    </>
  );
};

export default AddAndUpdateAdminProcess;
