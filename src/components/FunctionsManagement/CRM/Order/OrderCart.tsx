"use client";

import ChangeQuantity from "./ChangeQuantity";
import { useGetSetupFinanceAppQuery } from "@/api/SetUp/apiSetup";
import { changeProductSku, selectCart } from "@/features/cartSlice";
import { RootState } from "@/store/store";
import { formatMoney } from "@/utils/common";
import { Button, Collapse, Empty, Form, Input, InputNumber, Select } from "antd";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useEffect, useCallback, useMemo } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { useDispatch, useSelector } from "react-redux";

const { Option } = Select;

function OrderCart({ form, orderDetail, edit }: { form: any; orderDetail?: any; edit?: boolean }) {
  const cartItems = useSelector((state: RootState) => selectCart(state));
  const [selectBeforeDiscount, setSelectBeforeDiscount] = useState("%");
  const [selectBeforeTax, setSelectBeforeTax] = useState("%");
  const [discount, setDiscount] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [paid, setPaid] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [totalTax, setTotalTax] = useState(0);
  const dispatch = useDispatch();
  const t: any = useTranslations();
  const [fee, setFee] = useState([{ fee_type: 1, amount: 0 }]);
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const { data: setupFinance } = useGetSetupFinanceAppQuery();

  const handleSelectChange = (index: number, value: number) => {
    setSelectedFees((prev) => {
      const newSelected = [...prev];
      newSelected[index] = value.toString();
      return newSelected;
    });
    onChangeFee(index, "fee_type", value);
  };

  const onChangeSku = useCallback(
    ({ productId, skuId }: { productId: number; skuId: any }) => {
      const newSku = cartItems
        .find((product) => product.id === productId)
        ?.sku_list?.find((sku: any) => sku.id === skuId);
      dispatch(changeProductSku({ productId: productId, newSku: newSku }));
    },
    [cartItems, dispatch]
  );

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, product) => {
      return total + (product.base_price + (product.sku.price || 0)) * product.quantity;
    }, 0);
  }, [cartItems]);

  const selectAfterTax = (
    <Select defaultValue="%" style={{ width: 250 }} onChange={(e) => setSelectBeforeTax(e)}>
      <Option value="%">{t("crm.tax%OfOrder")}</Option>
      <Option value="đ">{t("crm.taxAccordingToOrderValue")}</Option>
    </Select>
  );

  const selectAfterDiscount = (
    <Select defaultValue="%" style={{ width: 250 }} onChange={(e) => setSelectBeforeDiscount(e)}>
      <Option value="%">{t("crm.%OfOrder")}</Option>
      <Option value="đ">{t("crm.discountValue")}</Option>
    </Select>
  );

  useEffect(() => {
    if (selectBeforeTax === "%") {
      setTotalTax((totalPrice / 100) * tax);
    } else {
      setTotalTax(tax);
    }
  }, [selectBeforeTax, tax, totalPrice, paid]);

  useEffect(() => {
    if (selectBeforeDiscount === "%") {
      setTotalDiscount((totalPrice / 100) * discount);
    } else {
      setTotalDiscount(discount);
    }
  }, [selectBeforeDiscount, discount, totalPrice, paid]);

  useEffect(() => {
    if (edit && orderDetail) {
      const taxAmount = orderDetail?.tax_amount || 0;
      const discountAmount = orderDetail?.discount_amount || 0;
      const totalPrice = orderDetail?.total_price || 1;
      const taxPercentage = (taxAmount / totalPrice) * 100;
      const discountPercentage = (discountAmount / totalPrice) * 100;
      setTax(taxPercentage);
      setDiscount(discountPercentage);
      setPaid(orderDetail?.total_paid);
      const feeListCopy = orderDetail.fee_list.map((fee: any) => ({ ...fee }));
      setFee(feeListCopy);
      form.setFieldsValue({
        fee_list: feeListCopy,
      });
    }
  }, [edit]);

  const onChangeFee = (index: number, field: "fee_type" | "amount", value: number) => {
    const newFeeData = [...fee];
    if (!newFeeData[index]) {
      newFeeData[index] = { fee_type: 1, amount: 0 };
    }
    if (field === "fee_type") {
      newFeeData[index].fee_type = value;
    } else if (field === "amount") {
      newFeeData[index].amount = isNaN(value) ? 0 : value;
    }
    setFee(newFeeData);
  };

  const totalFee = useMemo(() => {
    return fee.reduce((sum, item) => sum + item.amount, 0);
  }, [fee]);

  useEffect(() => {
    form.setFieldsValue({
      order_list: cartItems,
      total_price: totalPrice,
      tax: totalTax,
      paid: paid,
      discount: totalDiscount,
      amount_payable: totalPrice + totalTax - totalDiscount + totalFee,
    });
  }, [cartItems, totalPrice, totalTax, totalDiscount, paid, totalFee, form]);

  return (
    <div className="mt-4 ">
      <Form.Item name="order_list" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="tax" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="discount" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="total_price" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="amount_payable" hidden>
        <Input />
      </Form.Item>

      {cartItems?.length > 0 ? (
        // <Scrollbars
        //   style={{ height: "calc(100vh - 580px)" }}
        //   className="rounded-lg border border-gray-200 min-h-[400px]"
        // >
        <div className="divide-y divide-gray-200 px-4">
          {cartItems?.map((product, index) => (
            <div key={`f-${index}`}>
              <div className="flex w-full cursor-pointer flex-wrap items-center text-sm py-2 sm:text-base">
                <div className="w-full pr-2 hover:text-primary sm:w-2/4">
                  <div>
                    {product.product_name}{" "}
                    {product?.sku_list.length > 0 && (
                      <span>
                        ( {product.sku.classify1_str} / {product.sku.classify2_str} )
                      </span>
                    )}
                  </div>
                  {product?.sku_list.length > 0 && (
                    <Select
                      value={product.sku.id}
                      onChange={(skuId) => onChangeSku({ productId: product.id, skuId: skuId })}
                    >
                      {product?.sku_list.map((item: any) => (
                        <Option key={item.id} value={item.id}>
                          {item.classify1_str} / {item.classify2_str}
                        </Option>
                      ))}
                    </Select>
                  )}
                </div>
                <div className="sm:order-0 order-1 my-1 w-1/2 pr-3 text-center sm:w-1/4 md:pr-0">
                  <ChangeQuantity product={product} />
                </div>
                <p className="my-1 w-1/2 whitespace-nowrap pr-4 text-left sm:order-1 sm:w-1/4 sm:text-right md:w-1/4">
                  {formatMoney((product.base_price + (product?.sku?.price || 0)) * product.quantity)}đ
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // </Scrollbars>
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 p-4 ">
          <Empty description={t("crm.cartYet")} />
        </div>
      )}

      <div className="mt-4 space-y-2">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          {/* <div className="w-full"> */}
          <div className="w-auto md:w-full max-sm:ml-2">
            <Collapse
              className="my-2"
              items={[
                {
                  key: "1",
                  label: `${t('table.taxesDeductions')}`,
                  children: (
                    <div className="flex flex-col gap-2">
                      <InputNumber
                        addonBefore={selectAfterTax}
                        addonAfter={selectBeforeTax}
                        value={parseFloat(tax.toFixed(2))}
                        onChange={(value) => setTax(value || 0)}
                      />

                      <InputNumber
                        addonBefore={selectAfterDiscount}
                        addonAfter={selectBeforeDiscount}
                        value={parseFloat(discount.toFixed(2))}
                        onChange={(value) => setDiscount(value || 0)}
                      />
                    </div>
                  ),
                },
              ]}
            />
            <Collapse
              className="my-2"
              items={[
                {
                  key: "1",
                  label: `${t('admin.cost')}`,
                  children: (
                    <div className="flex flex-col gap-2">
                      <Form.List name="fee_list" initialValue={[{ fee_type: "", amount: 0 }]}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <div className="flex gap-6 w-auto md:w-full items-center">
                                <div className="flex gap-2 items-center w-auto md:w-full">
                                  <div className="w-24">{t('admin.costName')}</div>
                                  <Form.Item
                                    {...restField}
                                    name={[name, "fee_type"]}
                                    rules={[{ required: true, message: `${t('admin.selectFeeType')}` }]}
                                    noStyle
                                  >
                                    <Select
                                      placeholder={t('admin.selectFeeType')}
                                      onChange={(e) => handleSelectChange(index, parseFloat(e))}
                                      value={selectedFees[index]}
                                      className="w-auto md:w-full"
                                    >
                                      {setupFinance?.fee_type_list
                                        .filter(
                                          (fee: any) => !selectedFees.includes(fee.id) || fee.id === selectedFees[index]
                                        )
                                        .map((fee: any) => (
                                          <Select.Option key={fee.id} value={fee.id}>
                                            {fee.title}
                                          </Select.Option>
                                        ))}
                                    </Select>
                                  </Form.Item>
                                </div>
                                <div className="flex gap-2 items-center w-auto md:w-full">
                                  <div className="w-20 text-right">{t('chart.amountOfMoney')}</div>
                                  <Form.Item
                                    {...restField}
                                    name={[name, "amount"]}
                                    rules={[{ required: true, message: "Điền số tiền" }]}
                                    noStyle
                                  >
                                    <InputNumber
                                      style={{ width: "100%" }}
                                      defaultValue={0}
                                      controls={false}
                                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                      parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                                      onChange={(value) => onChangeFee(index, "amount", value)}
                                    />
                                  </Form.Item>
                                </div>
                                {fields.length > 1 && (
                                  <Button type="link" onClick={() => remove(name)} ghost danger>
                                    {t('general.delete')}
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Form.Item>
                              <Button type="dashed" onClick={() => add()} block>
                                {t('noficationAddAndUpdate.additionalCosts')}
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center px-2 justify-between">
          <div className=" mb-1">{t("crm.totalInvoice")}</div>
          <div>{formatMoney(totalPrice)}đ</div>
        </div>

        <div className="flex items-center px-2 justify-between">
          <div className=" mb-1">{t("crm.tax")}</div>
          <div className="text-gray-500">
            {totalTax > 0 ? "+" : ""}
            {formatMoney(totalTax)}đ
          </div>
        </div>

        <div className="flex items-center px-2 justify-between">
          <div className=" mb-1">{t("crm.discount")}</div>
          <div className="text-red-500">
            {totalDiscount > 0 ? "-" : ""}
            {formatMoney(totalDiscount)}đ
          </div>
        </div>
        <div className="flex items-center px-2 justify-between">
          <div className=" mb-1">{t('admin.fee')}</div>
          <div className="text-yellow-400">
            {totalFee > 0 ? "+" : ""}
            {formatMoney(totalFee)}đ
          </div>
        </div>
        <div className="flex items-center px-2 justify-between">
          <div className="font-semibold">{t("crm.totalPrice")}</div>
          <div className="font-semibold">{formatMoney(totalPrice + totalTax - totalDiscount + totalFee)}đ</div>
        </div>
        <div className="!mb-4">
          <Form.Item name="paid">
            <InputNumber
              className="w-full"
              addonBefore={t("finance.paid")}
              addonAfter="đ"
              defaultValue={0}
              onChange={(value) => setPaid(value || 0)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </div>
      </div>
    </div>
  );
}

export default OrderCart;
