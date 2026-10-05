import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Select, DatePicker, notification } from 'antd';
import { useCreateEnrollmentMutation, useUpdateEnrollmentMutation } from '@/api/Learning/apiLearning';
import { useGetSetUpLearningQuery } from '@/api/Learning/apiLearning';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

const AddAndUpdateStudent = ({
  edit,
  enrollment,
  courseId,
  refetch,
  studentList // Pass the student list from the parent component
}: {
  edit: boolean;
  enrollment: any;
  courseId: number;
  refetch: () => void;
  studentList: any[]; // Assume this is passed from the parent, containing the current students
}) => {
  const t: any = useTranslations();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [createEnrollment, { isLoading: isLoadingAdd }] = useCreateEnrollmentMutation();
  const [updateEnrollment, { isLoading: isLoadingEdit }] = useUpdateEnrollmentMutation();
  const { data: setupData } = useGetSetUpLearningQuery({});
  const [savedFormValues, setSavedFormValues] = useState(null);

  useEffect(() => {
    if (edit && enrollment) {
      form.setFieldsValue({
        student: enrollment.user,
        start_date: enrollment.start_date ? dayjs(enrollment.start_date) : null,
        end_date: enrollment.end_date ? dayjs(enrollment.end_date) : null,
      });
    }
  }, [edit, enrollment, form]);

  const showModal = () => {
    setVisible(true);
    if (savedFormValues) {
      form.setFieldsValue(savedFormValues);
    } else if (edit && enrollment) {
      form.setFieldsValue({
        student: enrollment.user,
        start_date: enrollment.start_date ? dayjs(enrollment.start_date) : null,
        end_date: enrollment.end_date ? dayjs(enrollment.end_date) : null,
      });
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        course: courseId,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      };

      if (edit) {
        await updateEnrollment({ id: enrollment.id, data: { ...payload, user: values.student } });
        notification.success({
          message: t("noficationAddAndUpdate.editStudentSuccess"),
          placement: 'bottomRight',
        });
      } else {
        const selectedStudents = values.students;
        if (selectedStudents && selectedStudents.length > 0) {
          await createEnrollment({
            users: selectedStudents,
            course: courseId,
            start_date: payload.start_date,
            end_date: payload.end_date,
          });
          notification.success({
            message: t("noficationAddAndUpdate.addStudentSuccess"),
            placement: 'bottomRight',
          });
        } else {
          notification.error({
            message: 'Vui lòng chọn ít nhất một học sinh',
            placement: 'bottomRight',
          });
        }
      }

      setVisible(false);
      form.resetFields();
      refetch();
      setSavedFormValues(null); // Clear saved values on successful submission
    } catch (error) {
      notification.error({
        message: edit ? t("noficationAddAndUpdate.editStudentError") : t("noficationAddAndUpdate.addStudentError"),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const handleCancel = () => {
    setSavedFormValues(form.getFieldsValue()); // Save form values before closing
    setVisible(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {edit ? t("noficationAddAndUpdate.editStudent") : t("noficationAddAndUpdate.addStudent")}
      </Button>
      <Modal
        title={edit ? t("noficationAddAndUpdate.editStudent") : t("noficationAddAndUpdate.addStudent")}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={edit ? isLoadingEdit : isLoadingAdd}
      >
        <Form form={form} layout="vertical">
          {!edit ? (
            <Form.Item name="students" label={t("learning.student")} rules={[{ required: true, message: t("learning.selectAStudent") }]}>
              <Select mode="multiple" placeholder={t("learning.selectStudent")}>
                {setupData?.employee_list
                  ?.filter(
                    (employee: any) =>
                      !studentList.some((student: any) => student.student_info.id === employee.id)
                  )
                  .map((employee: any) => (
                    <Select.Option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} ({employee.username})
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          ) : (
              <Form.Item name="student" label={t("learning.student")} rules={[{ required: true, message: t("learning.selectAStudent") }]}>
                <Select placeholder={t("learning.selectStudent")}>
                {setupData?.employee_list?.map((employee: any) => (
                  <Select.Option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name} ({employee.username})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item name="start_date" label={t("general.startDate")}>
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="end_date" label={t("general.endDate")}>
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddAndUpdateStudent;
