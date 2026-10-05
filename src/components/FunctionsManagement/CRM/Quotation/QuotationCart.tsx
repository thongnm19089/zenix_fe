"use client";

import AddProduct from "./AddProduct";
import { useGetSetupCrmAppQuery, useGetSetupFinanceAppQuery } from "@/api/SetUp/apiSetup";
import { changeProductSku, selectCart } from "@/features/cartSlice";
import { RootState } from "@/store/store";
import { formatMoney } from "@/utils/common";
import { Button, Col, Collapse, Empty, Form, Input, InputNumber, Row, Select, Table } from "antd";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

const { Option } = Select;

function QuotaitonCart({
  form,
  edit,
  productListTable,
  setProductListTable,
}: {
  form: any;
  edit?: boolean;
  productListTable: any;
  setProductListTable: any;
}) {
  const [selectBeforeDiscount, setSelectBeforeDiscount] = useState("%");
  const [selectBeforeTax, setSelectBeforeTax] = useState("%");
  const [discount, setDiscount] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [tax, setTax] = useState<number>(0);
  const [totalTax, setTotalTax] = useState(0);
  const t: any = useTranslations();

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

    form.setFieldsValue({
      amount_payable: totalPrice + totalTax - totalDiscount,
      tax: totalTax,
    });
  }, [selectBeforeTax, tax, totalPrice]);

  useEffect(() => {
    if (selectBeforeDiscount === "%") {
      setTotalDiscount((totalPrice / 100) * discount);
    } else {
      setTotalDiscount(discount);
    }
    form.setFieldsValue({
      amount_payable: totalPrice + totalTax - totalDiscount,
      discount: totalDiscount,
    });
  }, [selectBeforeDiscount, discount, totalPrice, tax]);

  // useEffect(() => {
  //   if (edit && orderDetail) {
  //     const taxAmount = orderDetail?.tax_amount || 0;
  //     const discountAmount = orderDetail?.discount_amount || 0;
  //     const totalPrice = orderDetail?.total_price || 1;
  //     const taxPercentage = (taxAmount / totalPrice) * 100;
  //     const discountPercentage = (discountAmount / totalPrice) * 100;
  //     setTax(taxPercentage);
  //     setDiscount(discountPercentage);
  //     setPaid(orderDetail?.total_paid);
  //   }
  // }, [edit]);

  useEffect(() => {
    const values = form.getFieldsValue();
    const totalAmount = (values.product_list || []).reduce((sum: number, item: { quantity: number; price: number }) => {
      return sum + (item?.quantity || 0) * (item?.price || 0);
    }, 0);
    form.setFieldsValue({
      product_list: productListTable,
      total_price: totalAmount,
    });
    setTotalPrice(totalAmount);
  }, [productListTable]);
  return (
    <div className="mt-4 ">
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

      <div className="space-y-2">
        <div className="flex flex-col items-center gap-2 sm:gap-4">
          <div className="w-full">
            <Row gutter={16} className="border-b border-t">
              <Col span={1} className="border-r p-2 border-l flex justify-center">
                <AddProduct setProductListTable={setProductListTable} productListTable={productListTable} />
              </Col>
              <Col span={3} className="border-r p-2 flex items-center">
                <strong>Mã SP</strong>
              </Col>
              <Col span={7} className="border-r p-2 flex items-center ">
                <strong>Tên sản phẩm</strong>
              </Col>
              <Col span={3} className="border-r p-2 flex justify-center items-center">
                <strong>Đơn vị tính</strong>
              </Col>
              <Col span={2} className="border-r p-2 flex justify-center items-center">
                <strong>Số lượng</strong>
              </Col>
              <Col span={4} className="border-r p-2 flex justify-center items-center">
                <strong>Đơn giá</strong>
              </Col>
              <Col span={4} className="border-r p-2 flex justify-center items-center">
                <strong>Thành tiền</strong>
              </Col>
            </Row>

            <Form.List name="product_list">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => {
                    const isKey = form.getFieldValue(["product_list", name, "key"]);
                    const productCode = form.getFieldValue(["product_list", name, "product_code"]);
                    const productName = form.getFieldValue(["product_list", name, "product_name"]);
                    const unitOfMeasure = form.getFieldValue(["product_list", name, "unit_of_measure"]);
                    const quantity = form.getFieldValue(["product_list", name, "quantity"]) || 0;
                    const price = form.getFieldValue(["product_list", name, "price"]) || 0;
                    const totalAmount = quantity * price;

                    return (
                      <Row key={key} gutter={16} className="border-b ">
                        <Col span={1} className="border-r p-2 h-12 border-l flex justify-center">
                          <Button type="link" onClick={() => remove(name)} ghost danger>
                            Xóa
                          </Button>
                        </Col>
                        <Form.Item {...restField} name={[name, "id"]} hidden>
                          <Input />
                        </Form.Item>
                        <Col span={3} className="border-r p-2 h-12">
                          <Form.Item
                            {...restField}
                            name={[name, "product_code"]}
                            noStyle
                            hidden={isKey !== undefined ? true : false}
                          >
                            <Input />
                          </Form.Item>
                          {isKey && <div className="flex items-center flex-1 h-full">{productCode}</div>}
                        </Col>
                        <Col span={7} className="border-r p-2 h-12">
                          <Form.Item {...restField} name={[name, "product_name"]} noStyle hidden={isKey ? true : false}>
                            <Input />
                          </Form.Item>
                          {isKey && <div className="flex items-center flex-1 h-full">{productName}</div>}
                        </Col>
                        <Col span={3} className="border-r p-2 h-12">
                          <Form.Item
                            {...restField}
                            name={[name, "unit_of_measure"]}
                            noStyle
                            hidden={isKey ? true : false}
                          >
                            <Input />
                          </Form.Item>
                          {isKey && (
                            <div className="flex items-center flex-1  h-full justify-center">{unitOfMeasure}</div>
                          )}
                        </Col>
                        <Col span={2} className="border-r p-2 h-12">
                          <Form.Item {...restField} name={[name, "quantity"]} noStyle>
                            <InputNumber defaultValue={0} className="w-full" />
                          </Form.Item>
                        </Col>
                        <Col span={4} className="border-r p-2 h-12">
                          <Form.Item {...restField} name={[name, "price"]} noStyle>
                            <InputNumber
                              defaultValue={0}
                              className="w-full"
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4} className="border-r p-2 h-12">
                          <div className="flex items-center justify-end h-full">{formatMoney(totalAmount)}</div>
                        </Col>
                      </Row>
                    );
                  })}
                  <Row>
                    <Col span={24} className="mt-4 ">
                      <Button type="dashed" onClick={() => add()} block>
                        Thêm dòng
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
            </Form.List>
          </div>

          <div className="w-auto md:w-full max-sm:ml-2">
            <Collapse
              className="my-2"
              items={[
                {
                  key: "1",
                  label: `Thuế, chiếu khấu`,
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
          <div className="font-semibold">{t("crm.totalPrice")}</div>
          <div className="font-semibold mb-4">{formatMoney(totalPrice + totalTax - totalDiscount)}đ</div>
        </div>
      </div>
    </div>
  );
}

export default QuotaitonCart;
