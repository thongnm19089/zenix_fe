"use client";

import { Button, DatePicker, Modal, Select } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useState } from "react";
import { FaFilter } from "react-icons/fa";
import type { TimeRangePickerProps } from 'antd';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function Filter({
  objectFilter,
  setObjectFilter,
  dataQuery,
  children,
  isLoading,
  initialState,
  setDateRange,
  dateRange,
  pagination,
  setPagination,
}: {
  objectFilter: any;
  setObjectFilter: Dispatch<SetStateAction<any>>;
  dataQuery: any;
  children?: any;
  isLoading?: any;
  initialState?: any;
  setDateRange?: any;
  dateRange?: any;
  pagination?: any;
  setPagination?: any;
}) {
  const [filterObject, setFilterObject] = useState(objectFilter);
  const [dateFilter, setDateFilter] = useState(dateRange);
  const t: any = useTranslations();
  const handleChange = (values: number[], props: string) => {
    setFilterObject({ ...filterObject, [props]: values });
  };

  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    setOpen(false);
  };

  const handleOk = () => {
    setPagination({ ...pagination, current: 1 });
    if (setDateRange) {
      setDateRange(dateFilter);
    }
    setObjectFilter(filterObject);
    setOpen(false);
  };

  const onDateChangeFilter = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
    formatString: [string, string]
  ) => {
    if (dates && dates[0] && dates[1]) {
      // Cả hai ngày đều không phải là null
      setDateFilter([dates[0], dates[1]]);
    } else {
      // Ít nhất một trong hai ngày là null, hoặc cả 'dates' là null
      setDateFilter([]);
    }

  };

  const rangePresets: TimeRangePickerProps['presets'] = [
    { label: `${t("rangePreset.Last 7 days")}`, value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: `${t("rangePreset.Last Month")}`, value: [dayjs().add(-1, 'month'), dayjs()] },
    { label: `${t("rangePreset.Last three Months")}`, value: [dayjs().add(-3, 'month'), dayjs()] },
    { label: `${t("rangePreset.Last Year")}`, value: [dayjs().add(-1, 'year'), dayjs()] },
    { label: `${t("rangePreset.Last two Year")}`, value: [dayjs().add(-2, 'year'), dayjs()] },
  ];

  return (
    <div className="flex">
      {children}
      <Button
        type="dashed"
        className="flex items-center justify-center border-blue-500 text-blue-500 max-sm:hidden"
        onClick={() => setOpen(true)}
        icon={<FaFilter className="text-blue-500" />}
      >
        {t("general.filter")}
      </Button>
      <Button
        type="dashed"
        className="flex items-center justify-center border-blue-500 text-blue-500 sm:hidden"
        onClick={() => setOpen(true)}
        icon={<FaFilter className="text-blue-500" />}
      />

      <Modal
        open={open}
        onCancel={handleCancel}
        title={t("general.filter")}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setDateFilter([]);
              if (setDateRange) {
                setDateRange([]);
              }
              setFilterObject(initialState);
              setObjectFilter(initialState);
            }}
          >
            {t("general.deleteFilter")}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={handleOk}
          >
            {t("general.performFiltering")}
          </Button>,
        ]}
      >
        {setDateRange &&
          <RangePicker
            presets={rangePresets}
            onChange={onDateChangeFilter}
            value={dateFilter}
            placeholder={[`${t("general.startDate")}`, `${t("general.endDate")}`]}
            className="max-md:w-full max-md:mb-auto lg:w-full mb-2"
          />
        }
        <div className="grid max-sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 w-full">
          {dataQuery?.map((item: any) => (
            <Select
              key={item.id}
              placeholder={item?.placeholder}
              allowClear
              mode="multiple"
              style={{ width: "100%" }}
              showSearch
              value={filterObject[item?.key]}
              suffixIcon={<FaFilter />}
              maxTagCount={1}
              onChange={(values) => handleChange(values, item?.key)}
              filterOption={(input, option: any) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {item?.data?.map((optionData: any) => (
                <Option key={optionData?.id} value={item?.user ? optionData?.user : optionData?.id}>
                  {item?.user
                    ? `${optionData?.user_info?.first_name} ${optionData?.user_info?.last_name}`
                    : optionData[item?.displayProps]
                  }
                </Option>
              ))}
            </Select>
          ))}
        </div>
      </Modal>
    </div>
  );
}
