import { selectCart, updateCart } from "@/features/cartSlice";
import { RootState } from "@/store/store";
import { Button, Form, InputNumber, Select } from "antd";
import React, { useEffect, useState } from "react";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

function TaxForm({
  taxListType,
  productId,
  skuId,
  totalPriceProduct,
  cartItems,
}: {
  taxListType: any;
  productId: number;
  skuId: any;
  totalPriceProduct: number;
  cartItems: any;
}) {
  const dispatch = useDispatch();

  const [selectedTax, SetSelectedTax] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<number[]>([]);
  const [taxList, setTaxList] = useState<any[]>([]);
  const handleSelectChange = (index: number, value: string) => {
    SetSelectedTax((prev) => {
      const newSelected = [...prev];
      newSelected[index] = value;
      return newSelected;
    });
  };
  const [formTax] = Form.useForm();

  const handleFormChange = (_: any, allValues: any) => {
    const transformedValues = allValues.tax_list
      .filter((item: any) => item && typeof item === "object")
      .filter((item: any) => item.tax_type || item.amount)
      .map((item: any) => {
        const amount = item.amount !== undefined ? totalPriceProduct * (item.amount / 100) : 0;
        return { ...item, amount };
      })
      .filter((item: any) => item.tax_type);
    setTaxList(transformedValues);

    setAmounts(transformedValues.map((item: { amount: number }) => item.amount));
  };

  useEffect(() => {
    dispatch(
      updateCart({
        id: productId,
        skuId: skuId || null,
        tax_list: taxList,
      })
    );
  }, [taxList, cartItems]);

  return (
    <Form form={formTax} onValuesChange={handleFormChange}>
      <Form.List name="tax_list">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <div className="flex items-center gap-2 px-2 py-1">
                <IoIosRemoveCircleOutline onClick={() => remove(name)} />
                <div className="w-52">
                  <Form.Item {...restField} name={[name, "amount"]} noStyle>
                    <InputNumber
                      addonBefore={
                        <Form.Item {...restField} name={[name, "tax_type"]} noStyle>
                          <Select
                            placeholder="Chọn loại phí"
                            onChange={(e) => handleSelectChange(index, e)}
                            value={selectedTax[index]}
                            className=" w-32"
                          >
                            {taxListType
                              .filter((tax: any) => !selectedTax.includes(tax.id) || tax.id === selectedTax[index])
                              .map((tax: any) => (
                                <Select.Option key={tax.id} value={tax.id}>
                                  {tax.title}
                                </Select.Option>
                              ))}
                          </Select>
                        </Form.Item>
                      }
                      addonAfter="%"
                      defaultValue={0}
                    />
                  </Form.Item>
                </div>

                <div>{amounts[index]}</div>
              </div>
            ))}

            {taxListType.length > fields.length && (
              <Button type="dashed" onClick={() => add()} block>
                + Thêm thuế
              </Button>
            )}
          </>
        )}
      </Form.List>
    </Form>
  );
}

export default TaxForm;
