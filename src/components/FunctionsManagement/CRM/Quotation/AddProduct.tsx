import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import { IProduct } from "@/types/productType";
import { Button, Modal, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { BiListPlus } from "react-icons/bi";

const useTransformArray = (data: any) => {
  return useMemo(() => {
    return data?.flatMap((item: any) => {
      if (item.sku_list.length === 0) {
        return [{ ...item, sku: { id: null, name: "" } }];
      } else {
        return item.sku_list.map((skuItem: any) => ({
          ...item,
          sku: skuItem,
        }));
      }
    });
  }, [data]);
};

const AddProduct = ({ setProductListTable, productListTable }: { setProductListTable: any; productListTable: any }) => {
  const { data: setupCrmApp } = useGetSetupCrmAppQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const t: any = useTranslations();
  const productData = useTransformArray(setupCrmApp?.product_list);

  const transformedData = productData?.map((item: { id: number; sku: { id: number | null } }) => ({
    ...item,
    key: `${item.id}-${item.sku.id || ""}`,
  }));

  const columns: ColumnsType<IProduct> = [
    {
      title: `${t("table.productCode")}`,
      width: 80,
      sorter: (a, b) => a?.sku?.name?.localeCompare(b?.sku?.name, undefined, { sensitivity: "base" }),
      render: (_, { sku, product_code }) => {
        return (
          <div>
            {product_code || ""}
            {sku.sku_code || ""}
          </div>
        );
      },
    },
    {
      title: `${t("table.productName")}`,
      dataIndex: "product_name",
      sorter: (a, b) => a?.product_name?.localeCompare(b?.product_name, undefined, { sensitivity: "base" }),
      render: (_, { product_name, image_list, sku }) => {
        return (
          <div className=" text-sm font-semibold">
            <div className="flex gap-4 items-center">
              <div>
                <div className="border-2 w-[45px] h-[45px] overflow-hidden">
                  <Image
                    src={image_list[0]?.image}
                    className="object-cover"
                    width={50}
                    height={50}
                    alt={image_list[0]?.atl_text}
                  />
                </div>
              </div>
              <div>
                <div className=" font-semibold uppercase">{product_name}</div>
                <div className=" text-sm">
                  {sku?.classify1_str} {sku?.classify2_str && "/"} {sku?.classify2_str}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    // {
    //   title: `${t("table.categories")}`,
    //   width: 200,
    //   sorter: (a, b) => a?.category_str?.localeCompare(b?.category_str, undefined, { sensitivity: "base" }),
    //   dataIndex: "category_str",
    //   filters: categoryFilters,
    //   onFilter: (value, record) => {
    //     if (value === "null") {
    //       return !record.category_str;
    //     }
    //     return record.category_str === value;
    //   },
    // },
    {
      title: `${t("admin.specifications")}`,
      width: 150,
      sorter: (a, b) => a?.specifications?.localeCompare(b?.specifications, undefined, { sensitivity: "base" }),
      dataIndex: "specifications",
      align: "center",
    },
    {
      title: `${t("admin.unit")}`,
      width: 120,
      dataIndex: "unit_of_measure",
      sorter: (a, b) => a?.unit_of_measure?.localeCompare(b?.unit_of_measure, undefined, { sensitivity: "base" }),
      align: "center",
    },
    {
      title: `${t("crm.price")}`,
      width: 150,
      dataIndex: "skuList",
      render: (_, { base_price, sku }) => {
        return new Intl.NumberFormat("vi-VN").format(base_price + (sku.price || 0));
      },
      sorter: (a, b) => {
        const priceA = a.base_price + (a.sku.price || 0);
        const priceB = b.base_price + (b.sku.price || 0);
        return priceA - priceB;
      },
    },
  ];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    const newSelectedRowDetails = transformedData
      .filter((item: { key: React.Key }) => selectedRowKeys.includes(item.key))
      .map((item: any) => {
        return {
          key: item.key,
          id: item.id,
          sku_id: item.sku.id || null,
          product_code: item.product_code + (item.sku?.sku_code || ""),
          product_name: `${item.product_name}  
          ${item.sku?.classify1_str || item.sku?.classify2_str ? `(` : ""}
           ${item.sku?.classify1_str || ""} 
          ${item.sku?.classify2_str ? `/` : ""} ${item.sku?.classify2_str || ""} 
          ${item.sku?.classify1_str || item.sku?.classify2_str ? `)` : ""}
          `,
          unit_of_measure: item.unit_of_measure,
          price: item.base_price + (item.sku?.price || 0),
        };
      });

    setProductListTable(newSelectedRowDetails);
  };

  useEffect(() => {
    if (productListTable) {
      setSelectedRowKeys(productListTable.map((item: { key: React.Key }) => item?.key));
    }
  }, [productListTable]);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onSelectChange = (newSelectedRowKeys: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    // getCheckboxProps, nếu cần
  };
  return (
    <>
      <Button type="link" onClick={showModal} icon={<BiListPlus size={20} />}></Button>
      <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={1000}>
        <Table rowSelection={rowSelection} columns={columns} dataSource={transformedData} />
      </Modal>
    </>
  );
};

export default AddProduct;
