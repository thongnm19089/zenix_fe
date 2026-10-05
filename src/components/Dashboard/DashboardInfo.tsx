import DetailTable from "./DetailTable";
import { formatMoney } from "@/utils/common";
import { Modal, Table } from "antd";
import React, { useState } from "react";

function DashboardInfo({
    title,
    titleTable,
    statisticsMoney,
    statistics,
    statisticsCardList,
    icon,
}: {
    title: string;
    titleTable?: string;
    statisticsMoney?: number;
    statistics?: number;
    statisticsCardList?: any;
    icon: any;
}) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        if (statisticsCardList && statisticsCardList.length > 0) {
            setIsModalVisible(true);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div style={{ backgroundColor: '#6ca1f9' }} className="relative flex flex-col min-w-0 mb-6 break-words bg-grey shadow-soft-xl  rounded-2xl bg-clip-border pe-5">
            <div className="flex-auto p-4" onClick={showModal}>
                <div className="flex flex-wrap -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                        <div>
                            <p className="mb-1 font-sans font-semibold leading-normal text-white text-sm text-slate-400">{title}</p>
                            <h5 className="mb-0 font-bold">
                                {statisticsMoney ? formatMoney(statisticsMoney) + "đ" : statistics}
                                {/* <span className="leading-normal text-sm font-weight-bolder text-lime-500 ml-2">+55%</span> */}
                            </h5>
                        </div>
                    </div>
                    <div className="w-4/12 max-w-full px-3 ml-auto text-right flex-0">
                        <div className="inline-block w-12 h-12 text-center rounded-lg bg-primary/70 shadow-soft-2xl">
                            <div className="flex justify-center items-center mt-3 invert text-2xl">{icon}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal để hiển thị thông tin chi tiết */}
            {isModalVisible && (
                <Modal title={titleTable} open={isModalVisible} onCancel={handleCancel} footer={null} width={800}>
                    <DetailTable cardList={statisticsCardList} />
                </Modal>
            )}
        </div>
    );
}

export default DashboardInfo;
