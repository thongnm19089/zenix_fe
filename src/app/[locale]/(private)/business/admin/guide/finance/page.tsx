"use client";

import { Anchor } from "antd";
import Image from "next/image";

const GuideFinance = () => {
  const { Link } = Anchor;

  return (
    <div className="flex justify-between">
      <div className="flex-1 p-4 border border-gray-300 rounded-md">
        {/* part 1 */}
        <div id="part-1" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“In”</b> để thực hiện in hoá đơn
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/finance/a-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b>KH có thể chỉnh sửa thông tin trước khi tiến hành in
            hoá đơn
          </p>

          <div className="border-2 border-slate-400 w-fit">
            <Image
              src="/images/guide/finance/a-2.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
        </div>
        {/* part 2*/}
        <div id="part-2" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý chi phí</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“Thêm chi phí”</b> để thực hiện thêm các
            mục chi phí
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/finance/b-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b>KH thực hiện điền thông tin theo yêu cầu và ấn{" "}
            <b>“Xác nhận”</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/finance/b-2.png"
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
          <Link href="#part-1" title="Quản lý đơn hàng" />
          <Link href="#part-2" title="Quản lý chi phí" />
        </Anchor>
      </div>
    </div>
  );
};

export default GuideFinance;
