import { SellerDebtPaymentPlan } from "./CreateSellerDebtPayment";
import { useDeletePaymentSellerMutation } from "@/api/Finance/apiPayment";
import { formatMoney } from "@/utils/common";
import { Button, Modal, Popconfirm, Space, Table, Tag, notification } from "antd";
import { ColumnsType } from "antd/lib/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface DataType {
    key: string;
    id: number;
    is_plan: boolean;
    payment_amount: number;
    payment_date: any;
    account_choice: number;
}

function paymentDatePlan(paymentList: { payment_date: string; is_plan: boolean }[] | null | undefined) {
    if (!paymentList || paymentList.length === 0) {
        return null;
    }
    const sortedData = [...paymentList].sort(
        (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );

    const foundItemWithPlanTrue = sortedData.find((item) => item.is_plan === true);
    if (foundItemWithPlanTrue) {
        return foundItemWithPlanTrue;
    }

    const foundItemWithPlanFalse = sortedData.find((item) => item.is_plan === false);
    return foundItemWithPlanFalse || null;
}

function isCheckTimePaymentDate(dateStr: string) {
    let providedDate = new Date(dateStr);
    providedDate.setHours(providedDate.getHours() + 23);
    providedDate.setMinutes(providedDate.getMinutes() + 59);
    providedDate.setSeconds(providedDate.getSeconds() + 59);
    let currentDate = new Date();

    return providedDate < currentDate;
}

const DetailDebtPayment = ({ paymentList, refetch }: { paymentList: any; refetch: any }) => {
    const [open, setOpen] = useState(false);
    const checkPaymentDate = paymentDatePlan(paymentList);

    const [deleteCost, { isLoading: isLoadingDelete }] = useDeletePaymentSellerMutation();
    const t: any = useTranslations();
    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
    };
    const columns: ColumnsType<DataType> = [
        {
            title: "Ngày thanh toán",
            dataIndex: "payment_date",
            key: "payment_date",
            render: (text) => <div>{dayjs(text).format("DD/MM/YYYY")}</div>,
            width: 130,
        },
        {
            title: "Số tiền thanh toán",
            dataIndex: "payment_amount",
            key: "payment_amount",
            render: (text) => <div className="text-right">{formatMoney(text)}đ</div>,
            width: 150,
        },
        {
            title: "Trạng thái",

            render: (_, { is_plan, payment_date }) => (
                <div>
                    {!is_plan && (
                        <Tag color="#87d068" className="w-full">
                            Đã thanh toán
                        </Tag>
                    )}
                    {is_plan && isCheckTimePaymentDate(payment_date) && (
                        <Tag color="#f50" className="w-full">
                            Quá hạn thanh toán
                        </Tag>
                    )}
                    {is_plan && !isCheckTimePaymentDate(payment_date) && (
                        <Tag color="rgb(234 179 8)" className="w-full">
                            Dự kiến thanh toán
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: `${t("table.action")}`,
            dataIndex: "",
            key: "x",
            width: 120,
            render: (_, { id, is_plan, payment_amount, payment_date, account_choice }) => (
                <div className="flex gap-2">
                    <Popconfirm
                        title={t("table.actionValues.title")}
                        description={t("table.actionValues.jobDescription")}
                        onConfirm={() => onDelete(id)}
                        onCancel={cancel}
                        okText={t("general.confirm")}
                        cancelText={t("table.actionValues.canceltext")}
                        placement="left"
                        okButtonProps={{ loading: isLoadingDelete }}
                    >
                        <Button danger>{t("general.delete")}</Button>
                    </Popconfirm>
                    {is_plan && (
                        <SellerDebtPaymentPlan
                            paymentSellerId={id}
                            paymentAmount={payment_amount}
                            paymentDate={payment_date}
                            accountChoice={account_choice}
                            refetch={refetch}
                        />
                    )}
                </div>
            ),
        }
    ];

    const onDelete = async (paymentSellerId: any) => {
        try {
            await deleteCost({ paymentSellerId });
            refetch();
            notification.success({
                message: `Xóa thanh toán công nợ thành công`,
                placement: "bottomRight",
                className: "h-16",
            });
        } catch (error) {
            console.error('Error deleting payment:', error);
            notification.error({
                message: `Xóa thanh toán công nợ thất bại`,
                placement: "bottomRight",
                className: "h-16",
            });
        }
    };
    const cancel = () => { };

    return (
        <>
            {checkPaymentDate && (
                <Tag
                    onClick={showModal}
                    className={` ${!checkPaymentDate.is_plan
                        ? "bg-green-500"
                        : isCheckTimePaymentDate(checkPaymentDate.payment_date)
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        } text-white py-1 px-2`}
                >
                    {checkPaymentDate.payment_date}
                </Tag>
            )}
            <Modal open={open} title="Title" onOk={handleOk} onCancel={handleCancel} footer={null} width={700}>
                <Table columns={columns} dataSource={paymentList} />
            </Modal>
        </>
    );
};

export default DetailDebtPayment;
