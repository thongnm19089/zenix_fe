"use client";

import { Anchor } from "antd";
import Image from "next/image";

const GuideTask = () => {
  const { Link } = Anchor;

  return (
    <div className="flex justify-between">
      <div className="flex-1 p-4 border border-gray-300 rounded-md">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Quản lý công việc</h2>
          {/* part 1 */}
          <p id="part-1" className="text-base">
            <b>Bước 1: Quản lý công việc ={">"} Vào Bảng công việc</b>
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              alt=""
              width={900}
              height={0}
              quality={100}
              src="/images/guide/task/b1.png"
            />
          </div>
          <p className="text-base mt-4">
            Bạn sẽ tạo mới các bảng làm việc tại{" "}
            <b>Không gian làm việc của bạn</b>{" "}
            <b>Không gian làm việc của khách</b> là các bảng làm việc do người
            khác tạo và <b>add</b> bạn vào
          </p>
          {/* part 2 */}
          <p id="part-2" className="text-base">
            <b>Bước 2: Tạo mới</b>
          </p>
          <p className="text-base">
            Tạo tên cho bảng công việc Add tất cả những thành viên có liên quan
            đến công việc đó vào bảng
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              alt=""
              width={600}
              height={0}
              quality={100}
              src="/images/guide/task/b2.png"
            />
          </div>
          <p className="text-base mt-4">
            Bạn sẽ tạo mới các bảng làm việc tại{" "}
            <b>Không gian làm việc của bạn</b>
            <b>Không gian làm việc của khách</b> là các bảng làm việc do người
            khác tạo và <b>add</b> bạn vào
          </p>
          {/* part 3 */}
          <p id="part-3" className="text-base mt-4">
            <b>Bước 3: Thêm, sửa/xoá thành viên</b>
          </p>
          <p className="text-base mt-4">
            Sau khi tạo xong nếu muốn <b>add</b> thêm thành viên hoặc <b>xóa</b>
            , <b>sửa</b> bảng công việc thì bấm vào dấu 3 chấm
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              alt=""
              width={900}
              height={0}
              quality={100}
              src="/images/guide/task/b3.png"
            />
          </div>
          {/* part 4 */}
          <p id="part-4" className="text-base mt-4">
            <b>Bước 4: Mở bảng công việc ra</b>
          </p>
          <p className="text-base mt-4">
            Chọn <b>Thêm danh sách:</b> Đặt tên danh sách -{">"} <b>Add</b>
            Thêm các thẻ (đầu mục công việc) trong danh sách đó
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              alt=""
              width={900}
              height={0}
              quality={100}
              src="/images/guide/task/b4.png"
            />
          </div>
          {/* part 5 */}
          <p id="part-5" className="text-base mt-4">
            <b>Bước 5: Mở các thẻ ra</b>
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              alt=""
              width={900}
              height={0}
              quality={100}
              src="/images/guide/task/b5-1.png"
            />
          </div>
          <p className="text-base mt-4">
            Giao công việc đó cho thành viên nào thì bạn bấm vào{" "}
            <b>Thành viên</b> và tích chọn tên người đó
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              alt=""
              width={900}
              height={0}
              quality={100}
              src="/images/guide/task/b5-2.png"
            />
          </div>
          <p className="text-base mt-4">
            Gán nhãn cho công việc bằng cách chọn <b>Nhãn</b> (có thể theo phòng
            ban hoặc mức độ ưu tiên)
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              alt=""
              width={900}
              height={0}
              quality={100}
              src="/images/guide/task/b5-3.png"
            />
          </div>
          <p className="text-base mt-4">
            Ở phần <b>checklist</b>: bạn sẽ liệt kê các công việc cần làm trong
            thẻ làm việc này, sau khi làm xong công việc nào{" "}
            <b>bấm tích xanh vào ô vuông ở đầu mục</b>, hệ thống sẽ tự động hiển
            thị % hoàn thành công việc của nhân viên để quản lý dễ dàng nắm bắt
            và đánh giá.
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              alt=""
              width={900}
              height={0}
              quality={100}
              src="/images/guide/task/b5-4.png"
            />
          </div>
          <p className="text-base mt-4">
            Thêm ngày đến hạn deadline bằng cách bấm vào <b>Ngày</b>
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              alt=""
              width={900}
              height={0}
              quality={100}
              src="/images/guide/task/b5-5.png"
            />
          </div>
          <p className="text-base mt-4">
            Có thể thêm mô tả chi tiết công việc để nhân viên hiểu rõ hơn
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              alt=""
              width={900}
              height={0}
              quality={100}
              src="/images/guide/task/b5-6.png"
            />
          </div>
          <p className="text-base mt-4">
            Nếu có file đính kèm hoặc hình ảnh liên quan đến công việc đang làm
            sẽ tải lên để lưu trữ và người khác cũng có thể xem được giúp công
            việc thuận tiện hơn
          </p>
          <div className="border-2 border-slate-400 w-fit">
            <Image
              alt=""
              width={900}
              height={0}
              quality={100}
              src="/images/guide/task/b5-7.png"
            />
          </div>
          <p className="text-base mt-4">
            Có thể comment xuống dưới để phàn hồi về công việc được giao.
          </p>
        </div>
      </div>
      <div className="ml-8">
        <Anchor>
          <Link href="#part-1" title="Bước 1" />
          <Link href="#part-2" title="Bước 2" />
          <Link href="#part-3" title="Bước 3" />
          <Link href="#part-4" title="Bước 4" />
          <Link href="#part-5" title="Bước 5" />
        </Anchor>
      </div>
    </div>
  );
};

export default GuideTask;
