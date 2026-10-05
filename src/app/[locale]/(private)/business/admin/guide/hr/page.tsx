"use client";

import { Anchor } from "antd";
import Image from "next/image";

const GuideHR = () => {
  const { Link } = Anchor;

  return (
    <div className="flex justify-between">
      <div className="flex-1 p-4 border border-gray-300 rounded-md">
        {/* part 1 Quản lý tuyển dụng */}
        <div id="part-1" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý tuyển dụng</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“Thêm”</b> để thực hiện thêm thông tin
            tuyển dụng
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/hr/a-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b>KH điền những trường thông tin để thực hiện thêm
            thông tin về vị trí cần tuyển dụng và ấn <b>“Xác nhận”</b>
          </p>

          <div className="border-2 border-slate-400 w-fit">
            <Image
              src="/images/guide/hr/a-2.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
        </div>
        {/* part 2 Quản lý ứng viên */}
        <div id="part-2" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý ứng viên</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“Thêm”</b> để thực hiện thêm thông tin của
            các ứng viên đã ứng tuyển
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/hr/b-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b> KH thực hiện điền các trường thông tin được yêu cầu
            và ấn <b>“Xác nhận”</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/hr/b-2.png"
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
          <Link href="#part-1" title="Quản lý tuyển dụng" />
          <Link href="#part-2" title="Quản lý ứng viên" />
        </Anchor>
      </div>
    </div>
  );
};

export default GuideHR;
