
import {
    useCreateApplicationNoteMutation,
    useDeleteApplicationNoteMutation,
    useEditApplicationNoteMutation,
    useGetApplicationNoteQuery
} from "@/api/HR/apiHRApp";
import { Button, Form, Input, Modal, Popconfirm, Steps, Tag, notification } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useMemo, useState, useEffect } from "react";
import { AiOutlineEdit } from "react-icons/ai";


const UpdateApplicationNote = ({
    applicationId,
    title,
    applicationNote,
    refetch,
}: {
    applicationId?: number | null | undefined;
    applicationNote: any[];
    title: string;
    refetch: any
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpenNote, setIsOpenNote] = useState(false);
    const [followerId, setFollowerId] = useState(null);
    const [userObject, setUserObject] = useState<any>(null);
    const [form] = Form.useForm();
    const t: any = useTranslations();

    const [createApplicationNote, { isLoading: isLoadingCreateNote }] = useCreateApplicationNoteMutation();
    const [editApplicationNote, { isLoading: isLoadingEditNote }] = useEditApplicationNoteMutation();
    const [deleteApplicationNote, { isLoading: isLoadingDeleteNote }] = useDeleteApplicationNoteMutation();

    const { data: applicationNoteData } = useGetApplicationNoteQuery(
        { applicationNoteId: applicationId },
        {
            skip: isOpenNote && applicationId ? false : true,
        }
    );

    const onClickEdit = (id: any) => {
        setIsOpenNote(true);
        setFollowerId(id);
    };

    const followList = useMemo(() => {
        return [
            ...applicationNote
                .map((item) => ({
                    description: (
                        <div>
                            <div>
                                {dayjs(item.created).format("HH:mm")} - {dayjs(item.created).format("DD/MM/YYYY")}{" "}
                                <Button type="text" icon={<AiOutlineEdit />} onClick={() => onClickEdit(item.id)} />
                            </div>
                            <div>
                                {item.user_str}: {item.note}
                            </div>
                        </div>
                    ),
                }))
                .reverse(),
        ];
    }, [applicationNote, onClickEdit]);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setIsOpenNote(false);
    };

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUserObject(JSON.parse(userData));
        }
    }, []);

    useEffect(() => {
        if (followerId) {
            form.setFieldsValue({
                note: applicationNoteData?.results?.map((item: any) => item.id === followerId ? String(item?.note) : "")
            })
        } else {
            form.resetFields();
        }
    }, [followerId, followList]);

    const onFinish = async (values: any) => {
        const body = {
            note: values.note,
            user: userObject?.user_profile?.company?.user,
            application: applicationId
        };

        try {
            const result = await createApplicationNote(body);
            if (result && "error" in result) {
                notification.error({
                    message: `${t("noficationAddAndUpdate.createLeadFollowerError")}`,
                    placement: "bottomRight",
                    className: "h-16",
                });
            } else {
                refetch();
                form.resetFields();
                setIsOpenNote(false);
                notification.success({
                    message: `${t("noficationAddAndUpdate.createLeadFollowerSuccess")}`,
                    placement: "bottomRight",
                    className: "h-16",
                });
            }
        } catch (error) {
            console.log(error);
            setIsModalOpen(true);
        }
    };

    const onEdit = async (values: any) => {
        const body = {
            id: followerId,
            note: values.note,
        };

        try {
            const result = await editApplicationNote(body);
            if (result && "error" in result) {
                notification.error({
                    message: `${t("noficationAddAndUpdate.editApplicationNoteError")}`,
                    placement: "bottomRight",
                    className: "h-16",
                });
            } else {
                refetch();
                form.resetFields();
                setIsOpenNote(false);
                notification.success({
                    message: `${t("noficationAddAndUpdate.editApplicationNoteSuccess")}`,
                    placement: "bottomRight",
                    className: "h-16",
                });
            }
        } catch (error) {
            console.log(error);
            setIsModalOpen(true);
        }
    };

    const onDelete = async (leadFollowerId: number) => {
        try {
            await deleteApplicationNote(leadFollowerId);
            notification.success({
                message: `${t("noficationDelete.applicationNoteSuccess")}`,
                placement: "bottomRight",
                className: "h-16",
            });
            refetch();
            setIsOpenNote(false);
        } catch (error) {
            notification.error({
                message: `${t("noficationDelete.applicationNoteError")}`,
                placement: "bottomRight",
                className: "h-16",
            });
        }
    };

    const cancel = () => { };

    return (
        <>
            <div className="w-full h-full" onClick={showModal}>
                {title}
            </div>
            <Modal
                title={
                    <div className="text-2xl text-center font-semibold">
                        {isOpenNote
                            ? followerId
                                ? `${t("noficationAddAndUpdate.editStatus")}`
                                : `${t("noficationAddAndUpdate.addStatus")}`
                            : `${t("crm.contactHistory")}`}
                    </div>
                }
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                {followerId && isOpenNote && applicationNote.length > 0 && (
                    <Popconfirm
                        title={t("noficationDelete.customerTitle")}
                        description={t("noficationDelete.customerDescription")}
                        onConfirm={() => onDelete(followerId)}
                        onCancel={cancel}
                        okText={t("general.confirm")}
                        cancelText={t("general.close")}
                        placement="left"
                        okButtonProps={{ loading: isLoadingDeleteNote }}
                    >
                        <Button danger>{t("general.delete")}</Button>
                    </Popconfirm>
                )}
                {isOpenNote ? (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={followerId ? onEdit : onFinish}
                        className="mt-5"
                    >

                        <Form.Item name="note" label={t("general.note")}>
                            <Input.TextArea />
                        </Form.Item>
                        <Button block type="primary" onClick={() => form.submit()} loading={isLoadingEditNote}>
                            {t("general.confirm")}
                        </Button>
                        <Button block onClick={() => setIsOpenNote(false)} className="my-2" loading={isLoadingCreateNote}>
                            {t("general.back")}
                        </Button>
                        <Button danger block onClick={handleCancel}>
                            {t("general.close")}
                        </Button>
                    </Form>
                ) : (
                    <>
                        <Steps
                            progressDot
                            current={followList?.length}
                            direction="vertical"
                            className="mt-6 mb-3"
                            items={followList}
                        />
                        <Button
                            type="primary"
                            block
                            onClick={() => {
                                setIsOpenNote(true), setFollowerId(null);
                            }}
                        >
                            + Thêm ghi chú
                        </Button>{" "}
                        <Button block onClick={handleCancel} className="mt-2">
                            {t("general.close")}
                        </Button>
                    </>
                )}
            </Modal>
        </>
    );
};

export default UpdateApplicationNote;
