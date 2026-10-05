"use client";
import { useMemo } from "react"
import { useDeleteCostMutation, useGetAllCostListQuery, useGetCostListQuery } from "@/api/Finance/apiCost";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useGetSetupFinanceAppQuery } from "@/api/SetUp/apiSetup";
import ActionTable from "@/components/DropDown/ActionTable";
import AddAndUpdateCost from "@/components/FunctionsManagement/Finance/AddAndUpdateCost";
import { useWindowSize } from "@/utils/responsiveSm";
import { RootState } from "@/store/store";
import { Button, DatePicker, Divider, Form, Input, Popconfirm, Radio, Space, Table, Tag, notification, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import { IoRefresh } from "react-icons/io5";
import { BsFiletypeXls } from 'react-icons/bs';
import { BsFiletypeCsv } from "react-icons/bs";
import { BsFiletypePdf } from "react-icons/bs";
import useExport from "@/utils/useExport";
import { MenuProps } from "antd/lib";
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";

const { RangePicker } = DatePicker;

interface DataType {
  key: React.Key;
  id: number;
  created: string;
  title: string;
  ref_document: string;
  category_str: string;
  subcategory: number;
  subcategory_str: string;
  amount: number;
  payment_date: string;
  account_choice: number;
  account_choice_str: string;
  beneficiary: string;
  detail: string;
}

const initialState = {
  category: [],
  subcategory: [],
  account_choice: [],
}

export default function CostManagement() {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const router = useRouter();
  const params = useParams();
  const [locale, setLocale] = useState(params?.locale === "vi" ? "vi-VN" : "en-US");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [columnConfig, setColumnConfig] = useState<any>({ cost_business: [] });

  const [filterObject, setFilterObject] = useState<{
    category: number[];
    subcategory: number[];
    account_choice: number[];
  }>(initialState);

  const [menuName, setMenuName] = useState<string>("Hành động");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowKeysForExport, setSelectedRowKeysForExport] = useState<React.Key[]>([])

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    if (menuName === t("noficationAddAndUpdate.aLotSelect")) {
      setSelectedRowKeysForExport(newSelectedRowKeys); // Cập nhật khi dùng cho Export
    } else {
      setSelectedRowKeys(newSelectedRowKeys); // Cập nhật khi dùng cho các trường hợp khác
    }
  };

  const rowSelection = {
    selectedRowKeys: menuName === t("noficationAddAndUpdate.aLotSelect")
      ? selectedRowKeysForExport
      : selectedRowKeys,
    onChange: onSelectChange,
  };
  // Thêm tham số vào hook query
  const {
    data: costList,
    refetch,
    isLoading,
    error
  } = useGetCostListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    category: filterObject.category,
    subcategory: filterObject.subcategory,
    account_choice: filterObject.account_choice,
  });

  // Redirect to custom 403 page if there's a 403 error
  if (error && 'status' in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push('/403/');
    }
  }

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const costBusinessData = parsedColumn.cost_business;
      const costBusinessObject = { cost_business: costBusinessData };
      setColumnConfig(costBusinessObject);
    }
  }, []);

  // Xử lý khi thay đổi trang hoặc kích thước trang
  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  // Xử lý thay đổi dữ liệu tìm kiếm và ngày
  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setTempSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  const onDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      // Cả hai ngày đều không phải là null
      setDateRange([dates[0], dates[1]]);
    } else {
      // Ít nhất một trong hai ngày là null, hoặc cả 'dates' là null
      setDateRange([]);
    }

    // Cập nhật pagination
    setPagination({ ...pagination, current: 1 });
  };

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource = costList?.results.map((record: { id: any }) => ({ ...record, key: record.id })) || [];

  const [deleteCost, { isLoading: isLoadingDelete }] = useDeleteCostMutation();
  const { data: setupFinanceApp } = useGetSetupFinanceAppQuery();

  const dataArrQuery = [
    {
      id: 1,
      placeholder: "Danh mục",
      data: setupFinanceApp?.cost_category_list,
      displayProps: "title",
      key: "category"
    },
    {
      id: 2,
      placeholder: "Tiểu mục",
      data: setupFinanceApp?.subcost_category_list,
      displayProps: "title",
      key: "subcategory"
    },
    {
      id: 3,
      placeholder: "Tài khoản",
      data: setupFinanceApp?.bank_account_list,
      displayProps: "title",
      key: "account_choice"
    }
  ];

  const columns: ColumnsType<DataType> = [
    {
      title: "STT",
      key: "index",
      width: 45,
      align: "center",
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      key: "created",
      sorter: (a, b) => dayjs(a.created).unix() - dayjs(b.created).unix(),
      render: (_, { created }) => {
        return (
          <div className="flex">
            <div className="pr-2">{dayjs(created).format("HH:mm")}</div>
            <div>{dayjs(created).format("DD/MM/YYYY")}</div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "title",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      align: "center",
    },
    {
      dataIndex: "category_str",
      key: "category",
      render: (_, { category_str }) => <span>{category_str}</span>,
      align: "center",
    },
    {
      dataIndex: "subcategory_str",
      key: "subcategory",
      render: (_, record) => <span>{record?.subcategory_str}</span>,
      align: "center",
    },
    {
      key: "money",
      sorter: (a, b) => a.amount - b.amount,
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.amount);
      },
      align: "center",
    },
    {
      key: "date",
      dataIndex: "payment_date",
      align: "center",
    },
    {
      dataIndex: "beneficiary",
      key: "persion",
      align: "center",
    },
    {
      dataIndex: "account_choice_str",
      key: "account",
      render: (_, record) => <span>{record.account_choice_str}</span>,
      align: "center",
    },
    {
      key: "note",
      render: (_, record) => <p className="flex-1">{record?.detail}</p>,
      align: "center",
    },
    {
      key: "x",
      fixed: "right",
      width: width > 640 ? 120 : 40,
      render: (_, { id, title, ref_document, amount, payment_date, subcategory, account_choice, beneficiary, detail }) => (
        <Space size="middle" direction="vertical" className="text-center">
          <div className="flex gap-2">
            <ActionTable
              items={[
                {
                  key: "1",
                  label: (
                    <AddAndUpdateCost
                      edit={true}
                      costId={id}
                      title={title}
                      ref_document={ref_document}
                      amount={amount}
                      subcategory={subcategory}
                      paymentDate={payment_date}
                      beneficiary={beneficiary}
                      accountChoice={account_choice}
                      detail={detail}
                    />
                  ),
                },
                {
                  key: "2",
                  label: (
                    <Popconfirm
                      title={t('noficationDelete.costCategorySure')}
                      description={t('noficationDelete.costCategorySure')}
                      onConfirm={() => onDelete(id)}
                      onCancel={cancel}
                      okText={t('general.confirm')}
                      cancelText={t('table.actionValues.canceltext')}
                      placement="left"
                      okButtonProps={{ loading: isLoadingDelete }}
                    >
                      <Button danger size="small" className="max-sm:hidden">{t("general.delete")}</Button>
                      <div className="sm:hidden text-center">Xóa</div>
                    </Popconfirm>
                  ),
                },
              ]}
            />
          </div>
        </Space>
      ),
      align: "center",
    },
  ];

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.cost_business?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.cost_business?.find(
            (entry: { key: number }) => entry.key === column.key
          );
          return {
            ...column,
            title: configEntry?.title,
            width: configEntry?.width || column.width,
          };
        }
        return column;
      });
  }, [columnConfig, columns]);

  const handleRefresh = () => {
    setDateRange([]);
    setTempSearchTerm("");
    setSearchTerm("");
    setSkipApi(false);
    setFilterObject(initialState);

    if (!skipApi) {
      refetch();
    }
  };

  const onDelete = async (costId: any) => {
    try {
      await deleteCost({ costId });
      notification.success({
        message: `${t('noficationDelete.costCategorySuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.costCategoryError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };


  const convertData = (data: DataType[]) => {
    const filteredData = selectedRowKeysForExport.length > 0
      ? data.filter((item: DataType) => selectedRowKeysForExport.includes(item.id))
      : data;

    return filteredData.map((item: DataType, index) => ({
      ...item,
      created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),
      payment_date: dayjs(item.payment_date).format("DD/MM/YYYY"),
      key: index + 1,
    }));
  };

  const convertedData = convertData(dataSource);

  const fileColumns: ColumnsType<DataType> = [
    {
      title: 'STT',
      key: 'key',
    },
    {
      title: 'Ngày tạo',
      key: 'created'
    },
    {
      title: 'Tiêu đề',
      key: 'title'
    },
    {
      title: 'Danh mục',
      key: 'category_str',
    },
    {
      title: 'Tiểu mục',
      key: "subcategory_str",
    },
    {
      title: 'Số tiền',
      key: 'amount'
    },
    {
      title: 'Ngày thanh toán',
      key: 'payment_date'
    },
    {
      title: 'Người thụ hưởng',
      key: 'beneficiary'
    },
    {
      title: 'Lựa chọn tài khoản',
      key: 'account_choice_str'
    },
    {
      title: 'Ghi chú',
      key: 'detail'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 22 },
      2: { cellWidth: 23 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 18 },
      6: { cellWidth: 22 },
      7: { cellWidth: 20 },
      8: { cellWidth: 18 },
      9: { cellWidth: 25 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllCostList } = useGetAllCostListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyChiPhi",
    pdfTheme: "striped",
    pdfOptions,
  });

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "1") setMenuName(`${t('noficationAddAndUpdate.aLotSelect')}`);
    else if (e.key === "2") setMenuName(`${t('noficationAddAndUpdate.exportAllData')}`);
    else if (e.key === "6") {
      setMenuName("Hành động"); ``
      setSelectedRowKeys([]);
    }
  };

  useEffect(() => {
    if (isExportTriggered && AllCostList) {
      const newData = AllCostList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllCostList, isExportTriggered]);

  useEffect(() => {
    if (allData.length > 0 && isExportComplete) {
      onExcelPrintAllData();
      setIsExportComplete(false);
    }
  }, [allData, isExportComplete]);

  const handleExportAllData = (exportFn: any) => {
    setIsExportTriggered(true);  // Bắt đầu trạng thái loading khi xuất file
    if (allData.length === 0) {
      setIsExportTriggered(true);
    } else {
      exportFn();
      setIsExportTriggered(false);
    }
  };


  const { onExcelPrint: onExcelPrintAllData, onCsvPrint: onCsvPrintAllData, onPdfPrint: onPdfPrintAllData } = useExport({
    columns: fileColumns,
    data: convertData(allData),
    fileName: "QuanLyChiPhi",
    pdfTheme: "striped",
    pdfOptions,
  });

  const items: MenuProps["items"] = [
    {
      label: `${t("noficationAddAndUpdate.aLotSelect")}`,
      key: "1",
      icon: <FaFileExport />,
    },
    {
      label: (`${t("noficationAddAndUpdate.exportAllData")}`),
      key: "2",
      children: [
        { label: "Xuất Excel", key: "3", onClick: () => handleExportAllData(onExcelPrintAllData), },
        { label: "Xuất CSV", key: "4", onClick: () => handleExportAllData(onCsvPrintAllData), },
        { label: "Xuất PDF", key: "5", onClick: () => handleExportAllData(onPdfPrintAllData), },
      ]
    },
    {
      label: "Huỷ",
      key: "6",
      icon: <FcCancel />,
    },
  ];

  const renderIcon = (name: string, selectedCount: number) => {
    if (name === `${t("noficationAddAndUpdate.aLotSelect")}`) {
      return (
        <div style={{ position: "relative" }}>
          {selectedCount > 0 && (
            <div
              style={{
                background: "red",
                borderRadius: 50,
                height: 17,
                width: 17,
                position: "absolute",
                right: -5,
                top: -7,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 10 }}>{selectedCount}</span>
            </div>
          )}
        </div>
      );
    } else if (name === `${t("noficationAddAndUpdate.exportAllData")}`) {
      return (
        <div style={{ position: "relative" }}>
          {selectedCount > 0 && (
            <div
              style={{
                background: "red",
                borderRadius: 50,
                height: 17,
                width: 17,
                position: "absolute",
                right: -5,
                top: -7,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 10 }}>{selectedCount}</span>
            </div>
          )}
        </div>
      );
    } else {
      return <IoMdSettings size={17} fill="gray" />;
    }
  };

  const menuProps = {
    items: [`${t("noficationAddAndUpdate.aLotSelect")}`, `${t("noficationAddAndUpdate.exportAllData")}`].includes(menuName)
      ? items
      : items.splice(0, 2),
    onClick: handleMenuClick,
  };

  return (
    <div
      className={`overflow-x-auto w-screen  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        }   p-6`}
    >
      <div className="flex justify-between items-center  py-2 mb-2 max-md:flex-col max-md:gap-3">
        <div className="flex justify-center -ml-2 mr-3">
          <Dropdown menu={menuProps}>
            <div
              style={{
                width: "50px",
                borderColor: [
                  `${t("noficationAddAndUpdate.aLotSelect")}`,
                  `${t("noficationAddAndUpdate.exportAllData")}`,
                ].includes(menuName)
                  ? "blue"
                  : "#d9d9d9",
                borderRadius: "6px",
                height: "32px",
              }}
              className="flex items-center justify-center cursor-pointer"
            >
              {renderIcon(menuName, selectedRowKeys?.length)}
            </div>
          </Dropdown>
        </div>
        <Form layout="inline" className=" w-full">
          <Form.Item className="max-md:w-full w-1/2 mb-3">
            <Input placeholder={t('finance.searchTitleCategoryBeneficiary')} onChange={onSearchChange} />
          </Form.Item>
        </Form>
        <div className="flex justify-end text-right max-md:w-full w-1/2 gap-2">
          <div className="flex gap-2 items-center ml-auto">
            <Button
              type="dashed"
              className="flex items-center justify-center border-blue-500 text-blue-500"
              icon={<BsFiletypeXls className="text-blue-500" />}
              onClick={onExcelPrint}
            >
              Xuất Excel
            </Button>
            <Button
              type="dashed"
              className="flex items-center justify-center border-blue-500 text-blue-500"
              icon={<BsFiletypeCsv className="text-blue-500" />}
              onClick={onCsvPrint}
            >
              Xuất CSV
            </Button>
            <Button
              type="dashed"
              className="flex items-center justify-center border-blue-500 text-blue-500"
              icon={<BsFiletypePdf className="text-blue-500" />}
              onClick={onPdfPrint}
            >
              Xuất PDF
            </Button>
          </div>
          <Button
            type="dashed"
            icon={<IoRefresh className="text-blue-500" />}
            className="flex items-center justify-center border-blue-500 text-blue-500"
            onClick={handleRefresh}
          >
            {t("general.refreshThePage")}
          </Button>
          <Filter
            dataQuery={dataArrQuery}
            objectFilter={filterObject}
            setObjectFilter={setFilterObject}
            setPagination={setPagination}
            pagination={pagination}
            isLoading={isLoading}
            initialState={initialState}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
          <AddAndUpdateCost />
        </div>
      </div>


      <div className="overflow-x-auto">
        <Table
          columns={memoizedColumns}
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total: costList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          bordered
          rowSelection={
            [`${t("noficationAddAndUpdate.aLotSelect")}`, `${t("noficationAddAndUpdate.exportAllData")}`].includes(menuName)
              ? rowSelection
              : undefined
          }
          scroll={{ x: 1300 }}
        />
      </div>
    </div>
  );
}
