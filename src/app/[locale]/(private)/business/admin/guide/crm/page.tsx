"use client";

import { Anchor } from "antd";
import Image from "next/image";

const GuideCRM = () => {
  const { Link } = Anchor;

  return (
    <div className="flex justify-between">
      <div className="flex-1 p-4 border border-gray-300 rounded-md">
        {/* part 1 Quản lý Marketing */}
        <div id="part-1" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý Marketing</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“Thêm”</b> để thực hiện thêm thông tin
            khách hàng
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/crm/a-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b> KH thực hiện điền các trường thông tin được yêu cầu
            và ấn <b>"Xác nhận"</b>
          </p>
          <p className="text-base">
            <i>
              (Các trường thông tin có dấu “*” là trường thông tin bắt buộc)
            </i>
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              src="/images/guide/crm/a-2.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
        </div>
        {/* part 2 Quản lý tư vấn bán hàng */}
        <div id="part-2" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý tư vấn bán hàng</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH click vào khung bên phải tên khách hàng thuộc cột
            trạng thái và thực hiện thêm trạng thái, gắn tag tương ứng
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/crm/b-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b> KH thực hiện điền các trường thông tin được yêu cầu
            và ấn <b>"Xác nhận"</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/crm/b-2.png"
              alt=""
              width={600}
              height={0}
              quality={100}
            />
          </div>
        </div>
        {/* part 3 Quản lý đơn hàng */}
        <div id="part-3" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“Tạo đơn”</b> để thực hiện tạo đơn hàng
            cho khách hàng
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/crm/c-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b> KH thực hiện điền các trường thông tin được yêu cầu
            và ấn <b>“Lên đơn”</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/crm/c-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
        </div>
        {/* part 4 Quản lý công nợ bán hàng */}
        <div id="part-4" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý công nợ bán hàng</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“Thanh toán công nợ”</b> để thực hiện điền
            số tiền khách đã thanh toán
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/crm/d-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b> KH thực hiện điền các trường thông tin được yêu cầu
            và ấn <b>“Đồng ý”</b>, <b>“Thanh toán ngay”</b> hoặc{" "}
            <b>“Dự kiến thanh toán”</b> nếu khách hàng hẹn thanh toán
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              src="/images/guide/crm/d-2.png"
              alt=""
              width={600}
              height={0}
              quality={100}
            />
          </div>
        </div>
      </div>
      <div className="ml-8">
        <Anchor>
          <Link href="#part-1" title="Quản lý Marketing" />
          <Link href="#part-2" title="Tư vấn bán hàng" />
          <Link href="#part-3" title="Quản lý đơn hàng" />
          <Link href="#part-4" title="Công nợ bán hàng" />
        </Anchor>
      </div>
    </div>
  );
};

export default GuideCRM;
