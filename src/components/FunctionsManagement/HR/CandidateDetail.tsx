import { Button, Modal } from "antd";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const CandidateDetail = ({ candidate }: { candidate: any }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const t: any = useTranslations();

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button type="link" onClick={showModal}>
                {candidate.name}
            </Button>
            <Modal
                title={`${t('hr.candidateInfo')} ${candidate.name}`}
                open={isModalOpen}
                footer={null}
                onCancel={handleCancel}
                width={500}
            >
                <div className="grid grid-cols-3 p-3 gap-3 border mt-6  bg-gray-100 border-gray-100">
                    <div className=" text-right font-semibold ">Name:</div>
                    <div className=" col-span-2  ">
                        {candidate.name}
                    </div>
                    <div className="text-right font-semibold ">{t('user.phone')}:</div>
                    <div className="col-span-2  ">
                        <a href={`tel:${candidate.mobile}`} target="_blank">
                            {candidate.mobile}
                        </a>
                    </div>
                    <div className=" text-right font-semibold ">Email:</div>
                    <div className=" col-span-2  ">
                        <a href={`mailto:${candidate.email}`} target="_blank">
                            {candidate.email}
                        </a>
                    </div>
                    <div className=" text-right font-semibold ">YoB:</div>
                    <div className=" col-span-2  ">
                        {candidate.yob}
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default CandidateDetail;