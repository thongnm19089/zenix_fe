import { useCreateStockOutMutation } from "@/api/Inventory/apiInventory";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import { Button, Form, InputNumber, Modal, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useWindowSize } from "@/utils/responsiveSm";

interface OrderProps {
  id: number;
  product: { id: number };
  sku: { id: number };
  quantity: number;
  ref_code: string;
  inventory_transactions: any;
  order_details_list: any;
}

interface OrderDetailProps {
  id: number;
  product: { id: number };
  sku: { id: number };
  quantity: number;
}

interface WarehouseDetailProps {
  product: number;
  sku: number;
  warehouse_info: { id: number; name: string };
  quantity: number;
}

interface WarehouseItem {
  id: number;
  name: string;
  quantity: number;
}

interface StockOutDetail {
  quantity: number;
  // Các thuộc tính khác của stock_out_detail
}

type StockOutDetails = Record<string, StockOutDetail>;

const warehouseInventory = (inventory: WarehouseDetailProps[]): WarehouseItem[] => {
  const consolidated: { [key: string]: WarehouseItem } = {};

  inventory?.forEach((item) => {
    if (item?.warehouse_info?.id !== null) {
      const key = item.product + "_" + item.sku + "_" + item?.warehouse_info?.id;
      if (!consolidated[key]) {
        consolidated[key] = { id: item?.warehouse_info?.id, name: item?.warehouse_info?.name, quantity: 0 };
      }
      consolidated[key].quantity += item.quantity;
    }
  });

  return Object.values(consolidated);
};

const containsNegativeQuantity = (items: Array<{ quantity: number }>, decrementQuantity: any) => {
  const allZero = items.every((item) => item?.quantity === 0);
  const hasNegative = Object.values(decrementQuantity).some((value: any) => value < 0);

  return allZero || hasNegative;
};

const CreateStockOut = ({ order, refetch }: { order: OrderProps; refetch: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [inputValues, setInputValues] = useState<any>({});
  const [decrementQuantity, setDecrementQuantity] = useState<any>({});

  const { data: setupCrmApp } = useGetSetupCrmAppQuery();

  const [createStockOut, { isLoading: isLoadingCreate }] = useCreateStockOutMutation();

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const getProductDetails = useMemo(() => {
    const inventoryQuantities = order?.inventory_transactions.reduce(
      (acc: any, transaction: { quantity: number; product: number; sku: number | null }) => {
        const key = `${transaction.product}-${transaction.sku}`;
        acc[key] = (acc[key] || 0) + transaction.quantity;
        return acc;
      },
      {}
    );

    return order?.order_details_list.map((orderDetail: OrderDetailProps) => {
      let productMatch = setupCrmApp?.product_list?.find((p: { id: number }) => p.id === orderDetail.product.id);

      if (!productMatch) return null;

      let skuMatch: any = null;
      if (orderDetail.sku && productMatch.sku_list) {
        skuMatch = productMatch.sku_list.find((skuItem: { id: number }) => skuItem.id === orderDetail.sku.id);
      }

      let filteredInventory = skuMatch
        ? productMatch.inventory_detail?.filter((inventoryItem: { sku?: number }) => inventoryItem.sku === skuMatch.id)
        : productMatch.inventory_detail;

      let consolidatedInventory = warehouseInventory(filteredInventory);

      const totalQuantityKey = `${productMatch.id}-${skuMatch ? skuMatch.id : "null"}`;
      const stockOutQuantity = inventoryQuantities[totalQuantityKey] || 0;

      return {
        id: productMatch.id,
        sku: skuMatch ? skuMatch.id : 0,
        product: productMatch,
        quantity: orderDetail.quantity,
        stockOutQuantity: stockOutQuantity,
        inventoryDetail: consolidatedInventory,
      };
    });
  }, [order, setupCrmApp?.product_list]);

  useEffect(() => {
    const initialValues: any = {};
    getProductDetails?.forEach((productDetails: any) => {
      productDetails?.inventoryDetail.forEach((detail: any) => {
        const key = `${productDetails.id}-${productDetails.sku}-${detail.id}`;
        initialValues[key] = 0;
      });
    });
    setInputValues(initialValues);
  }, [getProductDetails]);
  const handleInputChange = (
    productId: { productId: number },
    skuId: { skuId: number },
    warehouseId: { warehouseId: number },
    quantity: { quantity: number },
    changedQuantity: { changedQuantity: any }
  ) => {
    const key = `${productId}-${skuId}-${warehouseId}`;
    setInputValues((prev: any) => ({
      ...prev,
      [key]: quantity,
    }));
    setDecrementQuantity((prev: any) => ({
      ...prev,
      [key]: changedQuantity,
    }));
  };
  const calculateTotal = (productId: number, skuId: number) => {
    const groupKeyPrefix = `${productId}-${skuId}`;
    return Object.entries(inputValues)
      .filter(([key, _]) => key.startsWith(groupKeyPrefix))
      .reduce((acc, [_, value]) => acc + (value as number), 0);
  };

  const onFinish = async (values: any) => {
    try {
      // Chuyển đổi và lọc các mục từ Object.entries
      const entries = Object.entries(values.stock_out_detail) as [string, StockOutDetail][];
      const filteredStockOutDetails = entries
        .filter(([key, value]) => value.quantity > 0)
        .reduce((acc: StockOutDetails, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as StockOutDetails);

      const body = {
        order: order.id,
        stock_out_detail: Object.values(filteredStockOutDetails),
      };

      if (containsNegativeQuantity(Object.values(filteredStockOutDetails), decrementQuantity)) {
        notification.error({
          message: `${t('noficationAddAndUpdate.containsNegativeQuantity')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        const result = await createStockOut(body);

        if (result && "error" in result) {
          notification.error({
            message: `${t('noficationAddAndUpdate.exportStockOutError')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          refetch();
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `${t('noficationAddAndUpdate.exportStockOutSuccess')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Button type={width < 640 ? "text" : "primary"}
      className={` ${width < 640 }`}
      onClick={showModal}
      size="small">
        {t('detailFunction.Stock-out')}
      </Button>
      <Modal
        title={`${t('noficationAddAndUpdate.exportOrder')} ${order.ref_code}`}
        open={isModalOpen}
        width={1200}
        onOk={() => form.submit()}
        onCancel={handleCancel}
      >
        <div className=" overflow-x-auto overflow-hidden">
          <div className="w-[1150px]">
            <div className="flex items-center pl-3 pr-4 border mt-6  bg-gray-100 border-gray-300">
              <div className="flex-grow m-3 font-semibold">{t('crm.orderList')}</div>
              <div className="flex-shrink-0 m-2 text-center w-28  font-semibold">{t('table.quantityNumber')}</div>
              <div className="flex-shrink-0 m-3 w-72 text-center font-semibold">{t('table.warehouseExport')}</div>
              <div className="flex-shrink-0 m-3 w-28 font-semibold text-center">{t('table.quantityExport')}</div>
            </div>
            <Form form={form} onFinish={onFinish} className="mb-4">
              {getProductDetails.map((productDetails: any, idx: number) => {
                if (!productDetails) return null;

                return (
                  <div
                    className="flex items-center pl-3 pr-4 border-r border-l border-b  border-gray-300"
                    key={productDetails.id + "-" + idx}
                  >
                    <div className="flex-grow m-3">
                      <div className="flex gap-4 items-center">
                        <div>
                          <div className="border-2 w-[50px] h-[50px]">
                            <Image
                              src={productDetails?.product.image_list[0]?.image}
                              className="object-cover"
                              width={50}
                              height={50}
                              alt={productDetails?.product.image_list[0]?.atl_text || "sản phẩm"}
                            />
                          </div>
                        </div>
                        <div>
                          <div className=" font-semibold text-sm">
                            {productDetails.product.product_name}{" "}
                            {productDetails?.product.sku_list.length > 0 &&
                              productDetails?.product.sku_list.map(
                                (sku: {
                                  id: number;
                                  classify1_str: string;
                                  classify2_str: string;
                                  sku_code: string;
                                }) => {
                                  if (sku.id === productDetails.sku) {
                                    return (
                                      <div key={sku.id}>
                                        {sku.classify1_str} / {sku.classify2_str} ({sku.sku_code})
                                      </div>
                                    );
                                  } else {
                                    return null;
                                  }
                                }
                              )}
                          </div>
                          <div className=" text-sm">{productDetails?.product?.category_str}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 m-2 text-center w-28 text-sm font-semibold">
                      {productDetails?.quantity}
                    </div>
                    <div className="flex-shrink-0 m-3 w-72 ">
                      <Form.List name="stock_out_detail">
                        {() => (
                          <>
                            {productDetails?.inventoryDetail?.map(
                              (detail: { id: any; name: string; quantity: number }) => (
                                <>
                                  <Form.Item
                                    key={productDetails.id + "-" + productDetails.sku + "-" + detail.id}
                                    name={[productDetails.id + "-" + productDetails.sku + "-" + detail.id, "quantity"]}
                                    initialValue={
                                      inputValues[`${productDetails.id}-${productDetails.sku}-${detail.id}`]
                                    }
                                    className="my-3"
                                  >
                                    <InputNumber
                                      addonBefore={
                                        <div className="w-32 text-left">
                                          {detail.name}:{" "}
                                          {detail.quantity -
                                            inputValues[`${productDetails.id}-${productDetails.sku}-${detail.id}`]}
                                        </div>
                                      }
                                      disabled={
                                        calculateTotal(productDetails.id, productDetails.sku) +
                                          productDetails.stockOutQuantity ===
                                          productDetails?.quantity
                                          ? true
                                          : false
                                      }
                                      min={0}
                                      max={detail.quantity}
                                      defaultValue={0}
                                      onChange={(value: any) =>
                                        handleInputChange(productDetails.id, productDetails.sku, detail.id, value, {
                                          changedQuantity:
                                            productDetails?.quantity - value - productDetails.stockOutQuantity,
                                        })
                                      }
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    name={[productDetails.id + "-" + productDetails.sku + "-" + detail.id, "product"]}
                                    initialValue={productDetails.id}
                                    hidden
                                  ></Form.Item>
                                  <Form.Item
                                    name={[productDetails.id + "-" + productDetails.sku + "-" + detail.id, "sku"]}
                                    initialValue={productDetails.sku !== 0 ? productDetails.sku : null}
                                    hidden
                                  ></Form.Item>
                                  <Form.Item
                                    name={[productDetails.id + "-" + productDetails.sku + "-" + detail.id, "warehouse"]}
                                    initialValue={detail.id}
                                    hidden
                                  ></Form.Item>
                                </>
                              )
                            )}
                          </>
                        )}
                      </Form.List>
                    </div>
                    <div
                      className={`flex-shrink-0 m-3 w-28  text-center ${calculateTotal(productDetails.id, productDetails.sku) + productDetails.stockOutQuantity ===
                        productDetails?.quantity && "text-green-500"
                        } ${calculateTotal(productDetails.id, productDetails.sku) + productDetails.stockOutQuantity !==
                        productDetails?.quantity &&
                        calculateTotal(productDetails.id, productDetails.sku) + productDetails.stockOutQuantity !== 0 &&
                        "text-red-500"
                        }`}
                    >
                      <div className="font-bold relative">
                        {calculateTotal(productDetails.id, productDetails.sku) + productDetails.stockOutQuantity}
                      </div>
                      {calculateTotal(productDetails.id, productDetails.sku) + productDetails.stockOutQuantity >
                        productDetails?.quantity && (
                          <div className="text-xs italic absolute w-24 ml-2">{t('table.quantityNumberError')}</div>
                        )}
                    </div>
                  </div>
                );
              })}
            </Form>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CreateStockOut;
