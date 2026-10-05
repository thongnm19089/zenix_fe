import { formatMoney } from "@/utils/common";
import { to_vietnamese } from "@/utils/numberInWritten";
import { Button, Input, Modal } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";

import Image from "next/image";

const DetailPrintStockOut = ({ order, detailStockOut }: { order: any; detailStockOut: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();

  const groupProducts = (products: any[]) => {
    const groupedProducts: any = {};
    products.forEach((detail: any) => {
      const key = `${detail.product_info.id}-${detail.product_info.product_name}`;
      if (!groupedProducts[key]) {
        groupedProducts[key] = { ...detail, quantity: 0, totalPrice: 0 };
      }
      groupedProducts[key].quantity += detail.quantity;
      groupedProducts[key].totalPrice += (detail.product_info.base_price + (detail.sku_info?.price || 0)) * detail.quantity;
    });
    return Object.values(groupedProducts);
  };

  const groupedProducts = useMemo(() => groupProducts(detailStockOut?.product_list || []), [detailStockOut?.product_list]);

  const [customerName, setCustomerName] = useState(order.customer_info.name || ''); // Khởi tạo trạng thái với giá trị mặc định

  const handleCustomerNameChange = (event: { target: { value: any; }; }) => {
    setCustomerName(event.target.value);
  };

  const [customerPhone, setCustomerPhone] = useState(order.customer_info.mobile || '');
  const handleCustomerPhoneChange = (event: { target: { value: any; }; }) => {
    setCustomerPhone(event.target.value);
  };

  const [customerNote, setCustomerNote] = useState(order.note || '');
  const handleCustomerNoteChange = (event: { target: { value: any; }; }) => {
    setCustomerNote(event.target.value);
  };

  // Trạng thái và hàm xử lý sự kiện cho địa chỉ
  const [customerAddress, setCustomerAddress] = useState(
    `${order.customer_info.address}, ${order.customer_info.district}, ${order.customer_info.city}` || ''
  );

  const handleCustomerAddressChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setCustomerAddress(event.target.value);
  };

  const [companyInfo, setCompanyInfo] = useState({
    logo: "/images/default_company_logo.png",
    companyName: "",
    fullAddress: "",
    avatar: null,
  });

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    const userDataObj = userDataString ? JSON.parse(userDataString) : null;
    console.log(userDataObj);
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

  // const dottedLineStyle = {
  //   flex: '1',
  //   borderBottom: '1px dotted black', // Màu và kiểu của đường gạch chấm
  //   whiteSpace: 'nowrap', // Ngăn chặn xuống dòng
  //   overflow: 'hidden', // Ẩn phần vượt quá khối chứa
  // };

  const dottedLineStyle: React.CSSProperties = {
    flex: '1',
    borderBottom: '1px dotted black',
    whiteSpace: 'nowrap' as 'nowrap', // Explicitly casting the value
    overflow: 'hidden',
  };

  const [hiddenText, setHiddenText] = useState('');

  // Function to reveal the hidden text
  const revealText = () => {
    setHiddenText('Phần còn lại...');
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {t("table.printVoucher")}
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
            src={companyInfo.logo}
            width={50}
            height={50}
            alt="logo"
            style={{ borderRadius: "50%", width: "50px", height: "50px" }}
          />
          <div className="flex flex-col justify-center">
            <div className="text-lg font-semibold">
              {companyInfo.companyName}
            </div>
            <div className="text-xs">{companyInfo.fullAddress}</div>
          </div>
        </div>
        <div className="print-container mb-3">
          <div className="text-center text-2xl font-semibold uppercase ">{t("table.deliveryBill")} </div>

          <div className="mt-2 text-center ">
            Ngày {dayjs(order.created).format("DD")} tháng {dayjs(order.created).format("MM")} năm{" "}
            {dayjs(order.created).format("YYYY")}
          </div>
          <div className="mb-2 text-center ">Số: {order.ref_code}</div>

          <div className="flex gap-1 mt-2">
            <div className="font-bold w-[100px]">Người nhận: </div>
            <Input
              value={customerName}
              onChange={handleCustomerNameChange}
              size="small"
              maxLength={100}
              className="-ml-1 py-0 px-1 input-print"
            />
          </div>

          <div className="flex gap-1 mt-2">
            <div className="font-bold w-[112px]">{t("user.phone")}: </div>
            <Input
              value={customerPhone}
              onChange={handleCustomerPhoneChange}
              size="small"
              maxLength={100}
              className="-ml-1 py-0 px-1 input-print"
            />          </div>

          <div className="flex gap-1 mt-2">
            <div className="font-bold w-[62px]">{t("user.address")}: </div>
            <Input
              value={customerAddress}
              onChange={handleCustomerAddressChange}
              size="small"
              maxLength={100}
              className="-ml-1 py-0 px-1 input-print"
            />
          </div>

          <div className="flex gap-1 mt-2">
            <div className="font-bold w-[62px]">{t("general.note")}: </div>
            <Input
              value={customerNote}
              onChange={handleCustomerNoteChange}
              size="small"
              maxLength={100}
              className="-ml-1 py-0 px-1 input-print"
            />
          </div>

          <div className=" overflow-x-auto overflow-hidden">
            <div className="w-[210mm]">
              <div className="flex items-center  border mt-3  bg-gray-100 border-gray-300">
                <table className="w-full text-sm text-left rtl:text-right text-dark-100 dark:text-dark-100">
                  <thead className="text-xs text-dark-300 bg-gray-50 dark:bg-gray-700 dark:text-dark-100">
                    <tr>
                      <th rowSpan={2} scope="col" className="p-3 border-r text-center">
                        STT
                      </th>
                      <th rowSpan={2} scope="col" className="border-r text-center w-[300px]">
                        Sản phẩm, Hàng hóa
                      </th>
                      <th rowSpan={2} scope="col" className="p-3 text-md border-r text-center">
                        Mã số
                      </th>
                      <th colSpan={2} scope="col" className="px-6 py-3 text-md border-r border-t text-center">
                        {t("general.quantity")}
                      </th>
                      <th rowSpan={2} scope="col" className="w-[100px] text-md border-r text-center">
                        Đơn vị tính
                      </th>
                      <th rowSpan={2} scope="col" className="px-6 py-3 text-md border-r text-center">
                        {t("crm.price")}
                      </th>
                      <th rowSpan={2} scope="col" className="px-6 py-3 text-md text-center">
                        {t("crm.totalPrice")}
                      </th>
                    </tr>
                    <tr className="border-t">
                      <th className="px-6 py-3 text-md border-r text-center">Yêu cầu</th>
                      <th className="px-6 py-3 text-md border-r text-center">Thực xuất</th>
                    </tr>
                  </thead>
                  <tbody className="border">
                    {groupedProducts.map((groupedDetail: any, idx: number) => (
                      <tr style={{ borderTop: '1px solid lightgrey' }} key={idx}>
                        <td className="p-3 border-r text-center">
                          <div className="text-center">
                            <div className="font-normal">{idx + 1}</div>
                          </div>
                        </td>
                        <td className="border-r">
                          <div className="flex-grow m-3">
                            <div className="flex gap-4 items-center">
                              <div>
                                <div className=" font-semibold text-sm flex gap-2">
                                  <div>{groupedDetail?.product_info?.product_name}</div>
                                  {groupedDetail?.sku_info && (
                                    <div>
                                      ( {groupedDetail?.sku_info?.classify1_str}{" "}
                                      {groupedDetail?.sku_info?.classify1_str && groupedDetail?.sku_info?.classify2_str && "/"}
                                      {groupedDetail?.sku_info?.classify2_str} )
                                    </div>
                                  )}
                                </div>
                                <div className=" text-sm">{groupedDetail?.product?.category_str}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="border-r">
                          <div className="flex-shrink-0 p-2 font-normal text-center ">
                            {/* Hiển thị sku_code hoặc product_code tùy thuộc vào điều kiện */}
                            {groupedDetail?.sku_info ? (
                              groupedDetail.sku_info.sku_code
                            ) : (
                              groupedDetail?.product_info?.product_code
                            )}
                          </div>
                        </td>
                        <td scope="col" className=" border-r">
                          <div className="flex-shrink-0 font-normal text-center">
                            {order?.order_details_list?.[idx]?.quantity || 0}
                          </div>
                        </td>
                        <td className="border-r">
                          <div className="flex-shrink-0 font-normal text-center">
                            {groupedDetail?.quantity}
                          </div>
                        </td>
                        <td className="border-r">
                          {groupedDetail?.product_info.unit_of_measure !== "null" && (
                            <div className="flex-shrink-0 font-normal text-center">
                              {groupedDetail?.product_info?.unit_of_measure}
                            </div>
                          )}
                        </td>
                        <td className="border-r">
                          <div className="flex-shrink-0 w-28 px-2 font-normal text-right">
                            {formatMoney(groupedDetail?.product_info?.base_price + (groupedDetail?.sku_info?.price || 0))}đ
                          </div>
                        </td>
                        <td className="border-r">
                          <div className="flex-shrink-0 w-28 px-2 font-normal text-right">
                            {formatMoney(
                              (groupedDetail?.product_info?.base_price + (groupedDetail?.sku_info?.price || 0)) * groupedDetail?.quantity
                            )}đ
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="flex items-center pl-3  border-b border-r border-l  bg-gray-100 border-gray-300">
                <div className="flex-grow mx-3 my-2 font-semibold">Tổng</div>
                <div className="flex-shrink-0 mx-3 my-2 w-28 font-semibold text-right">
                  {detailStockOut?.total_price}đ
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mt-4" style={containerStyle}>
              <div style={textContainerStyle}>
                <p>Tổng số tiền (viết bằng chữ): {to_vietnamese(detailStockOut?.total_price)}</p>
              </div>
            </div>

            <div style={containerStyle}>
              <div style={textContainerStyle}>
                <p>Số chứng từ gốc kèm theo:</p>
              </div>
              <div style={dottedLineStyle}></div>

            </div>
          </div>

          <div className="flex justify-between px-10 my-6">
            <div className="text-center">
              <div className="mb-16  font-semibold">{t("table.ballotMaker")}</div>
              <div className="">{t("table.signName")}</div>
            </div>
            <div className="text-center">
              <div className="mb-16  font-semibold">{t("table.importer")}</div>
              <div>{t("table.signName")}</div>
            </div>
            <div className="text-center">
              <div className="mb-16  font-semibold">{t("table.stocker")}</div>
              <div>{t("table.signName")}</div>
            </div>
            <div className="text-center">
              <div className="mb-16  font-semibold">{t("table.accountant")}</div>
              <div>{t("table.signName")}</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DetailPrintStockOut;
