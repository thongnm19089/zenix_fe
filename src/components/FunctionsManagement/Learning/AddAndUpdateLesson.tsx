import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Upload, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/es/upload/interface';
import { useCreateLessonMutation, useUpdateLessonMutation } from '@/api/Learning/apiLearning';
import { useTranslations } from 'next-intl';

const AddAndUpdateLesson = ({
  edit,
  lesson,
  module,
  refetch
}: {
  edit: boolean;
  lesson: any;
  module: any;
  refetch: () => void;
}) => {
  const t: any = useTranslations();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [createLesson, { isLoading: isLoadingAdd }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: isLoadingEdit }] = useUpdateLessonMutation();
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [videoList, setVideoList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (edit && lesson) {
      form.setFieldsValue({
        ...lesson,
      });
      setImageList(
        lesson.image
          ? [{
              uid: '-1',
              name: lesson.image.split('/').pop(),
              status: 'done',
              url: lesson.image,
            }]
          : []
      );
      setVideoList(
        lesson.video
          ? [{
              uid: '-1',
              name: lesson.video.split('/').pop(),
              status: 'done',
              url: lesson.video,
            }]
          : []
      );
    }
  }, [edit, lesson, form]);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('module', module.id);

      if (imageList.length > 0 && imageList[0].originFileObj) {
        formData.append('image', imageList[0].originFileObj);
      }

      if (videoList.length > 0 && videoList[0].originFileObj) {
        formData.append('video', videoList[0].originFileObj);
      }

      if (edit) {
        await updateLesson({ id: lesson.id, data: formData });
      } else {
        await createLesson(formData);
      }
      notification.success({
        message: edit ? t("noficationAddAndUpdate.editLessonSuccess") : t("noficationAddAndUpdate.addLessonSuccess"),
        placement: "bottomRight",
        className: "h-16",
      });
      setVisible(false);
      form.resetFields();
      setImageList([]);
      setVideoList([]);
      refetch(); // Refetch course data after save
    } catch (error) {
      notification.error({
        message: edit ? t("noficationAddAndUpdate.editLessonError") : t("noficationAddAndUpdate.addLessonError"),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
    setImageList([]); // Clear the image file list
    setVideoList([]); // Clear the video file list
  };

  const handleImageChange = ({ fileList }: { fileList: UploadFile[] }) => {
    // Allow only one file
    setImageList(fileList.slice(-1));
  };

  const handleVideoChange = ({ fileList }: { fileList: UploadFile[] }) => {
    // Allow only one file
    setVideoList(fileList.slice(-1));
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {edit ? t("noficationAddAndUpdate.editLesson") : t("noficationAddAndUpdate.addLesson")}
      </Button>
      <Modal
        title={edit ? t("noficationAddAndUpdate.editLesson") : t("noficationAddAndUpdate.addLesson")}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={edit ? isLoadingEdit : isLoadingAdd}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label={t("table.title")} rules={[{ required: true, message: t("form.required") }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label={t("learning.content")} rules={[{ required: true, message: t("form.required") }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="image" label={t("general.image")}>
            <Upload
              listType="picture"
              maxCount={1}
              fileList={imageList}
              onChange={handleImageChange}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined rev={undefined} />}>{t("general.upload")}</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="video" label="Video">
            <Upload
              listType="text"
              maxCount={1}
              fileList={videoList}
              onChange={handleVideoChange}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined rev={undefined} />}>{t("general.upload")}</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddAndUpdateLesson;
