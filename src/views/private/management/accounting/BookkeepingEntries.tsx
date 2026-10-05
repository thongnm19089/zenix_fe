"use client";

import {
  useDeleteJournalEntryMutation,
  useGetJournalEntryListQuery,
} from "@/api/Accounting/apiAccounting";
import ActionTable from "@/components/DropDown/ActionTable";
import SelectColumn from "@/components/Filter/SelectColumn";
import AddAndUpdateJournalEntry from "@/components/FunctionsManagement/Accounting/AddAndUpdateJournalEntry";
import { RootState } from "@/store/store";
import { useWindowSize } from "@/utils/responsiveSm";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  Form,
  Input,
  Space,
  Table,
  Popconfirm,
  DatePicker,
  Button,
  notification,
  Tag,
  Dropdown
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { BsFiletypeXls } from 'react-icons/bs';
import { BsFiletypeCsv } from "react-icons/bs";
import { BsFiletypePdf } from "react-icons/bs";
import useExport from "@/utils/useExport";
import { MenuProps } from "antd/lib";
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";

const { RangePicker } = DatePicker;

// Cập nhật DataType

interface DetailedRating {
  criteria_title: string;
  score: string;
  comment: string;
}

interface PaymentTermInfo {
  id: number;
  created: string;
  title: string;
  color: string;
  user: number;
}

interface DataType {
  key: React.Key;
  id: number;
  document_date: string;
  date: string;
}

export default function SupplierManagement() {
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );


  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();

  const [columnConfig, setColumnConfig] = useState<any>({ bookkeeping_entries: [] });
  const {
    data: journalEntryList,
    isLoading,
    error,
  } = useGetJournalEntryListQuery();


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

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const bookkeepingEntriesData = parsedColumn.bookkeeping_entries;
      const bookkeepingEntriesObject = { bookkeeping_entries: bookkeepingEntriesData };
      setColumnConfig(bookkeepingEntriesObject);
    }
  }, []);

  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  const [deleteJournal, { isLoading: isLoadingDelete }] =
    useDeleteJournalEntryMutation();

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
      // title: `Ngày ghi sổ`,
      // dataIndex: "date",
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (_, { date }) => {
        return <div>{dayjs(date).format("DD/MM/YYYY")}</div>;
      },
      align: "center",
    },
    {
      // title: `Số hóa đơn`,
      dataIndex: "invoice_number",
      key: "invoice_number",
      align: "center",
    },
    {
      // title: `Số chứng từ`,
      dataIndex: "ref_code",
      key: "ref_code",
      align: "center",
    },
    {
      key: "document",
      // title: `Ngày chứng từ`,
      // dataIndex: "document_date",
      sorter: (a, b) =>
        dayjs(a.document_date).unix() - dayjs(b.document_date).unix(),
      render: (_, { document_date }) => {
        return <div>{dayjs(document_date).format("DD/MM/YYYY")}</div>;
      },
      align: "center",
    },
    {
      // title: "TK Nợ",
      dataIndex: "debit_account_info",
      key: "debit_account",
      align: "center",
    },
    {
      // title: "Tk Có",
      dataIndex: "credit_account_info",
      key: "credit_account",
      align: "center",
    },
    {
      // title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      // title: " Số tiền",
      dataIndex: "cost_price",
      key: "price",
      align: "center",
    },
    {
      // title: "Diễn giải",
      dataIndex: "description",
      key: "description",
      align: "center",
    },

    {
      title: ``,
      dataIndex: "",
      key: "x",
      width: width > 640 ? 120 : 40,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle" direction="vertical" className="text-center">
          <div className="flex gap-2">
            <ActionTable
              items={[
                {
                  key: "1",
                  label: (
                    <AddAndUpdateJournalEntry edit={true} record={record} />
                  ),
                },
                {
                  key: "2",
                  label: (
                    <Popconfirm
                      title={"Xoá dữ liệu hạch toán"}
                      description={"Bạn có chắc chắn muốn xoá dữ liệu này không?"}
                      onConfirm={() => onDelete(record?.id)}
                      onCancel={cancel}
                      okText={t("general.confirm")}
                      cancelText={t("table.actionValues.canceltext")}
                      placement="left"
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

  const onDelete = async (id: any) => {
    try {
      await deleteJournal(id);
      notification.success({
        message: `Xoá dữ liệu thành cồng`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `Xoá dữ liệu thất bại`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };
  const cancel = () => { };

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.bookkeeping_entries?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.bookkeeping_entries?.find(
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

  
  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "1") setMenuName(`${t('noficationAddAndUpdate.aLotSelect')}`);
    else if (e.key === "2") setMenuName(`${t('noficationAddAndUpdate.exportAllData')}`);
    else if (e.key === "6") {
      setMenuName("Hành động"); ``
      setSelectedRowKeys([]);
    }
  };

  const convertData = (data: DataType[]) => {
    const filteredData = selectedRowKeysForExport.length > 0
      ? data.filter((item: DataType) => selectedRowKeysForExport.includes(item.id))
      : data;

    return filteredData?.map((item: DataType, index) => ({
      ...item,
      created: dayjs(item.date).format("DD/MM/YYYY"),
      document_date: dayjs(item.document_date).format("DD/MM/YYYY"),
      key: index + 1,
    }));
  };

  const convertedData = convertData(journalEntryList?.results);

  const fileColumns: ColumnsType<DataType> = [
    {
      title: 'STT',
      key: 'key',
    },
    {
      title: 'Ngày ghi sổ',
      key: 'created'
    },
    {
      title: 'Số hóa đơn',
      key: 'invoice_number'
    },
    {
      title: 'Số chứng từ',
      key: 'ref_code'
    },
    {
      title: 'Ngày chứng từ',
      key: 'document_date',
    },
    {
      title: 'TK nợ',
      key: "debit_account_info",
    },
    {
      title: 'TK có',
      key: 'credit_account_info'
    },
    {
      title: 'Số lượng',
      key: 'quantity'
    },
    {
      title: 'Số tiền',
      key: 'cost_price'
    },
    {
      title: 'Diễn giải',
      key: 'description'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 23 },
      3: { cellWidth: 22 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 18 },
      7: { cellWidth: 18 },
      8: { cellWidth: 25 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);


  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "HachToan",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && journalEntryList) {
      const newData = journalEntryList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportTriggered(false);
    }
  }, [journalEntryList, isExportTriggered]);


  const handleExportAllData = (exportFn: any) => {
    if (allData.length === 0) {
      setIsExportTriggered(true);
    } else {
      const convertedDatas = convertData(allData);
      exportFn({
        columns: fileColumns,
        data: convertedDatas,
        fileName: "HachToan",
        pdfTheme: "striped",
        pdfOptions,
      });

    }
  };


  const { onExcelPrint: onExcelPrintAllData, onCsvPrint: onCsvPrintAllData, onPdfPrint: onPdfPrintAllData } = useExport({
    columns: fileColumns,
    data: convertData(allData),
    fileName: "HachToan",
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
      <div className="flex justify-end items-center  py-2 mb-2 max-md:flex-col max-md:gap-3">
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
        <div className="flex justify-end text-right w-full gap-2">
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
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
          <AddAndUpdateJournalEntry edit={false} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={memoizedColumns}
          // columns={columns}
          dataSource={journalEntryList?.results}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          loading={isLoading}
          scroll={{ x: 1400 }}
          rowSelection={
            [`${t("noficationAddAndUpdate.aLotSelect")}`, `${t("noficationAddAndUpdate.exportAllData")}`].includes(menuName)
              ? rowSelection
              : undefined
          }
          bordered
        />
      </div>
    </div>
  );
}
