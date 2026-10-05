import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { Option } from 'antd/es/mentions';

interface Project {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    description?: string;
    type?: any;
    status?: any;
}

interface ProjectModalProps {
    visible: boolean;
    isEditMode: boolean;
    project: Project | null;
    projectTypeData: any;
    projectStatusData: any;
    onOk: (values: any) => Promise<void>;
    onCancel: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ visible, isEditMode, project, projectTypeData, projectStatusData, onOk, onCancel }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (project) {
            form.setFieldsValue(project);
        } else {
            form.resetFields();
        }
    }, [project, form]);

    return (
        <Modal
            open={visible}
            title={isEditMode ? 'Chỉnh sửa dự án' : 'Thêm dự án'}
            okText={isEditMode ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            onCancel={onCancel}
            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        form.resetFields();
                        onOk(values);
                    })
                    .catch(info => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="project_form"
                initialValues={project || {}}
            >
                <Form.Item
                    name="name"
                    label="Tên dự án"
                    rules={[{ required: true, message: 'Vui lòng nhập tên dự án!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="start_date"
                    label="Ngày bắt đầu"
                    rules={[{ required: true, message: 'Vui lòng nhập ngày bắt đầu!' }]}
                >
                    <Input type="date" />
                </Form.Item>
                <Form.Item
                    name="end_date"
                    label="Ngày kết thúc"
                    // rules={[{ required: true, message: 'Vui lòng nhập ngày kết thúc!' }]}
                >
                    <Input type="date" />
                </Form.Item>

                <Form.Item
                    name="type"
                    label='Loại dự án'>
                    <Select
                        placeholder='Chọn loại dự án'
                        allowClear
                    >
                        {projectTypeData?.map((type: any) => (
                            <Option key={type.id} value={type.id}>
                                {type.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="status"
                    label='Trạng thái'>
                    <Select
                        placeholder='Chọn trạng thái'
                        allowClear
                    >
                        {projectStatusData?.map((status: any) => (
                            <Option key={status.id} value={status.id}>
                                {status.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProjectModal;