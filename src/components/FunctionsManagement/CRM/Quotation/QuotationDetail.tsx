import { formatMoney } from "@/utils/common";
import { Button, Image, Modal } from "antd";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const QuotationDetail = ({ quotation }: { quotation: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  console.log("quotation", quotation)

  return (
    <>
      <Button type="link" onClick={showModal} className="p-0">
        {quotation?.ref_code}
      </Button>
      <Modal
        title={`${t("detailFunction.Quote")} ${quotation?.ref_code}`}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={1200}
      >
        <div className="overflow-x-auto overflow-hidden">
          <div className="flex items-center border mt-3 bg-gray-100 border-gray-300">
            <table className="w-full text-sm text-left rtl:text-right text-dark-100 dark:text-dark-100">
              <thead className="text-xs text-dark-300 bg-gray-50 dark:bg-gray-700 dark:text-dark-100">
                <tr>
                  <th
                    scope="col"
                    className="py-3 px-1 text-[14px] border-r text-center"
                  >
                    {t("table.sTT")}
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-1 text-[14px] border-r text-center"
                  >
                    Mã SP
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-8 text-[14px] border-r text-center"
                  >
                    {t("admin.imageProduct")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-[14px] border-r text-center"
                  >
                    {t("detailFunction.Quotation")}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1 text-[14px] border-r text-center"
                  >
                    {t("admin.unit")}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1 text-[14px] border-r text-center"
                  >
                    {t("general.quantity")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-[14px] border-r text-center"
                  >
                    {t("crm.price")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-[14px] border-r text-center"
                  >
                    {t("crm.discount")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-[14px] border-r text-center"
                  >
                    Thuế (VAT)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-[14px] border-r text-center"
                  >
                    {t("crm.totalPrice")}
                  </th>
                </tr>
              </thead>
              <tbody className="border">
                {quotation?.quotation_product_info.map((detail: any, index: number) => {
                  const productInfo = detail?.product_info || {};
                  const productCode = detail?.product_info?.product_code;
                  const imageProduct = detail?.product_info?.image_list?.[0]?.image;

                  return (
                    <tr style={{ borderTop: "1px solid lightgrey" }} key={detail.id}>
                      <th scope="col" className="border-r">
                        <div className="text-center">
                          <div className="font-normal">{index + 1}</div>
                        </div>
                      </th>
                      <th scope="col" className="border-r">
                        <div className="text-center">
                          <div className="font-normal">{productCode}</div>
                        </div>
                      </th>
                      <th scope="col" className="border-r">
                        <div className="flex justify-center items-center h-24 w-full">
                            {imageProduct && (
                              <Image src={imageProduct} alt="" width={70}
                                height={70} className="object-cover h-20" />
                            )}
                          </div>
                      </th>

                      <th scope="col" className="border-r">
                        <div className="flex-grow">
                          <div className="text-center w-80">
                            <div className="ml-2 py-2">
                              <div className="flex flex-grow font-semibold text-sm">
                                {detail?.product_info?.product_name}
                                {detail?.sku_info ? (
                                  <div>
                                    {detail?.sku_info.classify1_str}
                                    {detail?.sku_info.classify1_str &&
                                      detail?.sku_info.classify2_str &&
                                      "/"}
                                    {detail?.sku_info.classify2_str} (
                                    {detail?.sku_info.sku_code})
                                  </div>
                                ) : (
                                  <div>({detail?.product_info?.product_code})</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </th>
                      <th scope="col" className="border-r">
                        <div className="flex-shrink-0 font-normal text-center">
                          {productInfo?.unit_of_measure !== "null" && (
                            <div>{productInfo?.unit_of_measure}</div>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="border-r">
                        <div className="flex-shrink-0 font-normal text-center">
                          {detail?.quantity}
                        </div>
                      </th>
                      <th scope="col" className="border-r" key={index}>
                        <div className="flex-shrink-0 font-normal text-center w-28">
                          {formatMoney(
                            (detail?.product_info?.base_price || 0) +
                            (detail?.sku_info?.price || 0)
                          )}
                          đ
                        </div>
                      </th>
                      <th scope="col" className="border-r">
                        <div className="flex-shrink-0 text-center font-normal">
                          {quotation?.discount > 0 ? "-" : ""}
                          {formatMoney(quotation?.discount)}đ
                        </div>
                      </th>
                      <th scope="col" className="border-r">
                        <div className="flex-shrink-0 w-20 font-normal text-right">
                          <div>{formatMoney(quotation?.tax)}đ</div>
                        </div>
                      </th>
                      <th scope="col" className="border-r">
                        <div className="flex-shrink-0 w-28 font-normal text-right">
                          <div>
                            {formatMoney(detail?.unit_price * detail?.quantity)}đ
                          </div>
                        </div>
                      </th>
                    </tr>
                  );
                })}

                {quotation?.quotation_temp_product_info.map(
                  (tempDetail: any, index: number) => {
                    const productInfo = tempDetail?.product_info || {};
                    const tempProductIndex =
                      index + 1 + quotation?.quotation_product_info.length;
                    const productCode =
                      tempDetail?.temp_product_info?.product_code;

                    return (
                      <tr
                        style={{ borderTop: "1px solid lightgrey" }}
                        key={tempDetail.id}
                      >
                        <th scope="col" className="border-r">
                          <div className="text-center">
                            <div className="font-normal">
                              {tempProductIndex}
                            </div>
                          </div>
                        </th>
                        <th scope="col" className="border-r">
                          <div className="text-center">
                            <div className="font-normal">{productCode}</div>
                          </div>
                        </th>
                        <th scope="col" className="border-r">
                          <div className="flex-grow">
                            <div className="flex gap-3 items-center text-center w-80">
                              <div className="ml-2 py-2">
                                <div className="flex flex-grow font-semibold text-sm">
                                  {tempDetail?.temp_product_info?.product_name}
                                </div>
                              </div>
                            </div>
                          </div>
                        </th>

                        <th scope="col" className="border-r">
                          <div className="flex-shrink-0 font-normal text-center">
                            <div>
                              {tempDetail?.temp_product_info?.unit_of_measure}
                            </div>
                          </div>
                        </th>
                        <th scope="col" className="border-r">
                          <div className="flex-shrink-0 font-normal text-center">
                            {tempDetail?.quantity}
                          </div>
                        </th>
                        <th scope="col" className="border-r" key={index}>
                          <div className="flex-shrink-0 font-normal text-center w-28">
                            {formatMoney(
                              (productInfo?.base_price || 0) +
                                (tempDetail?.sku_info?.price || 0)
                            )}
                            đ{" "}
                          </div>
                        </th>
                        <th scope="col" className="border-r">
                          <div className="flex-shrink-0 text-center font-normal">
                            {quotation?.discount > 0 ? "-" : ""}
                            {formatMoney(quotation?.discount)}đ
                          </div>
                        </th>
                        <th scope="col" className="border-r">
                          <div className="flex-shrink-0 w-20 font-normal text-right">
                            <div>{formatMoney(quotation?.tax)}đ</div>
                          </div>
                        </th>
                        <th scope="col" className="border-r">
                          <div className="flex-shrink-0 w-28 font-normal text-right">
                            <div>
                              {formatMoney(
                                tempDetail?.unit_price * tempDetail?.quantity
                              )}
                              đ
                            </div>
                          </div>
                        </th>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center px-2 border-b border-r border-l bg-gray-100 border-gray-300"></div>
          <div className="flex items-center px-2 border-b border-r border-l bg-gray-100 border-gray-300">
            <div className="flex-grow mx-3 my-2 font-semibold">
              {t("crm.totalAmount")}
            </div>
            <div className="flex-shrink-0 mx-3 my-2 w-28 font-semibold text-right">
              {formatMoney(quotation?.total_price)}đ
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default QuotationDetail;
