"use client";

import { useGetAnalyticsProductQuery } from "@/api/Analytics/apiAnalytics";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { RootState } from "@/store/store";
import { Card, DatePicker, Form, Spin } from "antd";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { GiScales } from "react-icons/gi";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { TimeRangePickerProps } from "antd/lib";

const { RangePicker } = DatePicker;

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsProduct = () => {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const t: any = useTranslations();
  const router = useRouter();
  const currentMonthStart = dayjs().startOf('month');
  const currentDate = dayjs();

  const { data: analyticsProductData, isLoading, error } = useGetAnalyticsProductQuery({
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
        text: `${t('chart.amountOfMoney')}`,
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
  const bestSellingProductsData = {
    series: [
      {
        name: `${t('chart.revenue')}`,
        data: analyticsProductData?.best_selling_products.map((item: { total_revenue: any }) => item.total_revenue),
      },
    ],
    xaxis: {
      categories: analyticsProductData?.best_selling_products.map(
        (item: { product__product_name: any }) => `${item.product__product_name}`
      ),
    },
  };

  // Xử lý dữ liệu cho biểu đồ
  const highestInventoryProductData = {
    series: [
      {
        name: `${t('general.quantity')}`,
        data: analyticsProductData?.highest_inventory_products.map(
          (item: { total_inventory: any }) => item.total_inventory
        ),
      },
    ],
    xaxis: {
      categories: analyticsProductData?.highest_inventory_products.map(
        (item: { product__product_name: any }) => `${item.product__product_name} `
      ),
    },
  };
  const revenueByProductData = {
    series: [
      {
        name: `${t('chart.revenue')}`,
        data: analyticsProductData?.revenue_by_product.map((item: { total_revenue: any }) => item.total_revenue),
      },
    ],
    xaxis: {
      categories: analyticsProductData?.revenue_by_product.map(
        (item: { product__product_name: any }) => `${item.product__product_name} `
      ),
    },
  };

  const bestSellingProductsChartOptions = {
    ...baseBarChartOptions,

    xaxis: {
      categories: analyticsProductData?.best_selling_products.map(
        (item: { product__product_name: any }) => `${item.product__product_name}`
      ),
    },
  };

  const highestInventoryProductsChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: analyticsProductData?.highest_inventory_products.map(
        (item: { product__product_name: any }) => `${item.product__product_name}`
      ),
    },
  };

  const revenueByProductChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: analyticsProductData?.revenue_by_product.map(
        (item: { product__product_name: any }) => `${item.product__product_name}`
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
        }   min-h-[calc(100vh-70px)] p-6 `}
    >
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        <DashboardCard
          title={t('card.productOrder')}
          statistics={Math.round(analyticsProductData?.average_products_per_order)}
          icon={<GiScales />}
        />
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

      <div className="grid md:grid-cols-2  gap-3">
        <Card className="text-black" title={t('chart.bestSellingProduct')}>
          <ReactApexChart
            options={bestSellingProductsChartOptions}
            series={bestSellingProductsData.series}
            type="bar"
          />
        </Card>
        <Card className="text-black" title={t('chart.inventory')}>
          <ReactApexChart
            options={highestInventoryProductsChartOptions}
            series={highestInventoryProductData.series}
            type="bar"
          />
        </Card>
        <Card className="text-black" title={t('chart.revenuProduct')}>
          <ReactApexChart
            options={revenueByProductChartOptions}
            series={revenueByProductData.series}
            type="bar"
          />
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsProduct;
