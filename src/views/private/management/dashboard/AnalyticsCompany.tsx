"use client";

import { useGetAnalyticsCompanyQuery } from "@/api/Analytics/apiAnalytics";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { RootState } from "@/store/store";
import { Card, Col, Row, Statistic, DatePicker, Form, Spin } from "antd";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { TbReportMoney } from "react-icons/tb";
import { MdProductionQuantityLimits, MdOutlineDataExploration } from "react-icons/md";
import { FaHandHoldingDollar } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { GiCash } from "react-icons/gi";
import { useRouter } from "next/navigation";
import { TimeRangePickerProps } from "antd/lib";

const { RangePicker } = DatePicker;

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsCompany = () => {
  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const router = useRouter();
  const currentMonthStart = dayjs().startOf('month');
  const currentDate = dayjs();

  const { data: dashboardData, isLoading, isError, error } = useGetAnalyticsCompanyQuery({
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
  });

  // Redirect to custom 403 page if there's a 403 error
  useEffect(() => {
    if (error && 'status' in error) {
      const fetchError = error as FetchBaseQueryError;
      if (fetchError.status === 403) {
        router.push('/403/');
      }
    }
  }, [error, router]);

  const onDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, formatString: [string, string]) => {
    if (dates && dates[0] && dates[1]) {
      // Cả hai ngày đều không phải là null
      setDateRange([dates[0], dates[1]]);
    } else {
      // Ít nhất một trong hai ngày là null, hoặc cả 'dates' là null
      setDateRange([]);
    }
  };

  const {
    total_revenue,
    total_revenue_by_person,
    total_outstanding_debt,
    net_cash_flow_from_sales,
    net_cash_flow_from_sales_by_person,
    revenue_by_product,
    revenue_by_location,
    revenue_by_branch,
    leads_received,
    conversion_rate,
    debt_by_person,
  } = dashboardData || {};

  // Cấu hình cơ bản cho biểu đồ cột
  const baseBarChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 150,
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
          // Định dạng số để hiển thị đẹp hơn trên trục y
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
          // Định dạng giá trị để hiển thị trong tooltip
          return val.toLocaleString() + " VND";
        },
      },
    },
    // Các cấu hình khác...
  };

  // Xử lý dữ liệu cho biểu đồ
  const revenueByPersonData = {
    series: [
      {
        name: `${t('chart.revenue')}`,
        data: total_revenue_by_person?.map((item: { total_revenue: any }) => item?.total_revenue),
      },
    ],
    xaxis: {
      categories: total_revenue_by_person?.map(
        (item: { user__first_name: any; user__last_name: any }) => `${item.user__first_name} ${item.user__last_name}`
      ),
    },
  };

  // Xử lý dữ liệu cho biểu đồ
  const netCashFlowFromSalesByPersonData = {
    series: [
      {
        name: `${t('chart.cashFlow')}`,
        data: net_cash_flow_from_sales_by_person?.map(
          (item: { net_cash_flow_from_sales: any }) => item.net_cash_flow_from_sales
        ),
      },
    ],
    xaxis: {
      categories: net_cash_flow_from_sales_by_person?.map(
        (item: { user__first_name: any; user__last_name: any }) => `${item.user__first_name} ${item.user__last_name}`
      ),
    },
  };

  const revenueByProductData = {
    series: revenue_by_product?.map((item: { total_revenue: any }) => item.total_revenue),
    labels: revenue_by_product?.map((item: { product__product_name: any }) => item.product__product_name),
  };


  // Xử lý dữ liệu cho biểu đồ doanh thu theo địa điểm
  const revenueByLocationData = {
    series: revenue_by_location?.map((item: { total_revenue: any }) => item?.total_revenue),
    labels: revenue_by_location?.map(
      (item: { lead__location__city: any }) => item.lead__location__city || `${t('chart.unknown')}`
    ),
  };

  // Xử lý dữ liệu cho biểu đồ doanh thu theo chi nhánh
  const revenueByBranchData = {
    series: revenue_by_branch?.map((item: { total_revenue: any }) => item?.total_revenue),
    labels: revenue_by_branch?.map(
      (item: { user__userprofile__branch__name: any }) => item?.user__userprofile__branch__name
    ),
  };

  // Cấu hình cụ thể cho biểu đồ doanh thu theo sản phẩm
  const pieChartProductOptions = {
    ...basePieChartOptions,
    labels: revenueByProductData?.labels,
  };

  // Cấu hình cụ thể cho biểu đồ doanh thu theo địa điểm
  const pieChartLocationOptions = {
    ...basePieChartOptions,
    labels: revenueByLocationData?.labels,
  };

  // Cấu hình cụ thể cho biểu đồ doanh thu theo chi nhánh
  const pieChartBranchOptions = {
    ...basePieChartOptions,
    labels: revenueByBranchData?.labels,
  };

  // Cấu hình cho biểu đồ doanh thu theo từng người
  const revenueByPersonChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: total_revenue_by_person?.map(
        (item: { user__first_name: any; user__last_name: any }) => `${item.user__first_name} ${item.user__last_name}`
      ),
    },
  };

  // Cấu hình cho biểu đồ dòng tiền ròng từ bán hàng theo từng người
  const netCashFlowFromSalesByPersonChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: net_cash_flow_from_sales_by_person?.map(
        (item: { user__first_name: any; user__last_name: any }) => `${item.user__first_name} ${item.user__last_name}`
      ),
    },
  };

  const debtByPersonChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: debt_by_person ? Object.keys(debt_by_person) : [],
    },
    series: [
      {
        name: `${t('chart.inDebt')}`,
        data: Object?.values(debt_by_person || {}).map((value) =>
          typeof value === "number" ? value : 0
        ),
      },
    ],
  };

  const revenueBySourceData = {
    series: dashboardData?.revenue_by_source?.map((item: { total_revenue: any; }) => item?.total_revenue),
    labels: dashboardData?.revenue_by_source?.map((item: { source__title: any; }) => item?.source__title || "Không xác định")
  };

  const leadsByStageData = {
    series: dashboardData?.leads_by_stage?.map((item: { total_leads: any; }) => item?.total_leads),
    labels: dashboardData?.leads_by_stage?.map((item: { stage__stage: any; }) => item?.stage__stage || "Không xác định")
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

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Spin size="large" />
      </div>
    );
  }

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
      <div className="grid sm:grid-cols-2 xl:grid-cols-3  2xl:grid-cols-5 gap-3">
        <DashboardCard title={t('card.totalRevenue')} statisticsMoney={total_revenue} icon={<FaHandHoldingDollar />} />
        <DashboardCard title={t('card.netCashFlowFromSales')} statisticsMoney={net_cash_flow_from_sales} icon={<GiCash />} />
        <DashboardCard title={t('card.totalOutstandingDebt')} statisticsMoney={total_outstanding_debt} icon={<TbReportMoney />} />
        <DashboardCard title={t('card.leadsReceived')} statistics={leads_received} icon={<MdProductionQuantityLimits />} />
        <DashboardCard title={t('card.conversionRate')} statistics={conversion_rate} icon={<MdOutlineDataExploration />} />

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
      <div className="grid  md:grid-cols-1 lg:grid-cols-2  gap-3">
        {/* Biểu đồ doanh thu theo từng người */}

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

        <Card title={t('chart.debtByPersonChartOptions')} >
          <ReactApexChart
            options={debtByPersonChartOptions}
            series={debtByPersonChartOptions.series}
            type="bar"
          />
        </Card>

        {/* Hiển thị biểu đồ tròn trên giao diện */}

        <Card title={t('chart.revenueByBranch')}>
          <ReactApexChart
            options={pieChartBranchOptions}
            series={revenueByBranchData?.series}
            type="pie" />
        </Card>

        <Card title={t('chart.revenueByLocation')}>
          <ReactApexChart
            options={pieChartLocationOptions}
            series={revenueByLocationData.series}
            type="pie"
          />
        </Card>

        <Card title={t('chart.revenueByProduct')}>
          <ReactApexChart
            options={pieChartProductOptions}
            series={revenueByProductData?.series}
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

export default AnalyticsCompany;
