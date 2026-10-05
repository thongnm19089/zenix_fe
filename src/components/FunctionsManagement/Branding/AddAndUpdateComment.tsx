import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, notification } from 'antd';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
});
import 'react-quill/dist/quill.snow.css';

// Giả sử các mutation từ RTK Query được import tương tự như ví dụ trước
import { useCreateCommentsMutation, useEditCommentsMutation } from "@/api/Branding/apiBranding";

interface AddAndUpdateCommentProps {
    postId: string;  // Hoặc number, tùy thuộc vào ID post được quản lý như thế nào
    initialComment?: string;
    commentId?: string | number | null;  // Update this to string | number if using TypeScript
    useModal?: boolean;
    refetch?: () => void;  // Function to trigger data refetching
}

function AddAndUpdateComment({ postId, initialComment = '', commentId = null, useModal = false, refetch }: AddAndUpdateCommentProps) {
  const [comment, setComment] = useState(initialComment);
  const [visible, setVisible] = useState(false);
  const [createComment] = useCreateCommentsMutation();
  const [editComment] = useEditCommentsMutation();

  // Thiết lập bình luận ban đầu khi chỉnh sửa
  useEffect(() => {
    setComment(initialComment);
  }, [initialComment]);

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    setComment(initialComment);  // Reset comment when closing modal
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      notification.error({ message: 'Cannot submit empty comment' });
      return;
    }

    const data = { post: postId, content: comment };
    const action = commentId ? () => editComment({ commentId, ...data }) : () => createComment(data);

    try {
      await action();
      notification.success({
        message: `Comment ${commentId ? 'updated' : 'added'} successfully!`
      });
      setComment('');  // Clear comment after successful submission
      if (refetch) refetch(); // Call refetch to reload data if provided
      if (useModal) hideModal();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: `Failed to ${commentId ? 'update' : 'add'} comment. Please try again later.`
      });
    }
  };

  const commentForm = (
    <Form layout="vertical" onFinish={handleSubmit}>
      <Form.Item label={`${commentId ? 'Edit' : 'Add'} Comment`}>
        <ReactQuill theme="snow" value={comment} onChange={setComment} placeholder="Write something..." />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {commentId ? 'Update Comment' : 'Submit Comment'}
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <>
      {useModal ? (
        <>
          <Button type="primary" onClick={showModal} style={{ marginTop: "4px", width: "100%", borderRadius: "8px" }}>
            {commentId ? 'Edit Comment' : 'Add Comment'}
          </Button>
          <Modal title={`${commentId ? 'Edit' : 'Add'} Comment`} open={visible} onOk={handleSubmit} onCancel={hideModal}>
            {commentForm}
          </Modal>
        </>
      ) : (
        <div>{commentForm}</div>
      )}
    </>
  );
}

export default AddAndUpdateComment;
