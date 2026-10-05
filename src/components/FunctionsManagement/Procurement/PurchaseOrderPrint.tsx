import { formatMoney } from "@/utils/common";
import { Button, Input, Modal } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

const PurchaseOrderPrint = ({ purchase_order }: { purchase_order: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();

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
      <Button type="primary" onClick={showModal}>
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
        <div className="print-container mb-3 ">
          <div className="flex gap-3 items-center mb-4 ">
            <Image
              src={companyInfo.logo}
              width={50}
              height={50}
              alt="logo"
              style={{ borderRadius: "50%", width: "50px", height: "50px" }}
            />
            <div className="flex flex-col justify-center">
              <div className="text-lg font-semibold">{companyInfo.companyName}</div>
              <div className="text-xs">{companyInfo.fullAddress}</div>
            </div>
          </div>
          <div className="text-center text-2xl font-semibold ">PHIẾU MUA HÀNG</div>

          <div className="mb-2 text-center ">
            Ngày {dayjs(purchase_order.purchase_order_date).format("DD")} tháng {dayjs(purchase_order.purchase_order_date).format("MM")} năm{" "}
            {dayjs(purchase_order.purchase_order_date).format("YYYY")}
          </div>
          <div className="my-2 text-right mr-4 ">Số: {purchase_order.ref_code}</div>

          <div className="flex gap-1 my-1">
            <div className="font-bold w-[112px]">{t("nav.supplier")}: </div>
            <span>{purchase_order.supplier_str}</span>
          </div>

          <div className="flex gap-1 my-1">
            <div className="font-bold w-[112px]">{t("user.phone")}: </div>
            <span>{purchase_order.supplier_info.mobile}</span>
          </div>

          <div className="flex gap-1 my-1">
            <div className="font-bold w-[62px]">{t("user.address")}: </div>
            <span>{purchase_order.supplier_info.address + ", " + purchase_order.supplier_info.district + ", " + purchase_order.supplier_info.city}</span>
          </div>

          <div className="flex gap-1 my-1">
            <div className="font-bold w-16">{t("general.note")}: </div>
            <span>{purchase_order.note}</span>
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
                    {purchase_order?.order_details_list?.map((detail: any, stt: number) => {
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
                                  {detail?.sku && (
                                    <div className="font-normal">
                                      {detail?.sku?.classify1_str}{" "}
                                      {detail?.sku?.classify1_str && detail?.sku.classify2_str && "/"}
                                      {detail?.sku?.classify2_str} ({detail?.sku.sku_code})
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </th>

                          {/* measure */}
                          <th scope="col" className=" border-r">
                            <div style={{ padding: 0, margin: 0 }} className="items-center">
                              <div className="flex-shrink-0 font-normal text-center">
                                {detail?.product?.unit_of_measure}
                              </div>
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
                  {formatMoney(purchase_order?.total_price)}đ
                </div>
              </div>
              <div className="flex items-right px-2 border-b border-r border-l border-gray-300">
                <div className="flex-grow mx-3 my-1.5 text-gray-500 font-semibold">{t("procurement.tax")}</div>
                <div className="flex-shrink-0 mx-3 my-1.5 w-28 font-semibold text-right">
                  {purchase_order?.tax_amount > 0 ? "+" : ""}
                  {formatMoney(purchase_order?.tax_amount)}đ
                </div>
              </div>
              <div className="flex items-center px-2 border-b border-r border-l border-gray-300">
                <div className="flex-grow mx-3 my-1.5 text-red-500 font-semibold">{t("crm.discount")}</div>
                <div className="flex-shrink-0 mx-3 my-1.5 w-28 font-semibold text-right">
                  {purchase_order?.discount_amount > 0 ? "-" : ""}
                  {formatMoney(purchase_order?.discount_amount)}đ
                </div>
              </div>
              <div className="flex items-right px-2 border-b border-r border-l border-gray-300">
                <div className="flex-grow mx-3 my-1.5 text-yellow-500 font-semibold">{t("crm.additionalFees")}</div>
                <div className="flex-shrink-0 mx-3 my-1.5 w-28 font-semibold text-right">
                  {purchase_order?.total_fee > 0 ? "+" : ""}
                  {formatMoney(purchase_order?.total_fee)}đ
                </div>
              </div>
              <div className="flex items-center px-2 border-b border-r border-l  bg-gray-100 border-gray-300">
                <div className="flex-grow mx-3 my-1.5 font-semibold">{t("crm.totalPrice")}</div>
                <div className="flex-shrink-0 mx-3 my-1.5 w-28 font-semibold text-right">
                  {formatMoney(purchase_order?.amount_payable)}đ
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

export default PurchaseOrderPrint;
