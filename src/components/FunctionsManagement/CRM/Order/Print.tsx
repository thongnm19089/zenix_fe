import { formatMoney } from "@/utils/common";
import { to_vietnamese } from "@/utils/numberInWritten";
import { useWindowSize } from "@/utils/responsiveSm";
import { Button, Input, Modal } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

const { TextArea } = Input;

const Print = ({ order }: { order: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const [width] = useWindowSize();

  const [companyInfo, setCompanyInfo] = useState({
    logo: "/images/default_company_logo.png",
    companyName: "",
    fullAddress: "",
    avatar: null,
  });

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    const userDataObj = userDataString ? JSON.parse(userDataString) : null;
    const addressParts = [
      userDataObj?.user_profile?.company?.address,
      userDataObj?.user_profile?.company?.district,
      userDataObj?.user_profile?.company?.city,
    ]
      .filter(Boolean)
      .join(", "); // Only add to array if value is not null/undefined/empty, then join with commas

    setCompanyInfo({
      logo: userDataObj?.user_profile?.company?.logo,
      companyName: userDataObj?.user_profile?.company?.name,
      fullAddress: addressParts,
      avatar: userDataObj?.user_profile.image,
    });
  }, []);

  const [customerName, setCustomerName] = useState(order?.customer_info?.name || ''); // Khởi tạo trạng thái với giá trị mặc định
  const handleCustomerNameChange = (event: { target: { value: any; }; }) => {
    setCustomerName(event.target.value);
  };

  const [customerPhone, setCustomerPhone] = useState(order?.customer_info?.mobile || '');
  const handleCustomerPhoneChange = (event: { target: { value: any; }; }) => {
    setCustomerPhone(event.target.value);
  };

  const [customerNote, setCustomerNote] = useState(order?.note || '');
  const handleCustomerNoteChange = (event: { target: { value: any; }; }) => {
    setCustomerNote(event.target.value);
  };

  const [customerAddress, setCustomerAddress] = useState(
    `${order?.customer_info?.address}, ${order?.customer_info?.district}, ${order?.customer_info?.city}` || ''
  );
  const handleCustomerAddressChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setCustomerAddress(event.target.value);
  };


  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onPrint = () => {
    window.print();
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center', // Canh giữa theo chiều dọc
  };

  const textContainerStyle = {
    marginRight: '10px', // Khoảng cách giữa văn bản và đường gạch chấm
  };

  const dottedLineStyle: React.CSSProperties = {
    flex: '1',
    borderBottom: '1px dotted black',
    whiteSpace: 'nowrap' as 'nowrap', // Explicitly casting the value
    overflow: 'hidden',
  };

  return (
    <>
      <Button type={width < 640 ? "text" : "primary"}
        className={` ${width < 640}`} onClick={showModal} size="small">
        {t("general.print")}
      </Button>
      <Modal
        open={isModalOpen}
        onOk={onPrint}
        onCancel={handleCancel}
        width={845}
        okText={t("general.print")}
        cancelText={t("general.cancel")}
      >
        <div className="flex gap-3 items-center mb-4 ">
          <Image
            src={companyInfo?.logo}
            width={50}
            height={50}
            alt="logo"
            style={{ borderRadius: "50%", width: "50px", height: "50px" }}
          />
          <div className="flex flex-col justify-center">
            <div className="text-lg font-semibold">{companyInfo?.companyName}</div>
            <div className="text-xs">{companyInfo?.fullAddress}</div>
          </div>
        </div>
        <div className="print-container mb-3 ">
          <div className="text-center text-2xl font-semibold ">PHIẾU GIAO HÀNG</div>

          <div className="mb-2 text-center ">
            Ngày {dayjs(order.order_date).format("DD")} tháng {dayjs(order.order_date).format("MM")} năm{" "}
            {dayjs(order.order_date).format("YYYY")}
          </div>
          <div className="my-2 text-right mr-4 ">Số: {order.ref_code}</div>

          <div className="flex gap-1 my-1">
            <div className="font-bold w-[100px]">{t("table.customer")}: </div>
            <Input
              value={customerName}
              onChange={handleCustomerNameChange}
              size="small"
              maxLength={100}
              className="-ml-1 py-0 px-1 input-print"

            />
          </div>

          <div className="flex gap-1 my-1">
            <div className="font-bold w-[112px]">{t("user.phone")}: </div>
            <Input
              value={customerPhone}
              onChange={handleCustomerPhoneChange}
              size="small"
              maxLength={100}
              className="-ml-1 py-0 px-1 input-print"
            />
          </div>

          <div className="flex gap-1 my-1">
            <div className="font-bold w-[62px]">{t("user.address")}: </div>
            <Input
              value={customerAddress}
              onChange={handleCustomerAddressChange}
              size="small"
              maxLength={100}
              className="-ml-1 py-0 px-1 input-print"
            />
          </div>
          <div className="flex gap-1 my-1">
            <div className="font-bold w-16">{t("general.note")}:</div>
            <Input
              value={customerNote}
              onChange={handleCustomerNoteChange}
              size="small"
              maxLength={100}
              className="-ml-1 py-0 px-1 input-print"
            />
          </div>

          <div className=" overflow-x-auto overflow-hidden ">
            <div className="w-[210mm] ">
              {/* table */}

              <div className="flex items-center border mt-3  bg-gray-100 border-gray-300">
                <table className="w-full text-sm text-left rtl:text-right text-dark-100 dark:text-dark-100">
                  <thead className="text-xs text-dark-300 bg-gray-50 dark:bg-gray-700 dark:text-dark-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-md border-r text-center">
                        STT
                      </th>
                      <th scope="col" className="px-6 py-3 text-md border-r text-center">
                        {t("crm.orderList")}
                      </th>
                      <th scope="col" className="px-6 py-3 text-md border-r text-center">
                        Đơn vị tính
                      </th>
                      <th scope="col" className="px-6 py-3 text-md border-r text-center">
                        {t("general.quantity")}
                      </th>
                      <th scope="col" className="px-6 py-3 text-md border-r text-center">
                        {t("crm.price")}
                      </th>
                      <th scope="col" className="px-6 py-3 text-md text-center">
                        {t("crm.totalPrice")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="border">
                    {order?.order_details_list?.map((detail: any, stt: number) => {
                      return (
                        <tr style={{ borderTop: "1px solid lightgrey" }} key={detail.id}>
                          {/* Stt */}
                          <th scope="col" className=" border-r">
                            <div className="text-center">
                              <div className="font-normal">{stt + 1}</div>
                            </div>
                            {/* orderlist */}
                          </th>
                          <th scope="col" className="border-r">
                            <div className="flex-grow w-60">
                              <div className="flex gap-4 items-center">
                                <div className="p-2">
                                  <div className=" font-medium text-sm flex gap-1">{detail.product.product_name}</div>

                                  {detail?.sku ? (
                                    <div className="font-normal">
                                      {detail?.sku?.classify1_str}{" "}
                                      {detail?.sku?.classify1_str && detail?.sku.classify2_str && "/"}
                                      {detail?.sku?.classify2_str} ({detail?.sku.sku_code})
                                    </div>
                                  ) : (
                                    <div className="font-normal">
                                      ({detail?.product?.product_code})
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </th>

                          {/* measure */}
                          <th scope="col" className=" border-r">
                            <div style={{ padding: 0, margin: 0 }} className="items-center">
                              {detail?.product?.unit_of_measure !== "null" && (
                                <div className="flex-shrink-0 font-normal text-center">
                                  {detail?.product?.unit_of_measure}
                                </div>
                              )}
                            </div>
                          </th>

                          {/* quantity */}
                          <th scope="col" className="border-r">
                            <div className="flex-shrink-0 text-center font-normal">
                              <div>{detail?.quantity}</div>
                            </div>
                          </th>

                          {/* price */}
                          <th scope="col" className=" border-r">
                            <div className="flex-shrink-0 w-28 font-normal text-right">
                              <div>{formatMoney(detail?.product.base_price + (detail?.sku?.price || 0))}</div>
                            </div>
                          </th>

                          {/* totalPrice */}
                          <th scope="col" className="border-r">
                            <div className="flex-shrink-0 w-28 font-normal text-right">
                              <div>
                                {formatMoney(
                                  (detail?.product.base_price + (detail?.sku?.price || 0)) * detail?.quantity
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

              {/* totalOrderAmount */}
              <div className="flex items-center px-2 border-b border-r border-l  bg-gray-100 border-gray-300"></div>
              <div className="flex items-center px-2 border-b border-r border-l  bg-gray-100 border-gray-300">
                <div className="flex-grow mx-3 my-2 font-semibold">{t("inventory.totalOrderAmount")}</div>
                <div className="flex-shrink-0 mx-3 my-2 w-28 font-semibold text-right">
                  {formatMoney(order?.total_price)}đ
                </div>
              </div>
              <div className="flex items-right px-2 border-b border-r border-l border-gray-300">
                <div className="flex-grow mx-3 my-1.5 text-gray-500 font-semibold">{t("crm.tax")}</div>
                <div className="flex-shrink-0 mx-3 my-1.5 w-28 font-semibold text-right">
                  {order?.tax_amount > 0 ? "+" : ""}
                  {formatMoney(order?.tax_amount)}đ
                </div>
              </div>
              <div className="flex items-center px-2 border-b border-r border-l border-gray-300">
                <div className="flex-grow mx-3 my-1.5 text-red-500 font-semibold">{t("crm.discount")}</div>
                <div className="flex-shrink-0 mx-3 my-1.5 w-28 font-semibold text-right">
                  {order?.discount_amount > 0 ? "-" : ""}
                  {formatMoney(order?.discount_amount)}đ
                </div>
              </div>

              <div className="items-right border-r border-b border-l border-gray-300">
                {order?.fee_list && order.fee_list.length > 0 && order.fee_list.map((fee: any, index: number) => (
                  <div key={index} className="flex px-2 border-b">
                    <div className="mx-3 my-1.5 flex-grow">
                      <div className="text-yellow-500 font-semibold">{fee.fee_type_str}</div>
                    </div>
                    <div className="flex-shrink-0 w-28 mx-3 my-1.5 font-semibold text-right">
                      <div>{fee.amount > 0 ? "+" : ""}{formatMoney(fee.amount)}đ</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center px-2 border-b border-r border-l  bg-gray-100 border-gray-300">
                <div className="flex-grow mx-3 my-1.5 font-semibold">{t("crm.totalPrice")}</div>
                <div className="flex-shrink-0 mx-3 my-1.5 w-28 font-semibold text-right">
                  {formatMoney(order?.amount_payable)}đ
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between px-10 my-6">
            <div className="text-center">
              <div className="mb-16  font-semibold">{t("table.importer")}</div>
              <div>{t("table.signName")}</div>
            </div>
            <div className="text-center">
              <div className="mb-16  font-semibold">{t("table.ballotMaker")}</div>
              <div className="">{t("table.signName")}</div>
            </div>

            <div className="text-center">
              <div className="mb-16  font-semibold">Người giao hàng</div>
              <div>{t("table.signName")}</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Print;
