import DetailPrintStockOut from "./DetailPrintStockOut";
import { formatMoney } from "@/utils/common";
import { Button, Modal } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { useWindowSize } from "@/utils/responsiveSm";

const PrintStockOut = ({ order }: { order: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const [width] = useWindowSize();
  
  const transactionList = useMemo(() => {
    const filteredItems = order?.inventory_transactions.filter((item: { quantity: number }) => item.quantity > 0);
    const groupedByDate = new Map();

    if (filteredItems) {
      // Tạo một đối tượng để lưu trữ các item có cùng product và sku
      const groupedItemsMap = new Map();

      filteredItems.forEach((item: any) => {
        // Lấy key dựa trên product và sku
        const key = `${item.product_info.id}_${item.sku_info?.id}`;
        if (!groupedItemsMap.has(key)) {
          groupedItemsMap.set(key, {
            items: [],
            total_quantity: 0,
          });
        }
        // Thêm item vào danh sách items và cộng quantity
        const group = groupedItemsMap.get(key);
        group.items.push(item);
        group.total_quantity += item.quantity;

        // Lấy ngày gộp
        const dateKey = item.created.slice(0, 19);
        if (!groupedByDate.has(dateKey)) {
          groupedByDate.set(dateKey, []);
        }
        groupedByDate.get(dateKey).push(item);
      });

      // Tạo mảng kết quả
      const resultArray = Array.from(groupedByDate.values()).map((group) => {
        // Tính total_price cho từng mảng con
        const total_price = group.reduce((accumulator: any, item: any) => {
          const itemPrice = item.product_info.base_price + (item.sku_info?.price || 0);
          const itemValue = itemPrice * item.quantity;
          return accumulator + itemValue;
        }, 0);

        // Tạo đối tượng product_list cho mảng con
        const product_list = group.map((item: any) => ({
          ...item,
          total_price: formatMoney(item.product_info.base_price + (item.sku_info?.price || 0) * item.quantity),
        }));

        return { product_list, total_price: formatMoney(total_price) };
      });
      if (resultArray.length > 1) {
        const firstObject = {
          product_list: Array.from(groupedItemsMap.values())
            .map((group) => group.items)
            .flat(),
          total_price: formatMoney(
            Array.from(groupedItemsMap.values()).reduce(
              (accumulator, group) =>
                accumulator +
                group.items.reduce(
                  (itemTotal: any, item: any) =>
                    itemTotal + (item.product_info.base_price + (item.sku_info?.price || 0)) * item.quantity,
                  0
                ),
              0
            )
          ),
        };
        resultArray.unshift(firstObject);
      }

      return resultArray;
    }

    return [];
  }, [order?.inventory_transactions]);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
      className={` ${width < 640 ? "" : " border-1 border-red-500"}`}
      onClick={showModal} 
      size="small">
        {t('table.printAndExport')}
      </Button>
      <Modal open={isModalOpen} onCancel={handleCancel} width={800} title={t('table.printExport')} footer={null}>
        <div className="mt-6">
          {transactionList.map((detail, index) => (
            <div key={index} className="px-2">
              {index === 0 ? (
                <div className="flex justify-between items-center bg-slate-100 p-2">
                  <div className="ml-2 font-semibold">
                    {" "}
                    {t('table.orderRefCodeAll')} {order.ref_code}
                  </div>
                  <DetailPrintStockOut order={order} detailStockOut={detail} />
                </div>
              ) : (
                <div className="flex justify-between items-center bg-slate-100 p-2">
                  <div className="ml-2 font-semibold">
                  {t('table.orderRefCode')} {order.ref_code} {t('task.date')}
                    {dayjs(detail.product_list[0].created).format("DD/MM/YYYY")} {t('general.time')}
                    {dayjs(detail.product_list[0].created).format("HH:mm")}
                  </div>

                  <DetailPrintStockOut order={order} detailStockOut={detail} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default PrintStockOut;
