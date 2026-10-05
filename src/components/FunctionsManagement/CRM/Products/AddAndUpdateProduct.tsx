"use client";

import {
  useCreateMultiProductMutation,
  useCreateProductMutation,
  useEditProductMutation,
  useGetBrandListQuery,
  useGetCategoryListQuery,
  useGetClassifyListsQuery,
  useGetProductQuery,
} from "@/api/Procurement/apiProducts";
import BreadcrumbDetail from "@/components/Breadcrumb/BreadcrumbDetail";
import ModalDialog from "@/components/ModalDialog/ModalDialog";
import UploadImage from "@/components/Upload/UploadImage";
import { dowloadFileExcel } from "@/constants/excelFile/dowloadFileExcel";
import { PRODUCT_EXCEL_FILE } from "@/constants/excelFile/productExcelFile";
import { Button, Col, Collapse, Form, Input, InputNumber, Row, Select, Tabs, notification } from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { SiMicrosoftexcel } from "react-icons/si";
import * as XLSX from "xlsx";

const { Option } = Select;

interface DataType {
  id: number;
  title: string;
  skuList: SkuList[];
}

interface SkuList {
  id: number;
  title: string;
}

interface Category {
  id: number;
  category_name: string;
  // thêm các thuộc tính khác nếu cần
}

interface Brand {
  id: number;
  brand_name: string;
  // thêm các thuộc tính khác nếu cần
}

interface Classify {
  id: number;
  title: string;
}

interface Item {
  id: number;
  title: string;
  classify_list: Classify[];
}

interface SKU {
  classify1?: number;
  classify2?: number;
  price?: number;
  code_sku?: string;
}

interface Product {
  product_code: string;
  product_name: string;
  product_description: string;
  category: number;
  brand: number;
  base_price: number;
  specifications: string;
  unit_of_measure: string;
}

interface ApiSuccessResponse {
  data: {
    products_created?: any; // Assuming this is a number
    errors?: any; // Replace 'any' with a more specific type if possible
  };
}

const AddAndUpdateProduct = ({ productId }: { productId: number | undefined }) => {
  const t: any = useTranslations();
  const items = [
    {
      key: "1",
      label: "Nhập thông tin",
      children: <EnterInformation productId={productId} />,
    },
    {
      key: "2",
      label: t("noficationAddAndUpdate.uploadUsingExcel"), 
      children: <UploadByExcel productId={productId} />,
    },
  ];
  return (
    <>
      <BreadcrumbDetail
        title={t("noficationAddAndUpdate.addNewProduct")}
        pageName={t("nav.products")}
        pageLink="/business/procurement/product-list"
        functionName={t("admin.administrator")}
      />
      {productId ? <EnterInformation productId={productId} /> : <Tabs defaultActiveKey="1" items={items} />}
    </>
  );
};

export default AddAndUpdateProduct;

const EnterInformation = ({ productId }: { productId: number | undefined }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const t: any = useTranslations();

  const [classifyTwoList, SetClassifyTwoList] = useState<DataType[]>([]);
  const [classifyOne, SetClassifyOne] = useState<SkuList[]>([]);
  const [classifyTwo, SetClassifyTwo] = useState<SkuList[]>([]);
  const [fieldsClassify, setFieldsClassify] = useState(1);
  const [imageFile, setImageFile] = useState<any>(null);
  console.log(imageFile)

  const { data: brandList } = useGetBrandListQuery();
  const { data: categoryList } = useGetCategoryListQuery();
  const { data: classifyListList } = useGetClassifyListsQuery();
  const { data: productData } = useGetProductQuery(
    { productId: productId },
    {
      skip: productId ? false : true,
    }
  );

  const [createProduct, { isLoading: isLoadingAdd }] = useCreateProductMutation();
  const [editProduct, { isLoading: isLoadingEdit }] = useEditProductMutation();

  const apiToSkuData = (classifyListList: any) => {
    return classifyListList?.results.map((item: any) => ({
      id: item.id,
      title: item.title,
      skuList: item.classify_list.map((classify: any) => ({
        id: classify.id,
        title: classify.title,
      })),
    }));
  };

  const skuData = apiToSkuData(classifyListList);

  useEffect(() => {
    if (productData) {
      if (productData?.sku_list?.length > 0) {
        SetClassifyTwoList(skuData);
        SetClassifyOne(
          skuData?.filter((item: { id: any }) => item.id === productData?.classify_list_list[0]?.id)[0]?.skuList
        );
        SetClassifyTwo(
          skuData?.filter((item: { id: any }) => item.id === productData?.classify_list_list[1]?.id)[0]?.skuList
        );
      }
      form.setFieldsValue({
        product_name: productData?.product_name,
        product_code: productData?.product_code,
        brand: productData?.brand,
        category: productData?.category,
        base_price: productData?.base_price,
        product_description: productData.product_description,
        specifications: productData?.specifications,
        unit_of_measure: productData?.unit_of_measure,
        classify1_list: productData?.sku_list.length > 0 ? productData?.classify_list_list[0]?.id : null,
        classify2_list: productData?.sku_list.length > 0 ? productData?.classify_list_list[1]?.id : null,
        sku_list: productData?.sku_list?.map(
          (item: { classify1: string; classify2: string; price: number; sku_code: string }) => {
            return {
              classify1: item.classify1,
              classify2: item.classify2,
              price: item.price,
              code_sku: item.sku_code,
            };
          }
        ),
      });
    }
  }, [productData]);
  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("product_name", values.product_name);
      formData.append("product_code", values.product_code);
      formData.append("product_description", values.product_description);
      formData.append("category", (values.category || "").toString());
      formData.append("brand", (values.brand || "").toString());
      formData.append("base_price", values.base_price || 0);
      formData.append("specifications", values.specifications);
      formData.append("unit_of_measure", values.unit_of_measure);
      if (imageFile && imageFile.length) {
        imageFile.forEach((file: any) => {
          formData.append(`product_images`, file.originFileObj);
        });
      }

      if (values.sku_list && Array.isArray(values.sku_list)) {
        values.sku_list.forEach((sku: SKU, index: any) => {
          if (sku.code_sku) formData.append(`sku[${index}][code_sku]`, sku.code_sku);
          if (typeof sku.price === "number") formData.append(`sku[${index}][price]`, sku.price.toString());
          else formData.append(`sku[${index}][price]`, "0");
          if (sku.classify1) formData.append(`sku[${index}][classify1]`, (sku.classify1 || "").toString());
          if (sku.classify2) formData.append(`sku[${index}][classify2]`, (sku.classify2 || "").toString());
          // Và bất kỳ thuộc tính nào khác của SKU bạn muốn thêm
        });
      }

      if (productId) {
        const result = await editProduct({ formData, productId });
        notification.success({
          message: `${t("noficationAddAndUpdate.editApplicationSuccess")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        const result = await createProduct(formData);
        notification.success({
          message: `${t("noficationAddAndUpdate.moreSuccess")}`,
          placement: "bottomRight",
          className: "h-16",
        });
        form.resetFields();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeCollapse = (value: any) => {
    if (productData && productData.sku_list.length > 0) {
      SetClassifyTwoList(skuData);
      SetClassifyOne(
        skuData?.filter((item: { id: any }) => item.id === productData.classify_list_list[0]?.id)[0]?.skuList
      );
      SetClassifyTwo(
        skuData?.filter((item: { id: any }) => item.id === productData.classify_list_list[1]?.id)[0]?.skuList
      );
    } else {
      SetClassifyTwoList([]);
      SetClassifyOne([]);
      SetClassifyTwo([]);
    }
  };

  const onChangeClassifytOneList = (value: any) => {
    SetClassifyTwoList(skuData?.filter((item: { id: any }) => item.id !== value));
    SetClassifyOne(skuData?.filter((item: { id: any }) => item.id === value)[0]?.skuList);
  };

  const onChangeClassifyTwoList = (value: any) => {
    SetClassifyTwo(classifyTwoList?.filter((item) => item.id === value)[0]?.skuList);
  };

  // Define an interface for your expected API response structure

  return (
    <div className="shadow-md py-6 px-7 border border-white rounded-lg">
      <Form name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off" form={form}>
        <Form.Item
          style={{ padding: "0px 16px" }}
          label={t("admin.imageProduct")}
          name="image_list"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 21 }}
        >
          <UploadImage setImageFile={setImageFile} imageList={productData?.image_list} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              style={{ padding: "0px 16px" }}
              name="product_name"
              label={t("admin.productName")}
              rules={[
                {
                  required: true,
                  message: `${t("noficationAddAndUpdate.fillProductName")}`,
                },
              ]}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              style={{ padding: "0px 16px" }}
              name="product_code"
              label="Mã sản phẩm"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              style={{ padding: "0px 16px" }}
              name="category"
              label={t("table.categories")}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              rules={[
                {
                  required: true,
                  message: `${t("noficationAddAndUpdate.selectACategory")}`,
                },
              ]}
            >
              <Select placeholder={t("hr.selectCategory")} allowClear>
                {categoryList?.results.map((category: Category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.category_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              style={{ padding: "0px 16px" }}
              name="brand"
              label={t("admin.brand")}
              rules={[
                {
                  required: true,
                  message: `${t("admin.pleaseChooseABrand")}`,
                },
              ]} // Thêm dòng này
            >
              <Select placeholder={t("admin.chooseBrand")} allowClear>
                {brandList?.results.map((brand: Brand) => (
                  <Select.Option key={brand.id} value={brand.id}>
                    {brand.brand_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          style={{ padding: "0px 16px" }}
          name="product_description"
          label={t("verticalValues.desc")}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 21 }}
          initialValue=""
        >
          <Input.TextArea />
        </Form.Item>

        {/* cột 3 */}
        <Row style={{ padding: "0px 16px" }} gutter={12}>
          <Col span={8}>
            <Form.Item
              name="base_price"
              label={t("admin.basicPrice")}
              className="mb-1"
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 16 }}
              required
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                defaultValue={0}
                controls={false}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="specifications"
              label={t("admin.specifications")}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="unit_of_measure" label={t("admin.unit")} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        {/* thêm nhóm phân loại */}
        <Collapse
          className="mb-4 p-0"
          ghost
          bordered
          onChange={onChangeCollapse}
          items={[
            {
              key: "1",
              label: <div className="text-red-500 font-semibold">{t("noficationAddAndUpdate.addTaxonomyGroup")}</div>,
              children: (
                <>
                  <Form.Item label={t("noficationAddAndUpdate.productGroup")}></Form.Item>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item name="classify1_list">
                        <Select
                          placeholder={t("admin.classification1")}
                          allowClear
                          onChange={onChangeClassifytOneList}
                          disabled={fieldsClassify > 1 && true}
                        >
                          {skuData?.map((item: Item) => (
                            <Option key={item.id} value={item.id}>
                              {item.title}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="classify2_list">
                        <Select
                          placeholder={t("admin.classification2")}
                          allowClear
                          onChange={onChangeClassifyTwoList}
                          disabled={fieldsClassify > 1 && true}
                        >
                          {classifyTwoList?.map((item) => (
                            <Option key={item.id} value={item.id}>
                              {item.title}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  {classifyOne && classifyOne.length > 0 && (
                    <Form.List
                      name="sku_list"
                      initialValue={[
                        {
                          classify1: "",
                          classify2: "",
                          price: 0,
                          code_sku: "",
                        },
                      ]}
                    >
                      {(fields, { add, remove }) => {
                        setFieldsClassify(fields.length);
                        return (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <>
                                <Row gutter={24} align="middle">
                                  <Col span={11}>
                                    <Form.Item
                                      label={t("admin.classification1")}
                                      {...restField}
                                      name={[name, "classify1"]}
                                      labelCol={{ span: 8 }}
                                      wrapperCol={{ span: 16 }}
                                    >
                                      <Select placeholder={t("admin.group1")} allowClear>
                                        {classifyOne.map((item) => (
                                          <Option key={item.id} value={item.id}>
                                            {item.title}
                                          </Option>
                                        ))}
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  {classifyTwo?.length > 0 && (
                                    <Col span={11}>
                                      <Form.Item
                                        style={{ width: "100%" }}
                                        {...restField}
                                        name={[name, "classify2"]}
                                        label={t("admin.classification2")}
                                        labelCol={{ span: 8 }}
                                        wrapperCol={{ span: 16 }}
                                      >
                                        <Select placeholder={t("admin.group1")} allowClear>
                                          {classifyTwo.map((item) => (
                                            <Option key={item.id} value={item.id}>
                                              {item.title}
                                            </Option>
                                          ))}
                                        </Select>
                                      </Form.Item>
                                    </Col>
                                  )}
                                </Row>
                                <Row gutter={24} align="middle">
                                  <Col span={11}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "price"]}
                                      label={t("crm.price")}
                                      labelCol={{ span: 8 }}
                                      wrapperCol={{ span: 16 }}
                                    >
                                      <InputNumber
                                        style={{ width: "100%" }}
                                        defaultValue={0}
                                        controls={false}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                        parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={11}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "code_sku"]}
                                      label={t("admin.sKUCode")}
                                      style={{
                                        width: "100%",
                                        marginBottom: "10px",
                                      }}
                                      rules={[
                                        {
                                          required: true,
                                          message: t("admin.pleaseSKUode"),
                                        },
                                      ]}
                                      labelCol={{ span: 8 }}
                                      wrapperCol={{ span: 16 }}
                                    >
                                      <Input />
                                    </Form.Item>
                                  </Col>
                                  <Col span={2}>
                                    {fields.length > 1 && (
                                      <div style={{ textAlign: "center" }}>
                                        <p
                                          onClick={() => {
                                            remove(name), setFieldsClassify(fields.length);
                                          }}
                                          className="text-red-600 font-semibold cursor-pointer hover:underline"
                                        >
                                          {" "}
                                          Xóa{" "}
                                        </p>
                                      </div>
                                    )}
                                  </Col>
                                </Row>
                              </>
                            ))}
                            <Form.Item>
                              <Button
                                className="mt-2"
                                type="dashed"
                                onClick={() => {
                                  add(), setFieldsClassify(fields.length);
                                }}
                                block
                              >
                                {t("admin.moreOptions")}
                              </Button>
                            </Form.Item>
                          </>
                        );
                      }}
                    </Form.List>
                  )}
                </>
              ),
            },
          ]}
        />
      </Form>

      <div className="flex justify-center gap-5">
        <Button
          className="w-30"
          type="primary"
          htmlType="submit"
          onClick={() => {
            form.submit();
          }}
          loading={isLoadingAdd || isLoadingEdit}
        >
          {t("general.confirm")}
        </Button>
        <Button className="w-30" onClick={() => router.replace("/business/procurement/product-list")}>
          {t("crm.comeBack")}
        </Button>
      </div>
    </div>
  );
};

const UploadByExcel = ({ productId }: { productId: number | undefined }) => {
  const router = useRouter();
  const t: any = useTranslations();
  const [fileData, setFileData] = useState<{ name: string }>();
  const [productsExcel, setProductsExcel] = useState<Product[]>([]);
  const [modalDialog, setModalDialog] = useState({
    open: false,
    success: [],
    error: [],
  });
  const [createMultiProduct, { isLoading: isLoadingAddMulti }] = useCreateMultiProductMutation();
  const handleChangeFile = () => {
    const inputFile = document.getElementById("file");
    inputFile?.click();
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    setFileData(file);
    if (file) {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parseData = XLSX.utils.sheet_to_json(sheet);
        parseData?.forEach((item: any) => {
          const newProduct = {
            product_code: item?.product_code,
            product_name: item?.product_name,
            product_description: item?.product_description,
            category: item?.category ? item.category : 1,
            brand: item?.brand ? item.brand : 1,
            base_price: item?.base_price,
            specifications: item?.specifications,
            unit_of_measure: item?.unit_of_measure,
          };
          setProductsExcel((productsExcel) => [...productsExcel, newProduct]);
        });
      };
    }
  };

  const createByExcelFile = async (data: Product[]) => {
    if (data) {
      try {
        const result = (await createMultiProduct(data)) as ApiSuccessResponse;
        setModalDialog({
          ...modalDialog,
          open: true,
          success: result?.data?.products_created,
          error: result?.data?.errors,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <div>
      {!productId && (
        <>
          <div className="flex justify-center items-center w-100%  mb-2">
            <Input
              id="file"
              hidden
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              onClick={(e: any) => (e.target.value = "")}
            />
            <SiMicrosoftexcel onClick={handleChangeFile} fill="green" size={60} cursor={"pointer"} />
          </div>
        </>
      )}

      {!productId && (
        <div className="flex w-100% justify-center mb-2">
          {!fileData ? (
            <div>Không có file nào được tải lên</div>
          ) : (
            <div className="flex justify-center items-center">
              <div>{fileData.name}</div>
              <IoIosCloseCircleOutline
                className="cursor-pointer ml-1"
                onClick={() => setFileData(undefined)}
                size={20}
              />
            </div>
          )}
        </div>
      )}
      <div
        className="cursor-pointer underline italic text-primary text-center"
        onClick={() => dowloadFileExcel(PRODUCT_EXCEL_FILE, "Mẫu-thông-tin-sản-phẩm.xlsx")}
      >
        (Tải về file mẫu)
      </div>
      <ModalDialog
        open={modalDialog.open}
        setOpen={(value) => setModalDialog({ ...modalDialog, open: value })}
        success={modalDialog.success}
        error={modalDialog.error}
        object_str="Các sản phẩm"
      />

      <div className="flex justify-center gap-3 mt-4">
        <Button
          className="w-30"
          type="primary"
          htmlType="submit"
          onClick={() => createByExcelFile(productsExcel)}
          loading={isLoadingAddMulti}
          disabled={fileData ? false : true}
        >
          Tải lên
        </Button>
        <Button className="w-30" onClick={() => router.replace("/business/procurement/product-list")}>
          {t("crm.comeBack")}
        </Button>
      </div>
    </div>
  );
};
