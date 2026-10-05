import { useCreateTypeBoardMutation, useEditTypeBoardMutation, useGetTypeBoardListQuery } from '@/api/Task/apiTask';
import { Button, Form, Input, Modal, notification } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

export default function AddAndUpdateType({
    edit,
    typeBoardId,
    open,
    setOpen,
}: {
    edit?: boolean,
    typeBoardId?: number,
    open?: boolean,
    setOpen: (value: boolean) => void,
}) {
    const t: any = useTranslations();
    const [form] = Form.useForm();
    const { data: typeBoardList } = useGetTypeBoardListQuery();
    const [createTypeBoard, { isLoading: isLoadingAdd }] = useCreateTypeBoardMutation();
    const [editTypeBoard, { isLoading: isLoadingEdit }] = useEditTypeBoardMutation();

    useEffect(() => {
        if (edit && typeBoardList && typeBoardId) {
            const typeToEdit = typeBoardList.results.find((type: { id: number }) => type.id === typeBoardId);
            if (typeToEdit) {
                form.setFieldsValue({
                    name: typeToEdit.name,
                    description: typeToEdit.description,
                });
            }
        }
    }, [edit, typeBoardList, typeBoardId]);

    const onFinish = async (values: any) => {
        if (edit) {
            const result = await editTypeBoard({
                typeBoardId,
                name: values.name,
                description: values.description,
            });
            if (result && "error" in result) {
                notification.error({
                    message: "Sửa type lỗi",
                    placement: "bottomRight",
                    className: "h-16",
                });
            } else {
                notification.success({
                    message: "Sửa type thành công",
                    placement: "bottomRight",
                    className: "h-16",
                });
            }
        } else {
            const result = await createTypeBoard({
                name: values.name,
                description: values.description,
            });
            if (result && "error" in result) {
                notification.error({
                    message: "Thêm mới type lỗi",
                    placement: "bottomRight",
                    className: "h-16",
                });
            } else {
                notification.success({
                    message: "Thêm mới type thành công",
                    placement: "bottomRight",
                    className: "h-16",
                });
            }
        }
        setOpen(false);
    };

    return (
        <>
            {/* <Button type="primary" onClick={showModal} size={edit ? "small" : "middle"} className={edit ? "bg-teal-600 hover:!bg-teal-500" : ""}>
                {edit ? "Sửa Type" : "Tạo mới Type"}
            </Button> */}
            <Modal title={edit ? "Sửa Type" : "Thêm mới Type"} visible={open} footer={null} onCancel={() => setOpen(false)}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="Tên type">
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả type">
                        <Input.TextArea />
                    </Form.Item>
                    <div className="flex justify-end gap-2">
                        <Button type="primary" htmlType="submit" className=" mb-2" loading={edit ? isLoadingEdit : isLoadingAdd}>
                            {t("general.confirm")}
                        </Button>
                        <Button onClick={() => setOpen(false)}>{t("general.cancel")}</Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
}