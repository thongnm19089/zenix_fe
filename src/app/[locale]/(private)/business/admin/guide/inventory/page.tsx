"use client";

import { Anchor } from "antd";
import Image from "next/image";

const GuideInventory = () => {
  const { Link } = Anchor;

  return (
    <div className="flex justify-between">
      <div className="flex-1 p-4 border border-gray-300 rounded-md">
        {/* part 1 Quản lý tồn kho */}
        <div id="part-1" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý tồn kho</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“Nhập kho”</b>để thực hiện nhập thông tin
            hàng hoá được nhập kho
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/inventory/a-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b> KH thực hiện điền thông tin được yêu cầu và ấn{" "}
            <b>“Xác nhận”</b>
          </p>

          <div className="border-2 border-slate-400 w-fit">
            <Image
              src="/images/guide/inventory/a-2.png"
              alt=""
              width={600}
              height={0}
              quality={100}
            />
          </div>
        </div>
        {/* part 2 Quản lý kho hàng */}
        <div id="part-2" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý kho hàng</h2>

          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/inventory/b-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
        </div>
      </div>
      <div className="ml-8">
        <Anchor>
          <Link href="#part-1" title="Quản lý tồn kho" />
          <Link href="#part-2" title="Quản lý kho hàng" />
        </Anchor>
      </div>
    </div>
  );
};

export default GuideInventory;
