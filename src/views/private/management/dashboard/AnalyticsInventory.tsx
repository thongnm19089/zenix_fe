"use client";

import { useGetAnalyticsInventoryQuery } from "@/api/Analytics/apiAnalytics";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { RootState } from "@/store/store";
import { Card, DatePicker, Form, Spin } from "antd";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { MdInventory } from "react-icons/md";
import { CiInboxIn } from "react-icons/ci";
import { CiInboxOut } from "react-icons/ci";
import { useTranslations } from "next-intl";
import { VscListOrdered } from "react-icons/vsc";
import { useRouter } from "next/navigation";
import { TimeRangePickerProps } from "antd/lib";

const { RangePicker } = DatePicker;

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsInventory = () => {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const t: any = useTranslations();
  const router = useRouter();
  const currentMonthStart = dayjs().startOf('month');
  const currentDate = dayjs();

  const { data: analyticsInventoryData, isLoading, error } = useGetAnalyticsInventoryQuery({
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
  });

  // Redirect to custom 403 page if there's a 403 error
  if (error && 'status' in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push('/403/');
    }
  }

  const onDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, formatString: [string, string]) => {
    if (dates && dates[0] && dates[1]) {
      // Cả hai ngày đều không phải là null
      setDateRange([dates[0], dates[1]]);
    } else {
      // Ít nhất một trong hai ngày là null, hoặc cả 'dates' là null
      setDateRange([]);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  const baseBarChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 200,
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    yaxis: {
      title: {
        text: `${t('general.quantity')}`,
      },
      labels: {
        formatter: function (val: number | bigint) {
          return new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 }).format(val);
        },
      },
    },
    xaxis: {
      // Cấu hình mặc định cho trục x, có thể được ghi đè ở mỗi biểu đồ cụ thể
    },

    fill: {
      opacity: 1,
    },
    // Các cấu hình khác...
  };

  // Xử lý dữ liệu cho biểu đồ
  const inventoryByProductData = {
    series: [
      {
        name: `${t('general.quantity')}`,
        data: analyticsInventoryData?.inventory_by_product.map((item: { total: number }) => item.total),
      },
    ],
    xaxis: {
      categories: analyticsInventoryData?.inventory_by_product.map(
        (item: { product__product_name: string }) => `${item.product__product_name}}`
      ),
    },
  };

  // Xử lý dữ liệu cho biểu đồ
  const inventoryByWarehouseData = {
    series: [
      {
        name: `${t('general.quantity')}`,
        data: analyticsInventoryData?.inventory_by_warehouse.map((item: { total: number }) => item.total),
      },
    ],
    xaxis: {
      categories: analyticsInventoryData?.inventory_by_warehouse.map(
        (item: { warehouse__name: string }) => `${item.warehouse__name}`
      ),
    },
  };

  // Cấu hình cho biểu đồ doanh thu theo từng người
  const inventoryByProductChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: analyticsInventoryData?.inventory_by_product.map(
        (item: { product__product_name: string }) => `${item.product__product_name}`
      ),
    },
  };

  // Cấu hình cho biểu đồ dòng tiền ròng từ bán hàng theo từng người
  const inventoryByWarehouseChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: analyticsInventoryData?.inventory_by_warehouse.map(
        (item: { warehouse__name: string }) => `${item.warehouse__name}`
      ),
    },
  };

  const rangePresets: TimeRangePickerProps['presets'] = [
    { label: `${t("rangePreset.Last 7 days")}`, value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: `${t("rangePreset.Last Month")}`, value: [dayjs().add(-1, 'month'), dayjs()] },
    { label: `${t("rangePreset.Last three Months")}`, value: [dayjs().add(-3, 'month'), dayjs()] },
    { label: `${t("rangePreset.Last Year")}`, value: [dayjs().add(-1, 'year'), dayjs()] },
    { label: `${t("rangePreset.Last two Year")}`, value: [dayjs().add(-2, 'year'), dayjs()] },
  ];

  return (
    <div
      className={`overflow-x-auto w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        }   min-h-[calc(100vh-138px)] p-6 `}
    >
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        <DashboardCard title={t('card.quantityOfGoodsInStock')} statistics={analyticsInventoryData?.total_inventory} icon={<MdInventory />} />
        <DashboardCard title={t('card.numberOfTimesWarehoused')} statistics={analyticsInventoryData?.stock_in_count} icon={<CiInboxIn />} />
        <DashboardCard title={t('card.numberOfDeliveries')} statistics={analyticsInventoryData?.stock_out_count} icon={<CiInboxOut />} />
        <DashboardCard title={t('card.totalNumberOfOrders')} statistics={analyticsInventoryData?.order_count} icon={<VscListOrdered />} />
      </div>
      <Form layout="inline" className="mb-4">
        <Form.Item>
          <RangePicker
            presets={rangePresets}
            onChange={onDateChange}
            placeholder={[`${t('general.startDate')}`, `${t('general.endDate')}`]}
            defaultValue={[currentMonthStart, currentDate]}
          />
        </Form.Item>
      </Form>

      <div className="grid md:grid-cols-2 gap-3 ">
        <Card className="text-black" title={t('chart.theNumberOfProducts')}>
          <ReactApexChart
            options={inventoryByProductChartOptions}
            series={inventoryByProductData.series}
            type="bar"

          />
        </Card>

        <Card title={t('chart.quantityWarehouse')}>
          <ReactApexChart
            options={inventoryByWarehouseChartOptions}
            series={inventoryByWarehouseData.series}
            type="bar"
            className="h-[50px] text-black"
          />
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsInventory;
