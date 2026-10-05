"use client";

import { useGetAnalyticsCompanyQuery } from "@/api/Analytics/apiAnalytics";
import { useGetCostListQuery } from "@/api/Finance/apiCost";
import {
  useGetIncomingInvoiceListQuery,
  useGetOutcomingInvoiceListQuery,
} from "@/api/Finance/apiInvoice";
import { useGetOutstandingAccountantListQuery, useGetPaymentAccountantListQuery } from "@/api/Finance/apiPayment";
import { useGetSetupFinanceAppQuery } from "@/api/SetUp/apiSetup";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { RootState } from "@/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Card, Col, Row, Statistic, DatePicker, Form, Spin } from "antd";
import { TimeRangePickerProps } from "antd/lib";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaHandHoldingDollar } from "react-icons/fa6";
import { FcDebt } from "react-icons/fc";
import { GiCash } from "react-icons/gi";
import {
  MdProductionQuantityLimits,
  MdOutlineDataExploration,
} from "react-icons/md";
import { RiBillFill } from "react-icons/ri";
import { TbReportMoney } from "react-icons/tb";
import { useSelector } from "react-redux";

const { RangePicker } = DatePicker;

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const AnalyticsFinance = () => {
  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );
  const t: any = useTranslations();
  const router = useRouter();
  const currentMonthStart = dayjs().startOf("month");
  const currentDate = dayjs();

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useGetAnalyticsCompanyQuery({
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
  });

  const [dataAnalyticsFinance, setDataAnalyticsFinance] = useState({
    totalPaymentAmount: 0,
    totalCostAmount: 0,
    numberIncoming: 0,
    numberOutcoming: 0,
    numberOutstanding: 0,
    paymentByUser: [
      { name: "Nguyễn Văn A", amount: 1000 },
      { name: "Vũ Quốc Hưng", amount: 1000 }
    ],
    debtDue: [
      { name: "Nguyễn Văn A", amount: 1000, due: '19/1/2024' },
      { name: "Vũ Quốc Hưng", amount: 1000, due: '20/1/2024' }
    ],
    costSource: [
      { source: "CP Quảng cáo", amount: 1000 },
      { source: "CP Thuê văn phòng", amount: 2000 },
      { source: "CP Tuyển dụng", amount: 2000 },
    ]
  });

  const { data: paymentAccountantList } = useGetPaymentAccountantListQuery({
    page: 1,
    pageSize: 50,
  });

  const { data: costList } = useGetCostListQuery({
    page: 1,
    pageSize: 100,
  });

  const { data: incomingInvoiceList } = useGetIncomingInvoiceListQuery({
    page: 1,
    pageSize: 100,
  });

  const { data: outcomingInvoiceList } = useGetOutcomingInvoiceListQuery({
    page: 1,
    pageSize: 100,
  });

  const {
    data: outstandingList,
  } = useGetOutstandingAccountantListQuery({
    page: 1,
    pageSize: 100
  });

  useEffect(() => {
    if (
      paymentAccountantList &&
      costList &&
      incomingInvoiceList &&
      outcomingInvoiceList &&
      outstandingList
    ) {
      const totalPayment = paymentAccountantList?.results.reduce(
        (sum: number, item: any) => sum + item?.payment_amount,
        0
      );
      const totalCost = costList?.results.reduce(
        (sum: number, item: any) => sum + item?.amount,
        0
      );
      setDataAnalyticsFinance({
        ...dataAnalyticsFinance,
        totalPaymentAmount: totalPayment,
        totalCostAmount: totalCost,
        numberIncoming: incomingInvoiceList?.total,
        numberOutcoming: outcomingInvoiceList?.total,
        numberOutstanding: outstandingList?.total
      });
    }
  }, [paymentAccountantList, costList, incomingInvoiceList, outcomingInvoiceList, outstandingList]);

  // Redirect to custom 403 page if there's a 403 error
  useEffect(() => {
    if (error && "status" in error) {
      const fetchError = error as FetchBaseQueryError;
      if (fetchError.status === 403) {
        router.push("/403/");
      }
    }
  }, [error, router]);

  const onDateChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
    formatString: [string, string]
  ) => {
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
        text: `${t("chart.amountOfMoney")}`,
      },
      labels: {
        formatter: function (val: number | bigint) {
          // Định dạng số để hiển thị đẹp hơn trên trục y
          return new Intl.NumberFormat("en-US", {
            maximumSignificantDigits: 3,
          }).format(val);
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
        name: `${t('chart.totalRevenuePerPerson')}`,
        data: dataAnalyticsFinance.paymentByUser.map(item => item.amount),
      },
    ],
    xaxis: {
      categories: dataAnalyticsFinance.paymentByUser.map(item => item.name),
    },
  };

  // Xử lý dữ liệu cho biểu đồ
  const netCashFlowFromSalesByPersonData = {
    series: [
      {
        name: `${t("chart.cashFlow")}`,
        data: dataAnalyticsFinance.debtDue.map(item => item.amount),
      },
    ],
    xaxis: {
      categories: dataAnalyticsFinance.debtDue.map(item =>
        item.name + "(" + item.due + ")"
      ),
    },
  };

  const revenueByProductData = {
    series: revenue_by_product?.map(
      (item: { total_revenue: any }) => item.total_revenue
    ),
    labels: revenue_by_product?.map(
      (item: { product__product_name: any }) => item.product__product_name
    ),
  };

  // Xử lý dữ liệu cho biểu đồ doanh thu theo địa điểm
  const revenueByLocationData = {
    series: revenue_by_location?.map(
      (item: { total_revenue: any }) => item?.total_revenue
    ),
    labels: revenue_by_location?.map(
      (item: { lead__location__city: any }) =>
        item.lead__location__city || `${t("chart.unknown")}`
    ),
  };

  // Xử lý dữ liệu cho biểu đồ doanh thu theo chi nhánh
  const revenueByBranchData = {
    series: revenue_by_branch?.map(
      (item: { total_revenue: any }) => item?.total_revenue
    ),
    labels: revenue_by_branch?.map(
      (item: { user__userprofile__branch__name: any }) =>
        item?.user__userprofile__branch__name
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
      categories: dataAnalyticsFinance.paymentByUser.map(item => item.name),
    },
  };

  // Cấu hình cho biểu đồ dòng tiền ròng từ bán hàng theo từng người
  const netCashFlowFromSalesByPersonChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: dataAnalyticsFinance.debtDue.map(item =>
        item.name + "(" + item.due + ")"
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
        name: `${t("chart.inDebt")}`,
        data: Object?.values(debt_by_person || {}).map((value) =>
          typeof value === "number" ? value : 0
        ),
      },
    ],
  };

  const revenueBySourceData = {
    series: dataAnalyticsFinance.costSource?.map(
      (item: any) => item?.amount
    ),
    labels: dataAnalyticsFinance.costSource?.map(
      (item: any) => item?.source || "Không xác định"
    ),
  };

  const leadsByStageData = {
    series: dashboardData?.leads_by_stage?.map(
      (item: { total_leads: any }) => item?.total_leads
    ),
    labels: dashboardData?.leads_by_stage?.map(
      (item: { stage__stage: any }) => item?.stage__stage || "Không xác định"
    ),
  };

  const pieChartSourceOptions = {
    ...basePieChartOptions,
    labels: revenueBySourceData?.labels,
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
        <DashboardCard
          title={t('card.totalRevenueForThePeriod')}
          statisticsMoney={dataAnalyticsFinance.totalPaymentAmount}
          icon={<FaHandHoldingDollar />}
        />
        <DashboardCard
          title={t('card.totalCost')}
          statisticsMoney={dataAnalyticsFinance.totalCostAmount}
          icon={<GiCash />}
        />
        <DashboardCard
          title={t('card.totalInputInvoice')}
          statistics={dataAnalyticsFinance.numberIncoming}
          icon={<RiBillFill />}
        />
        <DashboardCard
          title={t('card.totalOutputInvoice')}
          statistics={dataAnalyticsFinance.numberIncoming}
          icon={<RiBillFill />}
        />
        <DashboardCard
          title={t('card.debt')}
          statistics={dataAnalyticsFinance.numberOutstanding}
          icon={<FcDebt />}
        />
      </div>
      <Form layout="inline" className="mb-4">
        <Form.Item>
          <RangePicker
            presets={rangePresets}
            onChange={onDateChange}
            placeholder={[
              `${t("general.startDate")}`,
              `${t("general.endDate")}`,
            ]}
            defaultValue={[currentMonthStart, currentDate]}
          />
        </Form.Item>
      </Form>
      <div className="grid  md:grid-cols-1 lg:grid-cols-2  gap-3">
        {/* Biểu đồ doanh thu theo từng người */}

        <Card title={t('chart.totalRevenuePerPerson')} className="text-black">
          <ReactApexChart
            options={revenueByPersonChartOptions}
            series={revenueByPersonData.series}
            type="bar"
          />
        </Card>

        {/* Biểu đồ dòng tiền ròng từ bán hàng theo từng người */}

        <Card title={t('chart.debtDue')} className="text-black">
          <ReactApexChart
            options={netCashFlowFromSalesByPersonChartOptions}
            series={netCashFlowFromSalesByPersonData.series}
            type="bar"
          />
        </Card>

        {/* Hiển thị biểu đồ tròn trên giao diện */}

        <Card title={t('chart.costBySource')}>
          <ReactApexChart
            options={pieChartSourceOptions}
            series={revenueBySourceData?.series}
            type="pie"
          />
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsFinance;
