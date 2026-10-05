"use client";

import TaxForm from "./TaxForm";
import { useGetSetupFinanceAppQuery } from "@/api/SetUp/apiSetup";
import ChangeQuantity from "@/components/FunctionsManagement/CRM/Order/ChangeQuantity";
import { addToCart, changeProductSku, removeFromCart, selectCart, updateCart } from "@/features/cartSlice";
import { RootState } from "@/store/store";
import { formatMoney } from "@/utils/common";
import { Button, Checkbox, Collapse, Empty, Form, Input, InputNumber, Popover, Select, Space } from "antd";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useEffect, useCallback, useMemo } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { FaPlus } from "react-icons/fa";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { MdRemoveCircleOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

const { Option } = Select;

interface Product {
  quantity: any;

  price?: number;
  purchase_discount?: number;
  tax_list: { amount: number }[];
}

function calculateTotalPriceWithoutTax(product: Product) {
  if (product.price && (!product.purchase_discount || product.price > product.purchase_discount)) {
    const priceAfterDiscount = ((product.price || 0) - (product.purchase_discount || 0)) * product.quantity;
    const totalPrice = priceAfterDiscount;

    return totalPrice;
  } else {
    return 0;
  }
}

function calculateTotalPriceWithTax(product: Product) {
  const totalPriceWithoutTax = calculateTotalPriceWithoutTax(product);

  const totalTaxAmount = product.tax_list
    ? product.tax_list.reduce((total, taxItem) => total + (taxItem.amount || 0), 0)
    : 0;

  const totalPriceWithTax = totalPriceWithoutTax + totalTaxAmount;
  return totalPriceWithTax;
}

function PurchaseOrderCart({ form, orderDetail }: { form: any; orderDetail?: any }) {
  const cartItems = useSelector((state: RootState) => selectCart(state));
  const [paid, setPaid] = useState<number>(0);
  const [cost, setCost] = useState([{ fee_type: "", amount: 0 }]);

  const dispatch = useDispatch();
  const t: any = useTranslations();
  const { data: setupFinance } = useGetSetupFinanceAppQuery();

  const onChangeSku = useCallback(
    ({ productId, skuId }: { productId: number; skuId: any }) => {
      const newSku = cartItems
        .find((product) => product.id === productId)
        ?.sku_list?.find((sku: any) => sku?.id === skuId);
      dispatch(changeProductSku({ productId: productId, newSku: newSku }));
    },
    [cartItems, dispatch]
  );

  const onChangeCost = (index: number, field: "fee_type" | "amount", value: string) => {
    const newCostData = [...cost];
    if (!newCostData[index]) {
      newCostData[index] = { fee_type: "", amount: 0 };
    }
    if (field === "fee_type") {
      newCostData[index].fee_type = value;
    } else if (field === "amount") {
      const numberValue = parseFloat(value);
      newCostData[index].amount = isNaN(numberValue) ? 0 : numberValue;
    }
    setCost(newCostData);
  };

  const totalCost = useMemo(() => {
    return cost.reduce((acc, current) => acc + current.amount, 0);
  }, [cost]);

  const totalPurchaseOrder = useMemo(() => {
    return cartItems.reduce((total, product) => {
      if (product.price !== undefined) {
        return total + calculateTotalPriceWithoutTax(product);
      }
      return total;
    }, 0);
  }, [cartItems]);

  const totalDiscount = useMemo(() => {
    return cartItems.reduce((total, product) => {
      if (product.purchase_discount !== undefined) {
        return total + product.purchase_discount * product.quantity;
      }
      return total;
    }, 0);
  }, [cartItems]);

  const totalTax = useMemo(() => {
    return cartItems.reduce((total, current) => {
      const taxListTotal = current.tax_list ? current.tax_list.reduce((sum, taxItem) => sum + taxItem.amount, 0) : 0;
      return total + taxListTotal;
    }, 0);
  }, [cartItems]);

  useEffect(() => {
    form.setFieldsValue({
      purchase_order_item_list: cartItems,
    });
  }, [cartItems]);

  useEffect(() => {
    form.setFieldsValue({
      total_price: totalPurchaseOrder + (totalCost || 0),
    });
  }, [totalPurchaseOrder]);

  useEffect(() => {
    form.setFieldsValue({
      discount_amount: totalDiscount || 0,
    });
  }, [totalDiscount]);

  useEffect(() => {
    form.setFieldsValue({
      fee_list: cost || 0,
    });
  }, [cost, totalCost]);

  useEffect(() => {
    form.setFieldsValue({
      total_paid: paid || 0,
    });
  }, [paid]);

  useEffect(() => {
    form.setFieldsValue({
      tax_amount: totalTax || 0,
    });
  }, [totalTax]);

  useEffect(() => {
    form.setFieldsValue({
      amount_payable: totalPurchaseOrder + totalCost,
    });
  }, [totalPurchaseOrder, totalCost]);

  const totalFee = useMemo(() => {
    return cost.reduce((sum: any, item: any) => sum + item.amount, 0);
  }, [cost]);
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, product) => {
      return total + (product.base_price + (product.sku.price || 0)) * product.quantity;
    }, 0);
  }, [cartItems]);
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

  const [selectedFees, setSelectedFees] = useState<string[]>([]);

  const handleSelectChange = (index: number, value: string) => {
    setSelectedFees((prev) => {
      const newSelected = [...prev];
      newSelected[index] = value;
      return newSelected;
    });

    onChangeCost(index, "fee_type", value);
  };
  return (
    <div className="mt-4 ">
      <Form.Item name="purchase_order_item_list" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="discount_amount" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="tax_amount" hidden>
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
          <div className="flex items-center border mt-6  bg-gray-100 border-gray-300">
            <div className="flex-grow m-3 font-semibold">Danh sách mua hàng</div>
            <div className="flex-shrink-0 m-2 text-center w-28  font-semibold">Số lượng</div>
            <div className="flex-shrink-0 mx-3 w-28 text-center font-semibold border-l border-r">
              <div className="py-3">{t("admin.importPrice")}</div>
            </div>

            <div className="flex-shrink-0 my-3 w-28 font-semibold text-center"></div>
            <div className="flex-shrink-0 mx-3 w-72 font-semibold text-center border-l relative ">
              <div className="py-3">Thuế</div>
            </div>
            <div className="flex-shrink-0 mx-3 w-32 font-semibold text-center border-l">
              <div className="py-3 ">{t("crm.totalPrice")}</div>
            </div>
          </div>
          {cartItems?.map((product, index) => (
            <div key={`f-${index}`} className="flex">
              <div className="flex w-full cursor-pointer flex-wrap text-sm  sm:text-base items-center">
                <Button
                  type="link"
                  className="mr-2 mt-1"
                  onClick={() => dispatch(removeFromCart({ id: product.id, skuId: product.sku.id || null }))}
                  icon={<MdRemoveCircleOutline size={20} />}
                  ghost
                  danger
                ></Button>
                <div className="flex-grow  hover:text-primary py-2">
                  <div>
                    {product.product_name}{" "}
                    {product?.sku_list && product?.sku_list.length > 0 && (
                      <span>
                        ( {product?.sku?.classify1_str} / {product?.sku?.classify2_str} )
                      </span>
                    )}
                  </div>
                  {product?.sku_list && product?.sku_list.length > 0 && (
                    <Select
                      value={product.sku?.id}
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
                <div className="flex-shrink-0 my-1 w-28 text-center ">
                  <ChangeQuantity product={product} />
                </div>

                <div className="flex-shrink-0 mx-3 w-28 text-center font-semibold border-l border-r">
                  <div className="py-3">
                    <InputNumber
                      defaultValue={0}
                      value={product.price ?? 0}
                      onChange={(value) => {
                        dispatch(
                          updateCart({
                            id: product.id,
                            skuId: product.sku.id || null,
                            price: Number(value) ?? 0,
                          })
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0  w-28 font-semibold text-center ">
                  <InputNumber
                    defaultValue={0}
                    value={product.purchase_discount ?? 0}
                    onChange={(value) => {
                      dispatch(
                        updateCart({
                          id: product.id,
                          skuId: product.sku.id || null,
                          purchase_discount: Number(value) ?? 0,
                        })
                      );
                    }}
                  />
                </div>
                <div className="flex-shrink-0 mx-3 w-72  text-center border-l">
                  {setupFinance?.tax_type_list && setupFinance?.tax_type_list.length > 0 && (
                    <TaxForm
                      taxListType={setupFinance.tax_type_list}
                      productId={product.id}
                      skuId={product.sku.id}
                      totalPriceProduct={calculateTotalPriceWithoutTax(product)}
                      cartItems={cartItems}
                    />
                  )}
                </div>
                <p className="my-1  flex-shrink-0 mx-3  w-32 text-right border-l ">
                  <div className="py-3">{formatMoney(calculateTotalPriceWithTax(product))}đ</div>
                </p>
              </div>
            </div>
          ))}
          <div className="flex justify-between px-1 items-center border bg-gray-100 border-gray-300 text-green-500">
            <div className=" m-2 font-semibold">{t("crm.discount")}</div>
            <div className="mx-2 w-36  text-right ">
              <div className="py-3">{totalDiscount > 0 ? "-" + formatMoney(totalDiscount) : 0}đ </div>
            </div>
          </div>
          <div className="flex justify-between px-1 items-center border bg-gray-100 border-gray-300 text-red-500">
            <div className=" m-2 font-semibold">{t("crm.tax")}</div>
            <div className="mx-2 w-36  text-right ">
              <div className="py-3">{totalTax > 0 ? "+" + formatMoney(totalTax) : 0}đ</div>
            </div>
          </div>
          <div className="flex justify-between px-1 items-center border bg-gray-100 border-gray-300 font-semibold">
            <div className=" m-2">{t("crm.totalOrderAndTax")}</div>
            <div className="mx-2 w-36  text-right ">
              <div className="py-3">{formatMoney(totalPurchaseOrder)}đ</div>
            </div>
          </div>
        </div>
      ) : (
        // </Scrollbars>
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 p-4 ">
          <Empty description={t("crm.cartYet")} />
        </div>
      )}
      <div className="mt-4 px-3 space-y-2">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          {/* <div className="w-full"> */}
          <div className="w-auto md:w-full max-sm:ml-2">
            <Collapse
              className="my-2"
              items={[
                {
                  key: "1",
                  label: (
                    <div className="flex justify-between">
                      <div className="font-semibold">{t("admin.cost")}</div>
                      <div>
                        {totalCost > 0 ? "+" : ""}
                        {formatMoney(totalCost)}đ
                      </div>
                    </div>
                  ),
                  children: (
                    <div className="flex flex-col gap-2">
                      <Form>
                        <Form.List name="fee_list" initialValue={[{ fee_type: "", amount: 0 }]}>
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }, index) => (
                                <div className="flex gap-6 w-auto md:w-full items-center mb-6">
                                  <div className="flex gap-2 items-center w-auto md:w-full">
                                    <div className="w-28">{t("admin.costName")}</div>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "fee_type"]}
                                      rules={[{ required: true, message: t('admin.selectFeeType') }]}
                                      className="mb-1 w-full"
                                    >
                                      <Select
                                        placeholder={t("admin.selectFeeType")}
                                        onChange={(e) => handleSelectChange(index, e)}
                                        value={selectedFees[index]}
                                        className="w-full"
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
                                    <div className="w-28 text-right">{t("chart.amountOfMoney")} :</div>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "amount"]}
                                      rules={[{ required: true, message: t('chart.fillInTheAmount') }]}
                                      noStyle
                                    >
                                      <InputNumber
                                        style={{ width: "100%" }}
                                        defaultValue={0}
                                        controls={false}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                        parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                                        onChange={(value) => onChangeCost(index, "amount", value)}
                                      />
                                    </Form.Item>
                                  </div>
                                  {fields.length > 1 && (
                                    <Button type="link" onClick={() => remove(name)} ghost danger>
                                      Xóa
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Form.Item>
                                <Button type="dashed" onClick={() => add()} block>
                                  Thêm chi phí
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Form>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
        <div className="flex items-center px-4 justify-between ">
          <div className=" mb-1 font-bold ">{t("crm.totalInvoice")}</div>
          <div>{formatMoney(totalPurchaseOrder + totalCost)}đ</div>
        </div>
        <div className="!mb-4">
          <Form.Item name="total_paid">
            <InputNumber
              className="w-full"
              addonBefore={t("finance.paid")}
              addonAfter="đ"
              value={paid}
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

export default PurchaseOrderCart;
