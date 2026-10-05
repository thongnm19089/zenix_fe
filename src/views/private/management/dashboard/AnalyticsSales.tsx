"use client";

import { useGetAnalyticsSalesQuery } from "@/api/Analytics/apiAnalytics";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { RootState } from "@/store/store";
import { Card, DatePicker, Form, Spin } from "antd";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import React, { useState, useMemo } from "react";
import { FaHandHoldingDollar } from "react-icons/fa6";
import { GiCash } from "react-icons/gi";
import { useTranslations } from "next-intl";
import { MdOutlineDataExploration } from "react-icons/md";
import { TbReportMoney } from "react-icons/tb";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { TimeRangePickerProps } from "antd/lib";

const { RangePicker } = DatePicker;

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsSales = () => {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const t: any = useTranslations();
  const router = useRouter();
  const currentMonthStart = dayjs().startOf('month');
  const currentDate = dayjs();

  const { data: analyticsSalesData, isLoading, error } = useGetAnalyticsSalesQuery({
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
    tooltip: {
      y: {
        formatter: function (val: { toLocaleString: () => string }) {
          return val.toLocaleString() + " VND";
        },
      },
    },
    fill: {
      opacity: 1,
    },
    // Các cấu hình khác...
  };

  // Cấu hình cơ bản cho biểu đồ tròn
  const basePieChartOptions: ApexOptions = {
    chart: {
      type: "pie",
    },
    legend: {
      position: "bottom",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
            offsetX: 50,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    tooltip: {
      y: {
        formatter: function (val: { toLocaleString: () => string }) {
          return val.toLocaleString() + " VND";
        },
      },
    },
  };

  // Xử lý dữ liệu cho biểu đồ
  const revenueByPersonData = {
    series: [
      {
        name: `${t('chart.revenue')}`,
        data: analyticsSalesData?.total_revenue_by_person.map((item: { total_revenue: any }) => item.total_revenue),
      },
    ],
    xaxis: {
      categories: analyticsSalesData?.total_revenue_by_person.map(
        (item: { user__first_name: any; user__last_name: any }) => `${item.user__first_name} ${item.user__last_name}`
      ),
    },
  };

  // Xử lý dữ liệu cho biểu đồ
  const netCashFlowFromSalesByPersonData = {
    series: [
      {
        name: `${t('chart.cashFlow')}`,
        data: analyticsSalesData?.net_cash_flow_from_sales_by_person.map(
          (item: { net_cash_flow_from_sales: any }) => item.net_cash_flow_from_sales
        ),
      },
    ],
    xaxis: {
      categories: analyticsSalesData?.net_cash_flow_from_sales_by_person.map(
        (item: { user__first_name: any; user__last_name: any }) => `${item.user__first_name} ${item.user__last_name}`
      ),
    },
  };

  const revenueByProductData = {
    series: analyticsSalesData?.revenue_by_product.map((item: { total_revenue: any }) => item.total_revenue),
    labels: analyticsSalesData?.revenue_by_product.map(
      (item: { product__product_name: any }) => item.product__product_name
    ),
  };

  // Xử lý dữ liệu cho biểu đồ doanh thu theo địa điểm
  const revenueByLocationData = {
    series: analyticsSalesData?.revenue_by_location.map((item: { total_revenue: any }) => item.total_revenue),
    labels: analyticsSalesData?.revenue_by_location.map(
      (item: { lead__location__city: any }) => item.lead__location__city || `${t('chart.unknown')}`
    ),
  };

  // Cấu hình cụ thể cho biểu đồ doanh thu theo sản phẩm
  const pieChartProductOptions = {
    ...basePieChartOptions,
    labels: revenueByProductData.labels,
  };

  // Cấu hình cụ thể cho biểu đồ doanh thu theo địa điểm
  const pieChartLocationOptions = {
    ...basePieChartOptions,
    labels: revenueByLocationData.labels,
  };

  // Cấu hình cho biểu đồ doanh thu theo từng người
  const revenueByPersonChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: analyticsSalesData?.total_revenue_by_person.map(
        (item: { user__first_name: any; user__last_name: any }) => `${item.user__first_name} ${item.user__last_name}`
      ),
    },
  };

  const netCashFlowFromSalesByPersonChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: analyticsSalesData?.net_cash_flow_from_sales_by_person.map(
        (item: { user__first_name: any; user__last_name: any }) => `${item.user__first_name} ${item.user__last_name}`
      ),
    },
  };

  const debtByPersonChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: analyticsSalesData?.debt_by_person ? Object.keys(analyticsSalesData.debt_by_person) : [],
    },
    series: [
      {
        name: `${t('chart.inDebt')}`,
        data: Object?.values(analyticsSalesData?.debt_by_person || {}).map((value) =>
          typeof value === "number" ? value : 0
        ),
      },
    ],
  };

  const details = analyticsSalesData?.conversion_rate_by_seller.map(
    (seller: { total_leads: number; converted_leads: number }) => ({
      total_leads: seller.total_leads,
      converted_leads: seller.converted_leads,
    })
  );
  const conversionRateOptions: ApexOptions = {
    chart: {
      type: "bar",
    },
    xaxis: {
      categories: analyticsSalesData?.conversion_rate_by_seller.map(
        (seller: { seller__first_name: string; seller__last_name: string }) =>
          `${seller.seller__first_name} ${seller.seller__last_name}`
      ),
    },
    yaxis: {
      title: {
        text: `${t('chart.conversionRate')}`,
      },
      max: 100,
      labels: {
        formatter: (value: number) => Math.round(value).toString(),
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        if (val % 1 === 0) {
          return val + "%";
        } else {
          return val.toFixed(1) + "%";
        }
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number, { seriesIndex, dataPointIndex }: { seriesIndex: number; dataPointIndex: number }) => {
          const detail = details[dataPointIndex];
          return ` ${val}%,  ${t('chart.numberLead')} ${detail?.total_leads}, ${t('chart.convert')} ${detail?.converted_leads}`;
        },
      },
    },
  };

  const conversionRatesSeries = [
    {
      name: `${t('chart.conversionRate')}`,
      data: analyticsSalesData?.conversion_rate_by_seller.map((seller: { conversion_rate: number }) =>
        seller.conversion_rate.toFixed(1)
      ),
    },
  ];

  const revenueBySourceData = {
    series: analyticsSalesData?.revenue_by_source?.map((item: { total_revenue: any; }) => item?.total_revenue),
    labels: analyticsSalesData?.revenue_by_source?.map((item: { source__title: any; }) => item?.source__title || "Không xác định")
  };

  const leadsByStageData = {
    series: analyticsSalesData?.leads_by_stage?.map((item: { total_leads: any; }) => item?.total_leads),
    labels: analyticsSalesData?.leads_by_stage?.map((item: { stage__stage: any; }) => item?.stage__stage || "Không xác định")
  };

  const pieChartSourceOptions = {
    ...basePieChartOptions,
    labels: revenueBySourceData?.labels
  };

  const pieChartStageOptions = {
    ...basePieChartOptions,
    labels: leadsByStageData?.labels,
    tooltip: {
      y: {
        formatter: function (val: { toLocaleString: () => string }) {
          // Định dạng giá trị để hiển thị trong tooltip
          return val.toLocaleString() + " leads";
        },
      },
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
          title={t('card.totalRevenue')}
          statisticsMoney={analyticsSalesData?.total_revenue}
          icon={<FaHandHoldingDollar />}
        />
        <DashboardCard
          title={t('card.netCashFlowFromSales')}
          statisticsMoney={analyticsSalesData?.net_cash_flow_from_sales}
          icon={<GiCash />}
        />
        <DashboardCard
          title={t('card.totalOutstandingDebt')}
          statisticsMoney={analyticsSalesData?.total_outstanding_debt}
          icon={<TbReportMoney />}
        />
        <DashboardCard
          title={t('card.conversionRate')}
          statistics={analyticsSalesData?.overall_conversion_rate}
          icon={<MdOutlineDataExploration />}
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

      <div className="grid md:grid-cols-2 gap-3">
        <Card title={t('chart.revenuePerPerson')}>
          <ReactApexChart
            options={revenueByPersonChartOptions}
            series={revenueByPersonData.series}
            type="bar"

          />
        </Card>
        {/* Biểu đồ dòng tiền ròng từ bán hàng theo từng người */}
        <Card title={t('chart.NetCashFlowFromSalesByPerson')}>
          <ReactApexChart
            options={netCashFlowFromSalesByPersonChartOptions}
            series={netCashFlowFromSalesByPersonData.series}
            type="bar"

          />
        </Card>
        <Card title={t('chart.conversionRatePerPerson')}>
          <ReactApexChart options={conversionRateOptions} series={conversionRatesSeries} type="bar"
          />
        </Card>
        <Card title={t('chart.debtByPersonChartOptions')}>
          <ReactApexChart
            options={debtByPersonChartOptions}
            series={debtByPersonChartOptions.series}
            type="bar"

          />
        </Card>
        <Card title={t('chart.revenueByLocation')}>
          <ReactApexChart
            options={pieChartLocationOptions}
            series={revenueByLocationData.series}
            type="pie"

          />
        </Card>
        {/* Hiển thị biểu đồ tròn trên giao diện */}

        <Card title={t('chart.revenueByProduct')}>
          <ReactApexChart
            options={pieChartProductOptions}
            series={revenueByProductData.series} // Đây phải là một mảng các số
            type="pie"

          />
        </Card>

        <Card title={t('chart.revenueBySource')}>
          <ReactApexChart
            options={pieChartSourceOptions}
            series={revenueBySourceData?.series}
            type="pie"
          />
        </Card>

        <Card title={t('chart.leadsByStage')}>
          <ReactApexChart
            options={pieChartStageOptions}
            series={leadsByStageData?.series}
            type="pie"
          />
        </Card>

      </div>
    </div>
  );
};

export default AnalyticsSales;
