"use client";

import { useGetProductsQuery } from "@/api/Procurement/apiProducts";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import CategoryCard from "@/components/FunctionsManagement/CRM/Order/CategoryCard";
import { addToCart } from "@/features/cartSlice";
import { Input, List, Modal, Skeleton, Spin, Tag } from "antd";
import _ from "lodash";
import { useTranslations } from "next-intl";
import VirtualList from "rc-virtual-list";
import React, { memo, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { useDispatch } from "react-redux";

const ProductList = ({ isPurchase }: { isPurchase?: boolean }) => {
  const dispatch = useDispatch();
  const t: any = useTranslations();

  const [search, setSearch] = useState("");
  const [currentCategory, setCurrentCategory] = useState<number>(0);
  const [dataQuery, setDataQuery] = useState({
    page: 1,
    pageSize: 20,
    searchTerm: "",
    category: [],
  });


  const [data, setData] = useState<any[]>([]);

  const { data: setupCrmApp, isLoading } = useGetSetupCrmAppQuery();

  const { data: productList, isLoading: isLoadingProduct } =
    useGetProductsQuery(dataQuery);
  // console.log("haha", productList)
  const ContainerHeight = isPurchase ? 450 : 1250

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      ContainerHeight &&
      !isLoadingProduct
    ) {
      setDataQuery({ ...dataQuery, page: dataQuery.page + 1 });
    }
  };

  useEffect(() => {
    if (productList?.results) {
      setData(data.concat(productList.results));
    }
  }, [productList]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDataQuery({ ...dataQuery, page: 1, pageSize: 20, searchTerm: search });
    }, 500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [search]);

  if (isLoading || isLoadingProduct) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin tip="Loading..." />
      </div>
    );
  }

  const groupedData = Object.values(
    _.groupBy(setupCrmApp?.product_list, "category")
  );

  return (
    <>
      <Input
        size="large"
        className="mt-1"
        placeholder={t("crm.findProducts")}
        prefix={<CiSearch size={20} />}
        onChange={(e) => {
          setSearch(e.target.value)
          setTimeout(() => {
            setData([])
          }, 500)
        }}
      />
      <div className="categories-container flex items-center justify-start space-x-2 overflow-x-auto py-4">
        <CategoryCard
          name={t("crm.all")}
          id={0}
          currentCategory={currentCategory}
          setCurrentCategory={setCurrentCategory}
          categoryData={dataQuery}
          setData={setData}
          setCategoryData={setDataQuery}
        />
        {groupedData?.map((item) => (
          <CategoryCard
            key={item[0].category}
            id={item[0].category}
            name={item[0].category_str}
            categoryData={dataQuery}
            setData={setData}
            setCategoryData={setDataQuery}
            currentCategory={currentCategory}
            setCurrentCategory={setCurrentCategory}
          />
        ))}
      </div>
      {/* <Scrollbars
        style={{ flex: 1, overflowX: "hidden", minHeight: isPurchase ? 300 : "calc(100vh - 275px)" }}
        autoHide
      > */}
      {/* <motion.div
        layout
        className={`  grid ${
          isPurchase
            ? "xl:grid-cols-5 md:grid-col-2 grid-col-1"
            : "grid-cols-2 max-md:grid-col-1"
        }`}
      >
        {productList?.results.map((product: any) => {
          return (
            <motion.div
              layout
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              className={classNames(
                // food.soldOut ? "pointer-events-none opacity-30" : "",
                "flex items-center justify-between py-4 pr-4"
              )}
              key={product.id}
            >
              <div
                className="flex flex-1 cursor-pointer items-center gap-2"
                onClick={() => {
                  dispatch(
                    addToCart({
                      ...product,
                      quantity: (product.quantity || 0) + 1,
                      sku:
                        product.sku_list.length > 0 ? product.sku_list[0] : {},
                    })
                  );
                }}
              >
                <img
                  src={product?.image_list[0]?.image}
                  alt={product?.image_list[0]?.alt_text}
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div>
                  <Tag color="#FF9141">{product.brand_str.toUpperCase()}</Tag>
                  <p className="mt-2">{product.product_name}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div> */}
      <List>
        <VirtualList
          data={data}
          height={ContainerHeight}
          itemHeight={20}
          itemKey="id"
          onScroll={onScroll}
        >
          {(item: any) => (
            <List.Item
              key={item?.id}
              actions={[
                <a
                  onClick={() => {
                    dispatch(
                      addToCart({
                        ...item,
                        quantity: (item.quantity || 0) + 1,
                        sku: item.sku_list.length > 0 ? item.sku_list[0] : {},
                      })
                    );
                  }}
                  key="list-loadmore-more"
                  className="underline hover:underline"
                >
                  Thêm vào giỏ hàng
                </a>,
              ]}
            >
              <Skeleton title={false} loading={isLoadingProduct} active>
                <List.Item.Meta
                  // avatar={<Avatar src={item.picture.large} />}
                  title={
                    <Tag
                      color={`${item?.sku_list?.length > 0 ? "#55acee" : "#cd201f"
                        }`}
                    >
                      {item?.category_str}
                    </Tag>
                  }
                  description={<OpenProductInfoModal product={item} />}
                />
              </Skeleton>
            </List.Item>
          )}
        </VirtualList>
      </List>
      {/* <div className="flex  justify-center w-100%">
        <Pagination
          onChange={(page, pageSize) =>
            setDataQuery({ ...dataQuery, page: page, pageSize: pageSize })
          }
          style={{ marginTop: "10px" }}
          defaultCurrent={1}
          total={productList?.total}
        />
      </div> */}
      {/* </Scrollbars> */}
    </>
  );
};


const OpenProductInfoModal = ({ product }: { product: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };


  return (
    <>
      <h4
        onClick={showModal}
        className="cursor-pointer"
      >
        {product?.product_name}
      </h4>
      <Modal
        title={`${t("crm.infoProduct")}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={690}
      >
        <div>
          <div className="flex">
            <div>
              {product?.image_list && (
                product.image_list.map((image: any) => (
                  <div key={image.id} style={{ width: '100px', height: '80px', margin: '5px', boxSizing: 'border-box', alignSelf: 'stretch' }}>
                    <img
                      src={image.image}
                      alt={image.alt_text || product?.product_name}
                      style={{ width: '100%', height: '100%', borderRadius: '5px', border: '1px solid #000' }}
                    />
                  </div>
                ))
              )}
            </div>
            <div style={{ flex: 1, paddingLeft: '20px', lineHeight: '0.75', marginTop: '5px' }}>
              <p style={{ marginLeft: '25px' }}><strong>{t('admin.productName')}:</strong> {product?.product_name}</p>
              {product.sku_list && product.product_code && product.sku_list.length === 0 && (
                <p style={{ marginLeft: '25px', marginTop: '17px' }}><strong>{t('table.codeProduct')}:</strong> {product?.product_code}</p>
              )}
              <p style={{ marginLeft: '25px', marginTop: '17px' }}><strong>{t('table.categories')}:</strong> {product?.category_str}</p>
              <p style={{ marginLeft: '25px', marginTop: '17px' }}><strong>{t('admin.brand')}:</strong> {product?.brand_str}</p>
            </div>
            <div style={{ flex: 1, paddingLeft: '20px', lineHeight: '0.75', marginTop: '5px' }}>

              {product.specifications === "null" || product.specifications === "undefined" ? (
                <div hidden></div>
              ) : (
                <p className="pb-1">
                  <strong>{t('admin.specifications')}:</strong> {product.specifications}
                </p>
              )}
              {product.unit_of_measure === "null" || product.specifications === "undefined" ? (
                <div hidden></div>
              ) : (
                <p><strong>{t('admin.unit')}:</strong> {product?.unit_of_measure}</p>
              )}
              {product.unit_of_measure === "null" || product.specifications === "undefined" ? (
                <p style={{ marginBottom: '10px' }}><strong>{t("admin.basicPrice")}:</strong> {product?.base_price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
              ) : (
                <p style={{ marginTop: '17px' }}><strong>{t("admin.basicPrice")}:</strong> {product?.base_price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto overflow-hidden">
            <div className="w-[630px]">
              {product.sku_list && product.sku_list.length > 0 && (
                <div className="flex items-center border mt-2 bg-gray-100 border-gray-300">
                  <table className="w-full text-sm text-left rtl:text-right text-dark-100 dark:text-dark-100">
                    <thead className="text-xs text-dark-300 bg-gray-50 dark:bg-gray-700 dark:text-dark-100">
                      <tr>
                        <th scope="col" className="py-3 px-1 text-[14px] border-r text-center">
                          {t("table.codeProduct")}
                        </th>
                        <th scope="col" className="px-6 py-3 text-[14px] border-r text-center">
                          {t("admin.classificationGroup")}
                        </th>
                        <th scope="col" className="px-6 py-3 text-[14px] border-r text-center">
                          {t("admin.priceDifference")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="border">
                      {product.sku_list.map((sku: any) => (
                        <tr key={sku.id}>
                          <td className="border-r">
                            <div className="flex-shrink-0 text-center font-normal">
                              {(sku.sku_code && product.product_code) ? (
                                <>{sku.sku_code} - {product.product_code}</>
                              ) : (
                                <>
                                  {sku.sku_code}
                                  {product.product_code && <span> - {product.product_code}</span>}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="border-r">
                            <div className="flex-shrink-0 text-center font-normal">
                              {sku.classify2_str && product.classify1_str ? (
                                <>{sku.classify2_str} / {product.classify1_str}</>
                              ) : (
                                <>
                                  {sku.classify2_str}
                                  {product.classify1_str && <span>/ {product.classify1_str}</span>}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="border-r">
                            <div className="flex-shrink-0 text-center font-normal">
                              {(sku.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>


      </Modal>
    </>
  );
};

export default memo(ProductList);
