"use client";

import {
  useGetAnalyticsMarketingQuery,
} from "@/api/Analytics/apiAnalytics";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { RootState } from "@/store/store";
import { Card, DatePicker, Form, Spin } from "antd";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { IoPerson } from "react-icons/io5";
import { useTranslations } from "next-intl";
import { MdOutlineDataExploration } from "react-icons/md";
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

  const { data: analyticsMarketingData, isLoading, error } = useGetAnalyticsMarketingQuery({
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

  const rateBarChartOptions: ApexOptions = {
    chart: {
      type: "bar",
    },

    xaxis: {
      categories: analyticsMarketingData?.conversion_rate_by_marketer.map(
        (marketer: { marketer__first_name: string; marketer__last_name: string }) =>
          `${marketer.marketer__first_name} ${marketer.marketer__last_name}`
      ),
      // Cấu hình mặc định cho trục x, có thể được ghi đè ở mỗi biểu đồ cụ thể
    },

    yaxis: {
      title: {
        text: `${t('chart.conversionRate')}`,
      },
      max: 100,
      labels: {
        formatter: (value: number) => Math.round(value).toString(), // Convert the number to a string
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
          return ` ${val}%,  ${t('chart.numberLead')} ${detail?.total_leads},  ${t('chart.convert')} ${detail?.converted_leads}`;
        },
      },
    },
    fill: {
      opacity: 1,
    },
  };
  const details = analyticsMarketingData?.conversion_rate_by_marketer.map(
    (seller: { total_leads: number; converted_leads: number }) => ({
      total_leads: seller.total_leads,
      converted_leads: seller.converted_leads,
    })
  );

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
        text: `${t('general.people')}`,
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
          return val.toLocaleString() + `${t('general.people')}`;
        },
      },
    },
    fill: {
      opacity: 1,
    },
    // Các cấu hình khác...
  };

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
          return val.toLocaleString() + `${t('general.people')}`;
        },
      },
    },
  };

  const conversionRateByMarketerData = {
    series: [
      {
        name: `${t('general.ratio')}`,
        data: analyticsMarketingData?.conversion_rate_by_marketer.map((item: { total_leads: any }) => item.total_leads),
      },
    ],
    xaxis: {
      categories: analyticsMarketingData?.conversion_rate_by_marketer.map(
        (item: { marketer__first_name: any; marketer__last_name: any }) =>
          `${item.marketer__first_name} ${item.marketer__last_name}`
      ),
    },
  };

  // Xử lý dữ liệu cho biểu đồ
  const leadsMyMarketerByPersonData = {
    series: [
      {
        name: `${t('chart.amountOfPeople')}`,
        data: analyticsMarketingData?.leads_by_marketer.map((item: { total_leads: any }) => item.total_leads),
      },
    ],
    xaxis: {
      categories: analyticsMarketingData?.leads_by_marketer.map(
        (item: { marketer__first_name: any; marketer__last_name: any }) =>
          `${item.marketer__first_name} ${item.marketer__last_name}`
      ),
    },
  };
  // Xử lý dữ liệu cho biểu đồ lead theo sản phẩm
  const leadsByProductData = {
    series: analyticsMarketingData?.leads_by_product.map((item: { total_leads: any }) => item.total_leads),
    labels: analyticsMarketingData?.leads_by_product.map((item: { product_name: any }) => item.product_name),
  };

  // Xử lý dữ liệu cho biểu đồ lead theo địa điểm
  const leadsByLocationData = {
    series: analyticsMarketingData?.leads_by_location.map((item: { total_leads: any }) => item.total_leads),
    labels: analyticsMarketingData?.leads_by_location.map(
      (item: { location__city: any }) => item.location__city || `${t('chart.unknown')}`
    ),
  };
  // Xử lý dữ liệu cho biểu đồ lead theo chi nhánh
  const leadsByBranchData = {
    series: analyticsMarketingData?.leads_by_branch.map((item: { total_leads: any }) => item.total_leads),
    labels: analyticsMarketingData?.leads_by_branch.map(
      (item: { location__city: any }) => item.location__city || `${t('chart.unknown')}`
    ),
  };
  const pieChartProductOptions = {
    ...basePieChartOptions,
    labels: leadsByProductData.labels,
  };

  const pieChartLocationOptions = {
    ...basePieChartOptions,
    labels: leadsByLocationData.labels,
  };

  const conversionRateByMarketerChartOptions = {
    ...rateBarChartOptions,
    xaxis: {
      categories: analyticsMarketingData?.conversion_rate_by_marketer.map(
        (item: { marketer__first_name: any; marketer__last_name: any }) =>
          `${item.marketer__first_name} ${item.marketer__last_name}`
      ),
    },
  };

  const leadsByMarketerChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: analyticsMarketingData?.leads_by_marketer.map(
        (item: { marketer__first_name: any; marketer__last_name: any }) =>
          `${item.marketer__first_name} ${item.marketer__last_name}`
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
      <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-3">
        <DashboardCard
          title={t('card.overallLeadOfTheManagementTeam')}
          statistics={analyticsMarketingData?.total_leads}
          icon={<IoPerson />}
        />

        <DashboardCard
          title={t('card.conversionRate')}
          statistics={analyticsMarketingData?.conversion_rate_overall}
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

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-3">
        <Card title={t('chart.conversionRateForEachMarketer')}>
          <ReactApexChart
            options={conversionRateByMarketerChartOptions}
            series={conversionRateByMarketerData.series}
            type="bar"
          />
        </Card>
        {/* Biểu đồ dòng tiền ròng từ bán hàng theo từng người */}
        <Card title={t('chart.leadEachPerson')}>
          <ReactApexChart
            options={leadsByMarketerChartOptions}
            series={leadsMyMarketerByPersonData.series}
            type="bar"
          />
        </Card>

        {/* Hiển thị biểu đồ tròn trên giao diện */}

        <Card title={t('chart.leadByEachProduct')}>
          <ReactApexChart
            options={pieChartProductOptions}
            series={leadsByProductData.series} // Đây phải là một mảng các số
            type="pie"
          />
        </Card>

        <Card title={t('chart.leadByEachLocation')}>
          <ReactApexChart
            options={pieChartLocationOptions}
            series={leadsByLocationData.series}
            type="pie"
          />
        </Card>

        <Card title={t('chart.accordingToEachBranch')}>
          <ReactApexChart options={pieChartLocationOptions} series={leadsByBranchData.series} type="pie" />
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSales;
