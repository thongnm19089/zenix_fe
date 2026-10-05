import { formatMoney } from "@/utils/common";
import { useWindowSize } from "@/utils/responsiveSm";
import { Button, Modal } from "antd";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

const OrderDetail = ({ order, islead }: { order: any; islead?: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [width] = useWindowSize();
  const t: any = useTranslations();
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type={width > 640 && islead ? "primary" : "text"}
        onClick={showModal}
        size="small"
        icon={islead && <FaCheckCircle />}
        className={`flex items-center gap-1 ${islead && "bg-green-500 hover:!bg-green-400"}`}
      >
        {islead ? ` Đã lên đơn` : order?.ref_code}
      </Button>
      <Modal
        title={`${t("crm.order")} ${order?.ref_code}`}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={900}
      >
        <div className=" overflow-x-auto overflow-hidden ">
          <div className="w-[850px] ">
            <div className="flex items-center border mt-3  bg-gray-100 border-gray-300">
              <table className="w-full text-sm text-left rtl:text-right text-dark-100 dark:text-dark-100">
                <thead className="text-xs text-dark-300 bg-gray-50 dark:bg-gray-700 dark:text-dark-100">
                  <tr>
                    <th scope="col" className=" py-3 px-1 text-[14px] border-r text-center">
                      {t("table.sTT")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-[14px] border-r text-center">
                      {t("crm.orderList")}
                    </th>
                    <th scope="col" className="px-3 py-1 text-[14px] border-r text-center">
                      {t("admin.unit")}
                    </th>
                    <th scope="col" className="px-3 py-1 text-[14px] border-r text-center">
                      {t("general.quantity")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-[14px] border-r text-center">
                      {t("crm.price")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-[14px] border-r text-center">
                      {t("crm.discount")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-[14px] border-r text-center">
                      {t("procurement.tax")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-[14px] border-r text-center">
                      {t("crm.totalPrice")}
                    </th>
                  </tr>
                </thead>
                <tbody className="border">
                  {order?.order_details_list?.map((detail: any, index: number, item: any) => {
                    return (
                      <tr style={{ borderTop: "1px solid lightgrey" }} key={detail.id}>
                        {/* Stt */}
                        <th scope="col" className=" border-r">
                          <div className="text-center">
                            <div className="font-normal">{index + 1}</div>
                          </div>
                          {/* orderlist */}
                        </th>
                        <th scope="col" className="border-r">
                          <div className="flex-grow">
                            <div className="flex gap-3 items-center text-center w-50">
                              <div className="border-2 w-[50px] h-[50px] ">
                                <Image
                                  src={detail?.product?.image_list[0]?.image}
                                  className="object-cover h-10"
                                  width={60}
                                  height={50}
                                  alt={detail?.product?.image_list[0]?.atl_text || "sản phẩm"}
                                />
                              </div>

                              <div>
                                <div className="flex font-semibold text-sm">
                                  {detail?.product?.product_name}
                                  {detail?.sku ? (
                                    <div>
                                      {detail.sku.classify1_str}
                                      {detail.sku.classify1_str && detail.sku.classify2_str && "/"}
                                      {detail.sku.classify2_str} ({detail.sku.sku_code})
                                    </div>
                                  ) : (
                                    <div>({detail?.product?.product_code})</div>
                                  )}
                                </div>
                                <div className=" text-sm">{detail?.product?.category_str}</div>
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
                        <th scope="col" className=" border-r">
                          <div style={{ padding: 0, margin: 0 }} className="items-center">
                            <div className="flex-shrink-0 font-normal text-center">{detail?.quantity}</div>
                          </div>
                        </th>
                        <th scope="col" className=" border-r">
                          <div style={{ padding: 0, margin: 0 }} className="items-center">
                            <div className="flex-shrink-0 font-normal text-center w-28">
                              {formatMoney(detail?.product?.base_price + (detail?.sku?.price || 0))}đ
                            </div>
                          </div>
                        </th>

                        <th scope="col" className="border-r">
                          <div className="flex-shrink-0 text-center font-normal">
                            {order?.discount_amount > 0 ? "-" : ""}
                            {formatMoney(order?.discount_amount)}đ
                          </div>
                        </th>

                        <th scope="col" className=" border-r">
                          <div className="flex-shrink-0 w-20 font-normal text-center">
                            <div>{(((item?.total_tax || 0) / (order?.tax_amount || 1)) * 100).toFixed(2)}%</div>
                          </div>
                        </th>

                        <th scope="col" className="border-r">
                          <div className="flex-shrink-0 w-28 font-normal text-center">
                            <div>{formatMoney(detail?.final_price)}đ</div>
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
              <div className="flex-grow mx-3 my-2 font-semibold">{t("crm.totalAmount")}</div>
              <div className="flex-shrink-0 mx-3 my-2 w-28 font-semibold text-right">
                {formatMoney(order?.total_price)}đ
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default OrderDetail;
