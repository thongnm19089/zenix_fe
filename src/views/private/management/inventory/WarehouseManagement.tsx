"use client";

import { useGetBrandListQuery, useGetCategoryListQuery, useGetProductsQuery } from "@/api/Procurement/apiProducts";
import { useGetInventoryByWarehouseQuery } from "@/api/Inventory/apiInventory";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from "@/store/store";
import { Form, Input, Switch, Table, Tabs, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import Filter from "@/components/Filter/Filter";
import dayjs from "dayjs";
import SelectColumn from "@/components/Filter/SelectColumn";
import { useWindowSize } from "@/utils/responsiveSm";

interface InventoriesContainer {
    total: number;
    results: InventoriesProps[];
}

interface DataType {
    id: number;
    name: string;
    inventories: InventoriesContainer;
}

interface InventoriesProps {
    id: number;
    quantity: number;
    alert_level: number;
    reserved: number;
    unit_of_measure: string;
    specifications: string;
    is_below_alert_level: boolean;
    results: any;
    product_info: {
        id: number;
        image_list: { image: string; alt_text: string }[];
        product_name: string;
        product_code: string | null;
        category_str: string;
    }
    sku_info: {
        id: number;
        classify1_str: string;
        classify2_str: string;
        name: string;
        sku_code: string;
    };
}

const initialState = {
    brand: [],
    category: [],
    product: [],
    sku: [],
}

// Định nghĩa prop types cho component Warehouse
interface WarehouseProps {
    data: InventoriesContainer; // Giữ nguyên
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleTableChange: (newPagination: any) => void; // Hoặc sử dụng kiểu dữ liệu cụ thể hơn nếu có
    pagination: any; // Hoặc sử dụng kiểu dữ liệu cụ thể hơn nếu có
    isBelowAlert: boolean;
    onIsBelowAlertChange: (checked: boolean) => void;
    isLoading: boolean;
}

// Component WarehouseManagement
const WarehouseManagement: React.FC<{}> = () => {
    const t: any = useTranslations();
    const [width] = useWindowSize();
    const router = useRouter();
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });
    const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
    const [tempSearchTerm, setTempSearchTerm] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [skipApi, setSkipApi] = useState(false);
    const [isBelowAlert, setIsBelowAlert] = useState(false);
    const [columnConfig, setColumnConfig] = useState<any>({ warehouse_management: [] });

    const [filterObject, setFilterObject] = useState<{
        brand: number[];
        category: number[];
        product: number[];
        sku: number[];
    }>(initialState);

    const {
        data: WarehouseList,
        isLoading,
        isError,
        error,
    } = useGetInventoryByWarehouseQuery({
        page: pagination.current,
        pageSize: pagination.pageSize,
        isBelowAlert: isBelowAlert ? 1 : 0, // Chuyển đổi giá trị boolean sang số
        searchTerm,
        startDate: dateRange[0]?.format("YYYY-MM-DD"),
        endDate: dateRange[1]?.format("YYYY-MM-DD"),
        brand: filterObject.brand,
        category: filterObject.category,
        product: filterObject.product,
        sku: filterObject.sku,
    });
    // Redirect to custom 403 page if there's a 403 error
    if (error && 'status' in error) {
        const fetchError = error as FetchBaseQueryError;
        if (fetchError.status === 403) {
            router.push('/403/');
        }
    }

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

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSkipApi(true);
        }, 2000)
        return () => clearTimeout(timeoutId)
    }, [])

    useEffect(() => {
        const storageColumn = localStorage.getItem("column");
        if (storageColumn) {
            const parsedColumn = JSON.parse(storageColumn);
            const inventoryData = parsedColumn.warehouse_management;
            const inventoryObject = { warehouse_management: inventoryData };
            setColumnConfig(inventoryObject);
        }
    }, []);

    // Xử lý khi thay đổi trang hoặc kích thước trang
    const handleTableChange = (newPagination: any) => {
        setPagination(newPagination);
    };

    const [dataQuery, setDataQuery] = useState({
        page: 1,
        pageSize: 20,
        searchTerm: "",
        category: [],
    });

    const onSearch = () => {
        setPagination({ ...pagination, current: 1 });
    };

    const handleIsBelowAlertChange = (checked: boolean) => {
        setIsBelowAlert(checked);
        setPagination({ ...pagination, current: 1 });
    };
    const { data: brandList } = useGetBrandListQuery();
    const { data: categoryList } = useGetCategoryListQuery();
    const { data: productList, isLoading: isLoadingProduct } =
        useGetProductsQuery(dataQuery);

    const dataArrQuery = [
        {
            id: 1,
            placeholder: `${t("admin.brand")}`,
            data: brandList?.results,
            displayProps: "brand_name",
            key: "brand"
        },
        {
            id: 2,
            placeholder: `${t('table.categories')}`,
            data: categoryList?.results,
            displayProps: "category_name",
            key: "category"
        },
        {
            id: 3,
            placeholder: `${t('table.productName')}`,
            data: productList?.results,
            displayProps: "product_name",
            key: "product"
        },
        {
            id: 4,
            placeholder: `${t('table.productCode')}`,
            data: productList?.results,
            displayProps: "product_code",
            key: "sku"
        },

    ];

    const items = useMemo(() => WarehouseList?.results.map((item: DataType) => ({
        key: item.id,
        label: item.name,
        children: (
            <Warehouse
                data={item.inventories}
                onSearchChange={onSearchChange}
                handleTableChange={handleTableChange}
                pagination={pagination}
                isBelowAlert={isBelowAlert}
                onIsBelowAlertChange={handleIsBelowAlertChange}
                isLoading={isLoading}
            />
        )
    })), [WarehouseList, searchTerm, pagination, isBelowAlert]);

    return (
        <div>
            <div className="flex gap-2">
                <Filter
                    dataQuery={dataArrQuery}
                    objectFilter={filterObject}
                    setObjectFilter={setFilterObject}
                    setPagination={setPagination}
                    pagination={pagination}
                    isLoading={isLoading}
                    initialState={initialState}
                />
                <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
            </div>
            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
};

// Component Warehouse
const Warehouse: React.FC<WarehouseProps> = ({
    data,
    onSearchChange,
    handleTableChange,
    pagination,
    isBelowAlert,
    onIsBelowAlertChange,
    isLoading
}) => {
    const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
    const t: any = useTranslations();
    const params = useParams();
    const [locale, setLocale] = useState(params && params.locale === "vi" ? "vi-VN" : "en-US");
    const [columnConfig, setColumnConfig] = useState<any>({ warehouse_management: [] });
    const { data: categoryList } = useGetCategoryListQuery();

    // Đảm bảo rằng 'data.results' có đủ các thuộc tính cần thiết
    const dataSource: any[] = data.results.map((item: InventoriesProps) => ({
        key: item.id, // key để React xác định mỗi hàng một cách duy nhất
        id: item.id,  // ID của mục hàng
        // Sao chép các thuộc tính khác từ item
        quantity: item.quantity,
        alert_level: item.alert_level,
        reserved: item.reserved,
        unit_of_measure: item.unit_of_measure,
        specifications: item.specifications,
        is_below_alert_level: item.is_below_alert_level,
        product_info: item.product_info,
        sku_info: item.sku_info,
        // Thêm bất kỳ thuộc tính nào khác từ item mà bạn cần
    }));

    const categoryFilters =
        categoryList?.results?.map((category: { category_name: any }) => ({
            text: category.category_name,
            value: category.category_name,
        })) || [];

    categoryFilters.push({ text: "Null", value: "null" });

    useEffect(() => {
        const storageColumn = localStorage.getItem("column");
        if (storageColumn) {
            const parsedColumn = JSON.parse(storageColumn);
            const inventoryData = parsedColumn.warehouse_management;
            const inventoryObject = { warehouse_management: inventoryData };
            setColumnConfig(inventoryObject);
        }
    }, []);

    const columns: ColumnsType<InventoriesProps> = [
        {
            title: "STT",
            key: "index",
            width: 45,
            align: "center",
            render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
          },
        {
            key: "product_code",
            sorter: (a, b) => a?.sku_info?.sku_code?.localeCompare(b?.sku_info?.sku_code, undefined, { sensitivity: 'base' }),
            render: (_, { sku_info, product_info }) => {
                return (
                    <div>
                        {sku_info?.id ? (
                            <div className="font-semibold">{sku_info?.sku_code}</div>
                        ) : (
                            <div className="font-semibold">{product_info?.product_code || ""}</div>
                        )}
                    </div>
                );
            },
            align: "center",
        },
        {
            key: "product_name",
            sorter: (a, b) => a?.product_info?.product_name?.localeCompare(b?.product_info?.product_name, undefined, { sensitivity: 'base' }),
            render: (_, { product_info, sku_info }) => {
                return (
                    <div className=" text-sm font-semibold">
                        <div className="flex gap-4 items-center">
                            <div>
                                <div className="border-2 w-[50px] h-[50px] overflow-hidden">
                                    <Image
                                        src={product_info?.image_list[0]?.image}
                                        className="object-cover"
                                        width={50}
                                        height={50}
                                        alt={product_info?.image_list[0]?.alt_text}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className=" font-semibold uppercase">{product_info?.product_name}</div>
                                <div className=" text-sm">
                                    {sku_info?.classify1_str} {sku_info?.classify2_str && "/"} {sku_info?.classify2_str}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
            align: "center",
        },
        {
            key: "categories",
            sorter: (a, b) => a?.product_info?.category_str.localeCompare(b?.product_info?.category_str, undefined, { sensitivity: 'base' }),
            filters: categoryFilters,
            onFilter: (value, record) => {
                if (value === 'null') {
                    return !record.product_info;
                }
                return record?.product_info?.category_str === value;
            },
            render: (_, { product_info }) => {
                return <div className="font-semibold">{product_info?.category_str}</div>;
            },
            align: "center",
        },
        {
            key: "quantity",
            sorter: (a, b) => a.quantity - b.quantity,
            render: (_, record) => {
                return new Intl.NumberFormat(locale).format(record.quantity);
            },
            align: "center",
        },
        {
            key: "specifications",
            sorter: (a, b) => a?.specifications?.localeCompare(b?.specifications, undefined, { sensitivity: 'base' }),
            dataIndex: "specifications",
            align: "center",
            
        },
        {
            key: "unit_of_measure",
            dataIndex: "unit_of_measure",
            sorter: (a, b) => a?.unit_of_measure?.localeCompare(b?.unit_of_measure, undefined, { sensitivity: 'base' }),
            align: "center",
        },
        {
            key: "reserved",
            sorter: (a, b) => a.reserved - b.reserved,
            render: (_, record) => {
                return new Intl.NumberFormat(locale).format(record.reserved);
            },
            align: "center",
        },
        {
            key: "alert_level",
            sorter: (a, b) => a.alert_level - b.alert_level,
            render: (_, record) => {
                return new Intl.NumberFormat(locale).format(record.alert_level);
            },
            align: "center",
        },
        {
            key: "is_below_alert_level",
            fixed: "right",
            render: (_, record) => {
                return (
                    <Tag color={record.is_below_alert_level ? "red" : "blue"}>
                        {record.is_below_alert_level ? t('general.exceededThreshold') : t('general.safe')}
                    </Tag>
                );
            },
            align: "center",
        },
    ];

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const memoizedColumns = useMemo(() => {
        return columns
            .filter((column) => {
                if (column.width) return true;
                const configEntry = columnConfig?.warehouse_management?.find((entry: { key: number }) => entry.key === column.key);
                return configEntry && configEntry.checked;
            })
            .map((column) => {
                if (!column.title) {
                    const configEntry = columnConfig?.warehouse_management?.find(
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


    return (
        <div className={`overflow-x-auto w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"} px-6`}>

            <div className="flex justify-between items-center px-2 md:px-3 py-2 mb-4 max-md:flex-col max-md:gap-3">
                <Form layout="inline" className="max-md:gap-2 w-full">

                    <Form.Item className="max-md:w-full w-1/2">
                        <Input placeholder={t('inventory.searchProductCategoryBrandSKUcode')} onChange={onSearchChange} />
                    </Form.Item>

                    <Form.Item className="max-md:w-full">
                        <label htmlFor="isBelowAlertSwitch" className="mr-2">{t('inventory.isBelowAlert')}:</label>
                        <Switch
                            id="isBelowAlertSwitch"
                            checked={isBelowAlert}
                            onChange={onIsBelowAlertChange}
                        />
                    </Form.Item>

                </Form>
            </div>

            <div className="overflow-x-auto">
                <Table
                    rowSelection={rowSelection}
                    columns={memoizedColumns}
                    dataSource={dataSource}
                    pagination={{
                        ...pagination,
                        total: data?.total || 0, // Số lượng tổng cộng từ dữ liệu của bạn
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100", "200"],
                    }}
                    onChange={handleTableChange}
                    loading={isLoading}
                    scroll={{ x: 700 }}
                    bordered
                />
            </div>
        </div>
    );
}




export default WarehouseManagement;
