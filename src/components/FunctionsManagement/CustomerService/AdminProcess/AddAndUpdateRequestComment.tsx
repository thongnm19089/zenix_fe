import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Upload, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
});
import 'react-quill/dist/quill.snow.css';

import { useCreateRequestCommentMutation, useUpdateRequestCommentMutation } from "@/api/CustomerService/apiCustomerService";

interface AddAndUpdateRequestCommentProps {
  requestId: number;
  initialComment?: string;
  commentId?: number | null;
  useModal?: boolean;
  refetch?: () => void;
}

function AddAndUpdateRequestComment({
  requestId,
  initialComment = '',
  commentId = null,
  useModal = false,
  refetch,
}: AddAndUpdateRequestCommentProps) {
  const [comment, setComment] = useState(initialComment);
  const [fileList, setFileList] = useState<File[]>([]);
  const [imageList, setImageList] = useState<File[]>([]);
  const [visible, setVisible] = useState(false); // Phần visible
  const [loading, setLoading] = useState(false); // Trạng thái đang tải
  const [createRequestComment] = useCreateRequestCommentMutation();
  const [updateRequestComment] = useUpdateRequestCommentMutation();

  useEffect(() => {
    setComment(initialComment);
  }, [initialComment]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      notification.error({ message: 'Không thể gửi bình luận trống' });
      return;
    }

    setLoading(true); // Bắt đầu tải khi gửi

    const action = 
      () => createRequestComment({ user_request: requestId, content: comment, comment_images: imageList, comment_files: fileList });  // Thêm bình luận mới

    try {
      await action();
      notification.success({
        message: `Bình luận đã được ${commentId ? 'cập nhật' : 'thêm'} thành công!`,
      });
      setComment('');
      setFileList([]);
      setImageList([]);
      if (refetch) refetch();  // Gọi lại refetch nếu có
      if (useModal) setVisible(false);  // Đóng modal nếu có
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: `Không thể ${commentId ? 'cập nhật' : 'thêm'} bình luận. Vui lòng thử lại sau.`,
      });
    } finally {
      setLoading(false); // Dừng tải sau khi gửi xong
    }
  };

  const commentForm = (
    <Form layout="vertical" onFinish={handleSubmit}>
      <Form.Item label="Bình luận">
        <ReactQuill theme="snow" value={comment} onChange={setComment} placeholder="Viết bình luận..." />
      </Form.Item>

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
          <Button icon={<UploadOutlined rev={undefined} />}>Nhấn để tải lên hình ảnh</Button>
        </Upload>
      </Form.Item>

      <Form.Item label="Tải lên tệp tin">
        <Upload
          fileList={fileList.map((file) => ({ uid: file.name, name: file.name }))}
          beforeUpload={(file) => {
            setFileList((prev) => [...prev, file]);
            return false;  // Không tự động upload
          }}
          onRemove={(file) => {
            setFileList((prev) => prev.filter((f) => f.name !== file.name));
          }}
          multiple
        >
          <Button icon={<UploadOutlined rev={undefined} />}>Nhấn để tải lên tệp</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className='mt-1' loading={loading}>
          {commentId ? 'Cập nhật bình luận' : 'Gửi bình luận'}
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <>
      {useModal ? (
        <>
          <Button type="primary" onClick={() => setVisible(true)}>
            {commentId ? 'Chỉnh sửa bình luận' : 'Thêm bình luận'}
          </Button>
          <Modal title={`${commentId ? 'Chỉnh sửa' : 'Thêm'} bình luận`} visible={visible} onCancel={() => setVisible(false)} footer={null}>
            {commentForm}
          </Modal>
        </>
      ) : (
        <div>{commentForm}</div>
      )}
    </>
  );
}

export default AddAndUpdateRequestComment;
