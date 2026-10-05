import { addToCart, decreaseQuantity, removeFromCart, updateQuantity } from "@/features/cartSlice";
import { Button, InputNumber } from "antd";
import { useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";

const ChangeQuantity = ({ product }) => {
  const dispatch = useDispatch();

  const handleDecrease = (product) => {
    if (product.quantity > 1) dispatch(decreaseQuantity({ id: product.id, skuId: product.sku.id || null }));
    else dispatch(removeFromCart({ id: product.id, skuId: product.sku.id || null }));
  };

  const handleChangeQuantity = (value) => {
    dispatch(updateQuantity({ ...product, quantity: value }));
  };

  return (
    <div className="flex items-center justify-end input-quantity">
      <Button
        shape="circle"
        className="flex items-center justify-center"
        icon={<AiOutlineMinus />}
        onClick={() => handleDecrease(product)}
      />
      <InputNumber
        value={product.quantity}
        min={1}
        className="w-12"
        onChange={handleChangeQuantity}
        bordered={false}
        boolean={false}
      />
      <Button
        type="primary"
        shape="circle"
        className="flex items-center justify-center ml-3.5"
        icon={<AiOutlinePlus />}
        color="white"
        onClick={() => {
          dispatch(
            addToCart({
              ...product,
              quantity: product.quantity + 1,
              sku: product.sku,
            })
          );
        }}
      />
    </div>
  );
};

export default ChangeQuantity;
