"use client";

import { Anchor } from "antd";
import Image from "next/image";

const GuideProcurement = () => {
  const { Link } = Anchor;

  return (
    <div className="flex justify-between">
      <div className="flex-1 p-4 border border-gray-300 rounded-md">
        {/* part 1 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Danh sách sản phẩm</h2>
          <p className="text-base">
            Trước khi tạo sản phẩm, KH cần phải tạo các thông tin về{" "}
            <b>“Nhóm phân loại”</b>, <b>Sản phẩm</b>, <b>“Thương hiệu”</b> và{" "}
            <b>“Danh mục”</b>
          </p>
          <ul>
            {/* Phân loại */}
            <li id="part-1" className="text-xl font-bold">
              Nhóm phân loại
            </li>
            <p className="text-base">
              <b>Bước 1:</b> Chọn <b>“Tạo”</b> để thực hiện tạo nhóm phân loại
              cho sản phẩm
            </p>
            <div className="border-2 border-slate-400 w-fit">
              <Image
                src="/images/guide/procurement/a-1.png"
                alt=""
                height={0}
                quality={100}
                width={900}
              />
            </div>
            <p className="text-base">
              <b>Bước 2:</b> KH thực hiện điền thông tin theo yêu cầu và ấn{" "}
              <b>“Xác nhận”</b>
            </p>
            <div className="border-2 border-slate-400 w-fit">
              <Image
                src="/images/guide/procurement/a-2.png"
                alt=""
                height={0}
                quality={100}
                width={500}
              />
            </div>
            {/* Sản phẩm */}
            <li id="part-2" className="text-xl font-bold">
              Sản phẩm
            </li>
            <p className="text-base">
              <b>Bước 1:</b> Chọn <b>“Tạo sản phẩm mới”</b> để thực hiện thêm
              sản phẩm
            </p>
            <div className="border-2 border-slate-400 w-fit">
              <Image
                src="/images/guide/procurement/c-1.png"
                alt=""
                width={900}
                height={0}
                quality={100}
              />
            </div>
            <p className="text-base">
              <b>Bước 2:</b> KH thực hiện điền thông tin theo yêu cầu và ấn{" "}
              <b>“Xác nhận”</b> hoặc có thể tải lên bằng <b>file excel</b>
            </p>
            <div className="border-2 border-slate-400 w-fit">
              <Image
                src="/images/guide/procurement/c-2.png"
                alt=""
                width={900}
                height={0}
                quality={100}
              />
            </div>
            {/* Thương hiệu */}
            <li id="part-3" className="text-xl font-bold">
              Thương hiệu
            </li>
            <p className="text-base">
              <b>Bước 1:</b> Chọn <b>“Thêm thương hiệu”</b> để thực hiện tạo
              thương hiệu cho sản phẩm
            </p>
            <div className="border-2 border-slate-400 w-fit">
              <Image
                src="/images/guide/procurement/a-1.png"
                alt=""
                width={900}
                height={0}
                quality={100}
              />
            </div>
            <p className="text-base">
              <b>Bước 2:</b> KH thực hiện điền thông tin theo yêu cầu và ấn{" "}
              <b>“Xác nhận”</b>
            </p>
            <div className="border-2 border-slate-400 w-fit">
              <Image
                src="/images/guide/procurement/a-2.png"
                alt=""
                height={0}
                width={500}
                quality={100}
              />
            </div>
            {/* Danh mục */}
            <li id="part-4" className="text-xl font-bold">
              Danh mục
            </li>
            KH thực hiện tương tự
          </ul>
        </div>
      </div>
      <div className="ml-8">
        <Anchor>
          <Link href="#part-1" title="Nhóm phân loại" />
          <Link href="#part-2" title="Sản phẩm" />
          <Link href="#part-3" title="Thương hiệu" />
          <Link href="#part-4" title="Dang mục" />
        </Anchor>
      </div>
    </div>
  );
};

export default GuideProcurement;
