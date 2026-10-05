import { Button, Modal } from "antd";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const SupplierDetail = ({ supplier }: { supplier: any }) => {
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
            <Button type="link" onClick={showModal} className="p-0">
                {supplier?.supplier_info?.name}
            </Button>
            <Modal
                title={`${t('crm.infoCustomer')} ${supplier?.supplier_info?.name}`}
                open={isModalOpen}
                footer={null}
                onCancel={handleCancel}
                width={500}
            >
                <div className="grid grid-cols-3 p-2 gap-3 border mt-6  bg-gray-100 border-gray-100">
                    {/* số điện thoại */}
                    <div className="text-right font-semibold mt-1">{t('user.phone')}:</div>
                    <div className="col-span-2 mt-1 pe-2">
                        <a href={`tel:${supplier?.supplier_info?.mobile}`} target="_blank">
                            {supplier?.supplier_info?.mobile}
                        </a>
                    </div>

                    {/* mã số thuế */}
                    <div className=" text-right font-semibold mt-1">{t('procurement.TaxCode')}:</div>
                    <div className=" col-span-2 mt-1 pe-2">
                        {supplier?.supplier_info?.MST}
                    </div>

                    {/* địa chỉ */}
                    {supplier?.supplier_info?.address && (
                        <>
                            <div className="text-right font-semibold mt-1">{t('user.address')}:</div>
                            <div className="col-span-2 mt-1 pe-2">
                                {supplier?.supplier_info?.address}
                            </div>
                        </>
                    )}

                    {/* thông tin chuyển khoản */}
                    {supplier?.supplier_info?.banking_account && (
                        <div className="text-right font-semibold mt-1">{t('procurement.bankingInfomation')}:</div>
                    )}
                    <div className={`col-span-2 mt-1 pe-2 ${!supplier?.supplier_info?.banking_account && 'hidden'}`}>
                        {supplier?.supplier_info?.banking_account}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default SupplierDetail;
