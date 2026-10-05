"use client";

import { Anchor } from "antd";
import Image from "next/image";

const GuideAdmin = () => {
  const { Link } = Anchor;

  return (
    <div className="flex justify-between">
      <div className="flex-1 p-4 border border-gray-300 rounded-md">
        <h1 className="text-3xl font-bold">Quản trị viên</h1>

        {/* part 1 */}
        <div id="part-1" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý công ty</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“Thông tin công ty”</b> để thực hiện thêm
            thông tin chung cho công ty
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src={"/images/guide/admin/a-1.png"}
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
          <p className="text-base mt-4">
            <b>Bước 2: </b>KH thực hiện điền các thông tin được yêu cầu, đối với
            các trường thông tin tối màu KH không thể thay đổi được vì đã được
            setup từ đầu, sau đó KH ấn <b>“Lưu lại”</b>
          </p>

          <div className="border-2 border-slate-400 w-fit">
            <Image
              src="/images/guide/admin/a-2.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
          <p className="text-base mt-4">
            <b>Bước 3: </b>KH chọn <b>“Phòng ban”</b> và chọn{" "}
            <b>“Thêm phòng ban”</b> để thực hiện thêm thông tin chung cho công
            ty
          </p>

          <div className="border-2 border-slate-400 w-fit">
            <Image
              src="/images/guide/admin/a-3.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
          <p className="text-base mt-4">
            <b>Bước 4: </b>KH thực hiện điền thông tin được yêu cầu và ấn{" "}
            <b>“Xác nhận”</b>
          </p>

          <div className="border-2 border-slate-400 w-fit">
            <Image
              src="/images/guide/admin/a-4.png"
              alt=""
              width={600}
              height={0}
              quality={100}
            />
          </div>
          <p className="text-base mt-4">
            <b>Bước 5: </b>Đối với <b>“Địa điểm”</b> và <b>“Chi nhánh”</b> cũng
            sẽ tương tự như <b>“Phòng ban”</b>
          </p>
        </div>
        {/* part 2*/}
        <div id="part-2" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“Thêm nhân viên”</b> để thực hiện thêm tài
            khoản nhân viên sử dụng
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/b-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b>KH thực hiện điền thông tin nhân viên theo các mục
            được yêu cầu và phân quyền cho n
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/b-2.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
        </div>
        {/* part 3*/}
        <div id="part-3" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý tài chính</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“Chi phí”</b> để thực hiện thêm các hạng
            mục chi phí
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/c-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b>KH điền các thông tin theo yêu cầu và ấn{" "}
            <b>“Xác nhận”</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/c-2.png"
              alt=""
              width={600}
              height={0}
              quality={100}
            />
          </div>
        </div>
        {/* part 4*/}
        <div id="part-4" className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý quan hệ khách hàng</h2>
          <p className="text-base">
            <b>Bước 1: </b>KH chọn <b>“Cấu hình liên lạc”</b>, tại{" "}
            <b>“Trạng thái tư vấn”</b> và chọn <b>“Tạo mới”</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/d-1.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 2: </b>KH điền thông tin trạng thái liên hệ, chọn màu sắc
            đại diện và ấn <b>“Xác nhận”</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/d-2.png"
              alt=""
              width={600}
              height={0}
              quality={100}
            />
          </div>

          <p className="text-base mt-4">
            <b>Bước 3: </b>KH chọn <b>“Nguồn khách hàng”</b> và chọn{" "}
            <b>“Tạo mới”</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/d-3.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
          <p className="text-base mt-4">
            <b>Bước 4: </b>KH điền thông tin các nguồn khách hàng của công ty,
            chọn màu sắc và ấn <b>“Xác nhận”</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/d-4.png"
              alt=""
              width={600}
              height={0}
              quality={100}
            />
          </div>
          <p className="text-base mt-4">
            <b>Bước 5: </b>KH chọn <b>“Các loại liên hệ chính</b> và chọn{" "}
            <b>“Tạo mới”</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/d-5.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
          <p className="text-base mt-4">
            <b>Bước 6: </b>KH điền kiểu liên hệ chính mà KH áp dụng
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/d-6.png  "
              alt=""
              width={600}
              height={0}
              quality={100}
            />
          </div>
          <p className="text-base mt-4">
            <b>Bước 7: </b>KH chọn <b>“Trạng thái đơn hàng”</b> và chọn{" "}
            <b>“Tạo mới”</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/d-7.png"
              alt=""
              width={900}
              height={0}
              quality={100}
            />
          </div>
          <p className="text-base mt-4">
            <b>Bước 8: </b>KH điền trạng thái liên hệ mà công ty tư vấn cho
            khách hàng và ấn <b>“Xác nhận”</b>
          </p>
          <div className="border-2 border-gray-400 w-fit">
            <Image
              src="/images/guide/admin/d-8.png"
              alt=""
              width={600}
              height={0}
              quality={100}
            />
          </div>
        </div>
      </div>
      <div className="ml-8">
        <Anchor >
          <Link href="#part-1" title="Quản lý công ty" />
          <Link href="#part-2" title="Quản lý người dùng" />
          <Link href="#part-3" title="Quản lý tài chính" />
          <Link href="#part-4" title="Quản lý quan hệ khách hàng" />
        </Anchor>
      </div>
    </div>
  );
};

export default GuideAdmin;
