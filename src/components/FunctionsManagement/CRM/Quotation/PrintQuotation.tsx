import React, { useState } from "react";
import { Button, Modal, Input } from "antd";
import { User } from "@/types/userTypes";
import { IoLocationSharp, IoMail } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/utils/common";
import { FaFacebookF, FaEarthAfrica } from "react-icons/fa6";
import { AiFillYoutube } from "react-icons/ai";
import { BiLogoTiktok } from "react-icons/bi";
import { useWindowSize } from "@/utils/responsiveSm";

const PrintQuotation = ({ detail }: { detail: any }) => {
    const t: any = useTranslations();
    const [width] = useWindowSize();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const userDataString = localStorage.getItem("user");
    const parsedUserData: User | null = userDataString ? JSON.parse(userDataString) : null;

    const quotationDateStr = detail.quotation_date;
    const quotationDate = new Date(quotationDateStr);
    const formattedDate = `Ngày ${quotationDate.getDate()} tháng ${quotationDate.getMonth() + 1} năm ${quotationDate.getFullYear()}`;
    const productCode = detail?.quotation_temp_product_info[0]?.temp_product_info?.product_code || "";

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const onPrint = () => {
        window.print();
    };

    return (
        <>
            <Button type={width < 640 ? "text" : "primary"}
                      className={` ${width < 640}`} onClick={showModal} size="small">
                In
            </Button>
            <Modal width={845} footer={null} open={isModalOpen} onCancel={handleCancel}>
                <div className="mt-3 payment-top">
                    <div className="flex mx-auto">
                        <div className="w-50 h-50 flex justify-center items-center">
                            <img src={parsedUserData?.user_profile?.company?.logo} alt="Preview"
                                style={{
                                    margin: "10px 40px",
                                    width: "130px",
                                    height: '130px',
                                    borderRadius: '50%'
                                }} />
                        </div>
                        <div>
                            <h1 className="text-[#47b0c5] text-2xl">{parsedUserData?.user_profile?.company?.name}</h1>
                            <div className="flex">
                                <IoLocationSharp className="mr-2 mt-1 text-gray-500" />
                                <div>{parsedUserData?.user_profile?.company?.address}, {parsedUserData?.user_profile?.company?.ward}, {parsedUserData?.user_profile?.company?.district} ,{parsedUserData?.user_profile?.company?.city}</div>
                            </div>
                            <div className="flex">
                                {parsedUserData?.user_profile?.company?.hotline && (
                                    <>
                                        <div className="flex w-[180px]">
                                            <FaPhoneAlt className="mr-2 mt-1 text-gray-500" />
                                            <div>{parsedUserData.user_profile.company.hotline}</div>
                                        </div>
                                    </>
                                )}
                                {parsedUserData?.user_profile?.company?.fax && (
                                    <>
                                        <div className="flex w-[180px]">
                                            <FaPhoneAlt className="mr-2 mt-1 text-gray-500" />
                                            <div>{parsedUserData.user_profile.company.fax}</div>
                                        </div>
                                    </>
                                )}
                                {parsedUserData?.email && (
                                    <>
                                        <div className="flex">
                                            <IoMail className="mr-2 mt-1 text-gray-500" />
                                            <div>{parsedUserData?.email}</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div >
                                <div className="flex">
                                    {parsedUserData?.user_profile?.company?.facebook_page && (
                                        <>
                                            <div className="flex">
                                                <FaFacebookF className="mr-2 mt-1 text-gray-500" />
                                                <div>{parsedUserData.user_profile.company.facebook_page}</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {parsedUserData?.user_profile?.company?.youtube_channel && (
                                    <>
                                        <div className="flex">
                                            <AiFillYoutube className="mr-2 mt-1 text-gray-500" />
                                            <div>{parsedUserData.user_profile.company.youtube_channel}</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div>
                                {parsedUserData?.user_profile?.company?.website && (
                                    <>
                                        <div className="flex">
                                            <FaEarthAfrica className="mr-2 mt-1 text-gray-500" />
                                            <div>{parsedUserData.user_profile.company.website}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="my-10 ">
                        <h1 className="bg-[#47b0c5] text-white text-2xl text-center py-2 border-2 border-gray-600">BÁO GIÁ</h1>
                    </div>

                    <div className="my-10">
                        <div className="flex gap-1 my-1">
                            <div className="font-bold w-[100px]">{t("table.customer")}: </div>
                            <Input
                                value={detail.customer_name}
                                size="small"
                                maxLength={100}
                                className="-ml-1 py-0 px-1 input-print"
                            />
                        </div>

                        <div className="ml-3">
                            <div className="flex">
                                <IoLocationSharp className="mr-2 mt-1 text-gray-500" />
                                <div className="w-20">Địa chỉ: </div>
                                <Input
                                    value={`${detail.address},${detail.ward}, ${detail.district}, ${detail.city}`}
                                    size="small"
                                    maxLength={100}
                                    className="-ml-1 py-0 px-1 input-print"
                                />
                            </div>
                            <div className="flex">
                                <FaPhoneAlt className="mr-2 mt-1 text-gray-500" />
                                <div className="w-20">SĐT: </div>
                                <Input
                                    value={detail.mobile}
                                    size="small"
                                    maxLength={100}
                                    className="-ml-1 py-0 px-1 input-print"
                                />
                            </div>
                            <div className="flex">
                                <IoMail className="mr-2 mt-1 text-gray-500" />
                                <div className="w-20">Email: </div>
                                <Input
                                    value={detail.email}
                                    size="small"
                                    maxLength={100}
                                    className="-ml-1 py-0 px-1 input-print"
                                />
                            </div>
                        </div>
                    </div>

                    <div className=" overflow-x-auto overflow-hidden print-overflow-hidden">
                        <div className="w-[210mm] ">
                            <div className="flex items-center border mt-3  bg-gray-100 border-gray-300">
                                <table className="w-full text-sm text-left rtl:text-right text-dark-100 dark:text-dark-100">
                                    <thead className="text-xs text-dark-300 bg-gray-50 dark:bg-gray-700 dark:text-dark-100">
                                        <tr>
                                            <th scope="col" className="px-2 py-3 text-md border-r text-center bg-[#47b0c5]">
                                                STT
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-md border-r text-center bg-[#47b0c5]">
                                                Mã SP
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-md border-r text-center bg-[#47b0c5]">
                                                Sản phẩm
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-md border-r text-center bg-[#47b0c5]">
                                                {t("general.quantity")}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-md border-r text-center bg-[#47b0c5]">
                                                {t("crm.price")}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-md border-r text-center bg-[#47b0c5]">
                                                {t("crm.totalPrice")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="border">
                                        {detail?.quotation_product_info?.map((item: any, stt: number) => {
                                            return (
                                                <tr style={{ borderTop: "1px solid lightgrey" }} key={item.id}>
                                                    <th scope="col" className="border-r">
                                                        <div className="flex-shrink-0 text-center font-normal">
                                                            <div>{stt + 1}</div>
                                                        </div>
                                                    </th>
                                                    <th scope="col" className="border-r">
                                                        <div className="flex-shrink-0 text-center font-normal">
                                                            <div>{productCode} - {item?.sku_info?.sku_code}</div>
                                                        </div>
                                                    </th>
                                                    <th scope="col" className="border-r">
                                                        <div className="flex-grow w-60">
                                                            <div className="flex gap-4 items-center">
                                                                <div className="p-2">
                                                                    <div className=" font-medium text-sm flex gap-1">{item.product_info.product_name}</div>

                                                                    {item?.sku_info ? (
                                                                        <div className="font-normal">
                                                                            {item?.sku_info?.classify1_str}{" "}
                                                                            {item?.sku_info?.classify1_str && item?.sku_info?.classify2_str && "/"}
                                                                            {item?.sku_info?.classify2_str} ({item?.sku_info?.sku_code})
                                                                        </div>
                                                                    ) : (
                                                                        <div className="font-normal">
                                                                            ({item?.product_info?.product_code})
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </th>

                                                    <th scope="col" className="border-r">
                                                        <div className="flex-shrink-0 text-center font-normal">
                                                            <div>{item?.quantity}</div>
                                                        </div>
                                                    </th>

                                                    <th scope="col" className=" border-r">
                                                        <div className="flex-shrink-0 w-28 font-normal text-right">
                                                            <div>{formatMoney(item?.product_info.base_price + (item?.sku_info?.price || 0))}</div>
                                                        </div>
                                                    </th>

                                                    <th scope="col" className="border-r">
                                                        <div className="flex-shrink-0 w-28 font-normal text-right">
                                                            <div>
                                                                {formatMoney(
                                                                    (item?.product_info.base_price + (item?.sku_info?.price || 0)) * item?.quantity
                                                                )}
                                                            </div>
                                                        </div>
                                                    </th>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center px-2 border-b border-r border-l  bg-gray-100 border-gray-300">
                                <div className="flex-grow mx-3 my-2 font-semibold">{t("inventory.totalOrderAmount")}</div>
                                <div className="flex-shrink-0 mx-3 my-2 w-28 font-semibold text-right">
                                    {formatMoney(detail?.total_price)}đ
                                </div>
                            </div>

                            <div className="flex items-right px-2 border-b border-r border-l border-gray-300">
                                <div className="flex-grow mx-3 my-1.5 text-gray-500 font-semibold">{t("crm.tax")}</div>
                                <div className="flex-shrink-0 mx-3 my-1.5 w-28 font-semibold text-right">
                                    {detail?.tax > 0 ? "+" : ""}
                                    {formatMoney(detail?.tax)}đ
                                </div>
                            </div>
                            <div className="flex items-center px-2 border-b border-r border-l border-gray-300">
                                <div className="flex-grow mx-3 my-1.5 text-red-500 font-semibold">{t("crm.discount")}</div>
                                <div className="flex-shrink-0 mx-3 my-1.5 w-28 font-semibold text-right">
                                    {detail?.discount > 0 ? "-" : ""}
                                    {formatMoney(detail?.discount)}đ
                                </div>
                            </div>

                            <div className="flex items-center px-2 border-b border-r border-l  bg-gray-100 border-gray-300">
                                <div className="flex-grow mx-3 my-1.5 font-semibold">{t("crm.totalPrice")}</div>
                                <div className="flex-shrink-0 mx-3 my-1.5 w-28 font-semibold text-right">
                                    {formatMoney(detail?.total_price)}đ
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mr-10">
                        <div className="flex justify-end mt-10 mb-2">
                            {formattedDate}
                        </div>
                        <div className="flex justify-end">
                            <div className="text-center">
                                <div className="font-semibold">Giám đốc</div>
                                <div>(Ký, họ tên, đóng dấu)</div>
                                <Input
                                    size="small"
                                    maxLength={100}
                                    className=" py-0 px-1 input-print text-center mt-18"
                                />
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

export default PrintQuotation;