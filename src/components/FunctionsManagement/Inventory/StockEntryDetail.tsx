"use client";

import AlertLevel from "./AlertLevel";
import { Button, Modal, Tag } from "antd";
import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useWindowSize } from "@/utils/responsiveSm";

const StockEntryDetail = ({ data }: { data: any }) => {
  const [open, setOpen] = useState(false);
  const t: any = useTranslations();
  const [width] = useWindowSize();

  console.log("inventory_detail", data);

  // Lọc thông tin chi tiết kho dựa trên SKU (nếu có)
  const filteredInventoryDetails = useMemo(() => {
    if (data?.sku) {
      // Chỉ lấy thông tin chi tiết kho của SKU cụ thể
      return data.inventory_detail.filter((detail: any) => detail.sku === data.sku.id);
    }
    // Nếu không có SKU, hiển thị tất cả thông tin chi tiết kho
    return data?.inventory_detail;
  }, [data]);

  // Tạo tiêu đề dựa trên thông tin sản phẩm và SKU (nếu có)
  const modalTitle = useMemo(() => {
    if (data?.sku) {
      // Nếu có SKU, hiển thị tên sản phẩm cùng với thông tin phân loại của SKU
      return (
        <>
          <div className=" font-semibold uppercase">{data.product_name}</div>
          <div className=" text-sm">
            {data.sku?.classify1_str} {data.sku?.classify2_str && "/"} {data.sku?.classify2_str}
          </div>
        </>
      );
    }
    // Nếu không có SKU, chỉ hiển thị tên sản phẩm
    return data?.product_name;
  }, [data]);


  return (
    <>
      <Button type={width < 640 ? "text" : "primary"} 
      className={` ${width < 640 ? "" : "bg-lime-800 hover:!bg-lime-600 "}`}
      onClick={() => setOpen(true)} 
      size="small">
        {t('finance.detail')}
      </Button>
      <Modal
        title={modalTitle}
        centered
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width={800}
        footer={null}
      >
        <div className="w-full">
          <div className="flex w-[100%] text-center items-center pl-3 pr-4 border mt-4  bg-gray-100 border-gray-300">
            <div className="flex-grow m-3 w-[20%] font-semibold">Kho hàng</div>
            <div className="flex-grow m-3 w-[20%] font-semibold">Số lượng</div>
            <div className="flex-grow m-3 w-[20%] font-semibold">Số lượng đặt trước</div>
            <div className="flex-grow m-3 w-[20%] font-semibold">Mức cảnh báo</div>
            <div className="flex-grow m-3 w-[20%] font-semibold">Dưới mức cảnh báo</div>
          </div>
          {filteredInventoryDetails?.map((item: {
            warehouse_info: any;
            is_below_alert_level: boolean;
            reserved: number; alert_level: number; id: number; quantity: number
          }) => (
            <div className="flex text-center w-[100%] items-center pl-3 pr-4 border border-l border-b border-gray-300" key={item.id}>
              <div className="flex-grow m-3 w-[20%]">{item?.warehouse_info?.name}</div>
              <div className="flex-grow m-3 w-[20%]">
                {item?.quantity !== 0 && <AlertLevel inventoryDetail={item} />}
              </div>

              <div className="flex-grow m-3 w-[20%]">{item?.reserved}</div>
              <div className="flex-grow m-3 w-[20%]">{item?.alert_level}</div>
              <div className="flex-grow m-3 w-[20%]">
                <Tag color={item.is_below_alert_level ? "red" : "blue"}>
                  {item.is_below_alert_level ? `${t('general.exceededThreshold')}` : `${t('general.safe')}`}
                </Tag>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default StockEntryDetail;
