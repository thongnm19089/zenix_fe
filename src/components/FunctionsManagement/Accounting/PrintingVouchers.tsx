"use client";
import React, { useState } from "react";
import { Button, Input } from "antd";
import { useTranslations } from "next-intl";
import { FaEye } from "react-icons/fa";
import Modal from "antd/lib/modal/Modal";
import { formatMoney } from "@/utils/common";
import { to_vietnamese } from "@/utils/numberInWritten";

export default function PrintingVoucherss({
    payment
}: {
    payment?: boolean
}) {
    const t: any = useTranslations();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    }
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onPrint = () => {
        window.print();
    };

    const [formData, setFormData] = useState({
        date: "",
        month: "",
        year: "",
        name: "",
        address: "",
        debt: "",
        money: "",
        have: "",
        collection_reason: "",
        attach: "",
        got_enough: "",
        manager: "",
        accountant: "",
        treasurer: "",
        ballot_maker: "",
        receiving_or_paying: "",
    });

    const generateDots = (width: number, length: number) => {
        const dotWidth = width / length; // Chia chiều rộng đều cho mỗi dấu "."
        return Array.from({ length }, (_, index) => <span key={index} style={{ width: `${dotWidth}px` }}>.</span>);
    };

    const handleInputChange = (fieldName: any, e: any) => {
        const value = e.target.value;
        setFormData((prevData: any) => ({
            ...prevData,
            [fieldName]: value,
        }));
    };

    return (
        <>
            <div className="border">
                <div className="relative mx-20 print-container">
                    <div className="w-[280px] text-center absolute -top-10 right-8 z-10 text-xs">
                        <h1 className="font-bold">Mẫu số 01 - TT</h1>
                        <p>(Ban hành theo thông tư 133/2016/TT-BTC ngày 26/8/2016 của Bộ Tài chính)</p>
                        <div className=" flex flex-col items-center justify-center">
                            <div>Số: PT10/01</div>
                            <div className="flex">
                                <div>Nợ:</div>
                                <Input
                                    size="small"
                                    maxLength={100}
                                    className="ml-4 p-0 px-1 input-print w-10"
                                    onChange={(e) => handleInputChange('debt', e)}
                                />
                            </div>
                            <div className="flex">
                                <div> Có:</div>
                                <Input
                                    size="small"
                                    maxLength={100}
                                    className="ml-4 p-0 px-1 input-print w-10"
                                    onChange={(e) => handleInputChange('have', e)}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="my-20">
                            <div className="text-center text-2xl font-semibold">{payment ? "PHIẾU CHI" : "PHIẾU THU"}</div>
                            <div className="mb-7 text-center font-style: italic">
                                Ngày <Input className="w-9  p-0 input-print text-center" maxLength={2} onChange={(e) => handleInputChange('date', e)} />
                                tháng <Input className="w-9 p-0 input-print text-center" maxLength={2} onChange={(e) => handleInputChange('month', e)} />
                                năm <Input className="w-12 p-0 input-print text-center" maxLength={4} onChange={(e) => handleInputChange('year', e)} />
                            </div>
                        </div>
                        <div className="flex gap-1 my-2">
                            <div className="font-bold w-[220px]">Họ tên người {payment ? "nhận tiền" : "nộp tiền"} : </div>
                            <Input
                                size="small"
                                maxLength={100}
                                className="-ml-1 py-0 px-1 input-print"
                                onChange={(e) => handleInputChange('name', e)}
                            />
                        </div>
                        <div className="flex gap-1 my-2">
                            <div className="font-bold w-[220px]">Địa chỉ : </div>
                            <Input
                                size="small"
                                maxLength={100}
                                className="-ml-1 py-0 px-1 input-print"
                                onChange={(e) => handleInputChange('address', e)}
                            />
                        </div>
                        <div className="flex gap-1 my-2">
                            <div className="font-bold w-[220px]">Lý do {payment ? "chi" : "thu"} : </div>
                            <Input
                                size="small"
                                maxLength={100}
                                className="-ml-1 py-0 px-1 input-print"
                                onChange={(e) => handleInputChange('collection_reason', e)}
                            />
                        </div>
                        <div className="flex gap-1 my-2">
                            <div className="font-bold w-[220px]">Số tiền : </div>
                            <Input
                                size="small"
                                maxLength={100}
                                className="-ml-1 py-0 px-1 input-print"
                                onChange={(e) => handleInputChange('money', e)}
                            />
                        </div>
                        <div className="flex gap-1 my-2">
                            <div className="font-bold w-[220px]">Kèm theo : </div>
                            <Input
                                size="small"
                                maxLength={100}
                                className="-ml-1 py-0 px-1 input-print"
                                onChange={(e) => handleInputChange('attach', e)}
                            />
                        </div>
                        <div className="flex gap-1 my-2">
                            <div className="font-bold w-[220px]">Đã {payment ? "nhận" : "nộp"} đủ số tiền : </div>
                            <Input
                                size="small"
                                maxLength={100}
                                className="-ml-1 py-0 px-1 input-print"
                                onChange={(e) => handleInputChange('got_enough', e)}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between px-10 mt-10">
                                <div className="text-center">
                                    <div className="font-semibold">Giám đốc</div>
                                    <div>(Ký, họ tên, đóng dấu)</div>
                                    <Input
                                        size="small"
                                        maxLength={100}
                                        className="-ml-1 py-0 px-1 input-print"
                                        onChange={(e) => handleInputChange('manager', e)}
                                    />
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold">Kế toán</div>
                                    <div className="">{t("table.signName")}</div>
                                    <Input
                                        size="small"
                                        maxLength={100}
                                        className="-ml-1 py-0 px-1 input-print"
                                        onChange={(e) => handleInputChange('accountant', e)}
                                    />
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold">Thủ quỹ</div>
                                    <div className="">{t("table.signName")}</div>
                                    <Input
                                        size="small"
                                        maxLength={100}
                                        className="-ml-1 py-0 px-1 input-print"
                                        onChange={(e) => handleInputChange('treasurer', e)}
                                    />
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold">Người lập phiếu</div>
                                    <div>{t("table.signName")}</div>
                                    <Input
                                        size="small"
                                        maxLength={100}
                                        className="-ml-1 py-0 px-1 input-print"
                                        onChange={(e) => handleInputChange('ballot_maker', e)}
                                    />
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold">Người {payment ? "nhận tiền" : "nộp tiền"}</div>
                                    <div>{t("table.signName")}</div>
                                    <Input
                                        size="small"
                                        maxLength={100}
                                        className="-ml-1 py-0 px-1 input-print"
                                        onChange={(e) => handleInputChange('receiving_or_paying', e)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mr-15 mt-10">
                        <Button type="default" onClick={showModal}><FaEye /></Button>
                    </div>
                </div>--
            </div>
            <Modal open={isModalVisible} onCancel={handleCancel} footer={null} width={845} >
        
                    <div className="relative text-[18px] px-5 payment-margin">
                        <div className="w-[250px] text-center absolute -top-15 right-8 z-10 text-xs">
                            <h1 className="font-bold">Mẫu số 01 - TT</h1>
                            <p>(Ban hành theo thông tư 133/2016/TT-BTC ngày 26/8/2016 của Bộ Tài chính)</p>
                            <div className=" flex flex-col items-center justify-center">
                                <div>Số: PT10/01</div>
                                <div className="flex">
                                    <div>Nợ: {formData.debt || generateDots(5, 10)}</div>
                                </div>
                                <div className="flex">
                                    <div> Có: {formData.have || generateDots(5, 10)}</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="payment-top my-15">
                                <div className="text-center text-2xl font-semibold">{payment ? "PHIẾU CHI" : "PHIẾU THU"}</div>
                                <div className="mb-7 justify-center flex ">
                                    <div>Ngày {formData.date}</div>
                                    <div className="mx-1 input-space">tháng {formData.month}</div>
                                    <div>năm {formData.year}</div>
                                </div>
                            </div>
                            <div className="flex gap-1 my-2">
                                <div className="font-bold ">Họ tên người {payment ? "nhận tiền" : "nộp tiền"} :</div>
                                <div className="flex-grow flex">{formData.name || generateDots(540,100)}</div>
                            </div>
                            <div className="flex gap-1 my-2">
                                <div className="font-bold">Địa chỉ :</div>
                                <div className="flex-grow flex">{formData.address || generateDots(675,100)}</div>
                            </div>
                            <div className="flex gap-1 my-2">
                                <div className="font-bold">Lý do {payment ? "chi" : "thu"} :</div>
                                <div className="flex-grow flex">{formData.collection_reason || generateDots(653, 100)}</div>
                            </div>
                            <div className="flex gap-1 my-2">
                                <div className="font-bold">Số tiền : </div>
                                <div className="flex-grow flex">
                                    {formData.money ? (
                                        formatMoney(formData.money)
                                    ) : (
                                        <>
                                            {generateDots(674, 100)}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1 my-2">
                                <div className="font-bold">Bằng chữ :</div>
                                <div className="flex-grow flex">{to_vietnamese(formData.money) || generateDots(653,100)}</div>
                            </div>
                            <div className="flex gap-1 my-2">
                                <div className="font-bold">Kèm theo :</div>
                                <div className="flex-grow flex">{formData.attach || generateDots(650,100)}</div>
                            </div>
                            <div className="flex gap-1 my-2">
                                <div className="font-bold">Đã {payment ? "nhận" : "nộp"} đủ số tiền :</div>
                                <div className="flex-grow flex">{formData.got_enough || generateDots(583,100)}</div>
                            </div>
                            <div>
                                <div className="flex justify-end mt-10 mr-8 mb-2">
                                    <div>Ngày {formData.date}</div>
                                    <div className="mx-1 input-space">tháng {formData.month}</div>
                                    <div>năm {formData.year}</div>
                                </div>
                                <div className="flex justify-between px-5">
                                    <div className="text-center">
                                        <div className="font-semibold">Giám đốc</div>
                                        <div>(Ký, họ tên, đóng dấu)</div>
                                        <div className="mt-3">{formData.manager}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold">Kế toán</div>
                                        <div className="">{t("table.signName")}</div>
                                        <div className="mt-3">{formData.accountant}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold">Thủ quỹ</div>
                                        <div className="">{t("table.signName")}</div>
                                        <div className="mt-3">{formData.treasurer}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold">Người lập phiếu</div>
                                        <div>{t("table.signName")}</div>
                                        <div className="mt-3">{formData.ballot_maker}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold">Người {payment ? "nhận tiền" : "nộp tiền"}</div>
                                        <div>{t("table.signName")}</div>
                                        <div className="mt-3">{formData.receiving_or_paying}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mr-15 mt-10 print-hidden">
                            <Button type="primary" onClick={onPrint}>In</Button>
                        </div>
                    </div>
              
            </Modal>
        </>
    )
}
