"use client";
import { Row, Col, Card } from "antd";
import Image from "next/image";
import React, { useEffect } from "react";
import { FaPhoneAlt, FaFacebookF, FaYoutube } from 'react-icons/fa';
import { MdChatBubble } from 'react-icons/md';

function Introduction() {
  return (
    <div>
      <div className="bg-orange-400 h-[700px] flex flex-col justify-between mb-20">
        <div className="text-center mt-20 max-w-4xl mx-auto">
          <h5 className="text-[25px] mb-4 text-white font-semibold">Không chỉ là phần mềm</h5>
          <h1 className="text-[36px] font-bold text-center leading-tight">
            Zenix cung cấp môi trường làm việc trực tuyến cho doanh nghiệp
          </h1>
        </div>
        <div className="flex justify-center">
          <Image
            src="/images/Introduction/banner.png"
            alt="banner"
            width={1200}
            height={1200}
          />
        </div>
      </div>
      <div className="my-20">
        <div className="text-center">
          <div className="text-gray-400 text-[20px]">Nền tảng bao gồm hơn 100 tính năng cao cấp</div>
          <h2 className="text-[35px] font-bold mt-7">6 Phân hệ chính</h2>
        </div>
        <div className="flex col-span-6 mx-40 gap-10 items-center justify-center">
          <div className="flex flex-col items-center justify-center rounded-lg p-4 hover:bg-orange-100 transition-all">
            <Image src="/images/Introduction/icon-work.svg" alt="Công việc" width={50} height={50} className="text-orange-500" />
            <div className="mt-2 text-lg font-bold">Công việc</div>
            <div className="text-sm text-center text-gray-500">Quản lý công việc và dự án</div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg p-4 hover:bg-yellow-100 transition-all">
            <Image src="/images/Introduction/icon-process.svg" alt="Quy trình" width={50} height={50} className="text-yellow-500" />
            <div className="mt-2 text-lg font-bold">Quy trình</div>
            <div className="text-sm text-center text-gray-500">Số và tự động hóa 100% quy trình</div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg p-4 hover:bg-red-100 transition-all">
            <Image src="/images/Introduction/icon-personnel.svg" alt="Nhân sự" width={50} height={50} className="text-red-500" />
            <div className="mt-2 text-lg font-bold">Nhân sự</div>
            <div className="text-sm text-center text-gray-500">Hồ sơ, hợp đồng bảo hiểm nhân sự</div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg p-4 hover:bg-green-100 transition-all">
            <Image src="/images/Introduction/icon-customer.svg" alt="Khách hàng" width={50} height={50} className="text-green-500" />
            <div className="mt-2 text-lg font-bold">Khách hàng</div>
            <div className="text-sm text-center text-gray-500">Lưu trữ, chăm sóc, cơ hội và chăm sóc khách hàng</div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg p-4 hover:bg-purple-100 transition-all">
            <Image src="/images/Introduction/icon-finance.svg" alt="Tài chính" width={50} height={50} className="text-purple-500" />
            <div className="mt-2 text-lg font-bold">Tài chính</div>
            <div className="text-sm text-center text-gray-500">Quản lý toàn bộ dòng tiền trong doanh nghiệp</div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg p-4 hover:bg-teal-100 transition-all">
            <Image src="/images/Introduction/icon-econtract.svg" alt="Ký số" width={50} height={50} className="text-teal-500" />
            <div className="mt-2 text-lg font-bold">Ký số</div>
            <div className="text-sm text-center text-gray-500">Quy trình tạo hồ sơ, trình và ký số</div>
          </div>
        </div>
      </div>
      <div className="mx-50 mb-20">
        <h2 className="text-center font-semibold text-[20px] mb-7">Hơn 10000 doanh nghiệp hàng đầu đã tin tưởng chúng tôi</h2>
        <div className="grid grid-cols-6 gap-4 py-4">
          <div className="flex justify-center items-center bg-white shadow-lg rounded-lg p-4">
            <Image src="/images/Introduction/sonha.svg" alt="Sonha" width={100} height={100} />
          </div>
          <div className="flex justify-center items-center bg-white shadow-lg rounded-lg p-4">
            <Image src="/images/Introduction/media.svg" alt="Media Mart" width={100} height={100} />
          </div>
          <div className="flex justify-center items-center bg-white shadow-lg rounded-lg p-4">
            <Image src="/images/Introduction/ahamove.svg" alt="Ahamove" width={100} height={100} />
          </div>
          <div className="flex justify-center items-center bg-white shadow-lg rounded-lg p-4">
            <Image src="/images/Introduction/mb.svg" alt="MB Bank" width={100} height={100} />
          </div>
          <div className="flex justify-center items-center bg-white shadow-lg rounded-lg p-4">
            <Image src="/images/Introduction/canifa.svg" alt="Canifa" width={100} height={100} />
          </div>
          <div className="flex justify-center items-center bg-white shadow-lg rounded-lg p-4">
            <Image src="/images/Introduction/yody.svg" alt="Yody" width={100} height={100} />
          </div>
        </div>
      </div>
      <div className="bg-orange-500 py-20">
        <div className="container mx-auto">
          <Row gutter={[16, 16]} className="text-white">
            <Col xs={24} md={12} lg={12}>
              <h2 className="text-3xl font-bold mb-8">Thành tựu đạt được</h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-4xl font-bold">6000+</h3>
                  <p>Khách hàng doanh nghiệp</p>
                </div>
                <div>
                  <h3 className="text-4xl font-bold">500K+</h3>
                  <p>Người dùng thường xuyên</p>
                </div>
                <div>
                  <h3 className="text-4xl font-bold">30+</h3>
                  <p>Ứng dụng thông minh</p>
                </div>
                <div>
                  <h3 className="text-4xl font-bold">200+</h3>
                  <p>Nhân sự nhiệt huyết</p>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={12} className="flex justify-center items-center">
              <Image
                src="/images/Introduction/img1.png"
                alt="Thành tựu đạt được"
                width={500}
                height={500}
              />
            </Col>
          </Row>
        </div>
      </div>
      <div className="relative mt-20">
        {/* Image Section */}
        <div className="w-full h-auto">
          <img src="/images/Introduction/mci-3.jpg" alt="Team Image" className="h-[900px] w-full" />
        </div>

        {/* Content Section with Visible Border and Reduced Height */}
        <div className="relative z-10 bg-white py-6 mx-auto max-w-7xl -mt-24 border border-gray-300 shadow-lg">
          <div className="container mx-auto text-center">
            <h2 className="text-[35px] font-bold mb-7">Giá trị và nguyên tắc cốt lõi thúc đẩy chúng tôi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <img src="/images/Introduction/icon-val-1.svg" alt="Cam kết lâu dài" className="mx-auto mb-2" />
                <h3 className="text-lg font-semibold mb-2">Cam kết lâu dài</h3>
                <p className="text-sm">8 năm xây dựng và phát triển, giúp chúng tôi hiểu rõ những thách thức mà mỗi doanh nghiệp đang phát triển phải đối mặt...</p>
              </div>
              <div>
                <img src="/images/Introduction/icon-val-2.svg" alt="Nghiên cứu và phát triển" className="mx-auto mb-2" />
                <h3 className="text-lg font-semibold mb-2">Nghiên cứu và phát triển</h3>
                <p className="text-sm">Phần mềm là sản phẩm thủ công của chúng tôi và chúng tôi đặt trái tim mình vào sản xuất với 1 triệu thành công...</p>
              </div>
              <div>
                <img src="/images/Introduction/icon-val-3.svg" alt="Khách hàng là trên hết" className="mx-auto mb-2" />
                <h3 className="text-lg font-semibold mb-2">Khách hàng là trên hết</h3>
                <p className="text-sm">Trong suốt những năm qua, chính sự tín tưởng và nhiệt tình của khách hàng đã giúp chúng tôi tạo ra giá trị bền vững...</p>
              </div>
            </div>
          </div>
        </div>
      </div>





      <div className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Truyền thông nói về chúng tôi</h2>
          <Row gutter={[16, 16]}>
            {/* Bài viết thứ nhất */}
            <Col xs={24} md={8}>
              <Card
                hoverable
                cover={
                  <Image
                    src="/images/Introduction/mci.jpg"
                    alt="STARTUP VIỆT MUỐN THU VỀ HÀNG CHỤC TRIỆU USD BẰNG PHƯƠNG THỨC..."
                    width={500}
                    height={300}
                    className="object-cover"
                  />
                }
                className="shadow-lg"
              >
                <div className="text-sm text-gray-500 mb-2">
                  23/04/2024 <span className="text-red-500">• vietnamnet</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  STARTUP VIỆT MUỐN THU VỀ HÀNG CHỤC TRIỆU USD BẰNG PHƯƠNG THỨC...
                </h3>
                <p className="text-gray-500 line-clamp-2">
                  “Chúng tôi muốn trở thành “kẻ phá bĩnh” trong thị trường SaaS đầy cạnh tranh.
                  Chúng tôi muốn hướng tới tập khách hàng muốn tìm tòi trải nghiệm mới, tận hưởng sự
                  đột phá của công nghệ”.
                </p>
              </Card>
            </Col>

            {/* Bài viết thứ hai */}
            <Col xs={24} md={8}>
              <Card
                hoverable
                cover={
                  <Image
                    src="/images/Introduction/mci.jpg"
                    alt="Vị CEO cho nhân viên nghỉ Tết từ 23 tháng Chạp: Năng suất lao động không..."
                    width={500}
                    height={300}
                    className="object-cover"
                  />
                }
                className="shadow-lg"
              >
                <div className="text-sm text-gray-500 mb-2">
                  04/02/2024 <span className="text-red-500">• Cafebiz</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Vị CEO cho nhân viên nghỉ Tết từ 23 tháng Chạp: Năng suất lao động không...
                </h3>
                <p className="text-gray-500 line-clamp-2">
                  23 Tháng Chạp là ngày làm việc cuối cùng của nhân viên 10Office trước bước vào kỳ
                  nghỉ Tết kéo dài 12 ngày, vẫn hưởng nguyên lương.
                </p>
              </Card>
            </Col>

            {/* Bài viết thứ ba */}
            <Col xs={24} md={8}>
              <Card
                hoverable
                cover={
                  <Image
                    src="/images/Introduction/mci.jpg"
                    alt="Vị CEO cho nhân viên nghỉ Tết từ 23 tháng Chạp: 12 năm khởi nghiệp không..."
                    width={500}
                    height={300}
                    className="object-cover"
                  />
                }
                className="shadow-lg"
              >
                <div className="text-sm text-gray-500 mb-2">
                  27/12/2023 <span className="text-red-500">• CafeF</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Vị CEO cho nhân viên nghỉ Tết từ 23 tháng Chạp: 12 năm khởi nghiệp không...
                </h3>
                <p className="text-gray-500 line-clamp-2">
                  Thời điểm khó khăn nhất với anh Lê Việt Thắng khi điều hành doanh nghiệp là vào năm
                  2011...
                </p>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      <div className="bg-black py-16" style={{ backgroundImage: 'url("/images/Introduction/footer-bgr.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container mx-auto text-white">
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} md={6} className="text-center">
              <div className="flex flex-col items-center">
                <FaPhoneAlt style={{ fontSize: '40px', marginBottom: '8px', color: '#fff' }} />
                <h3 className="text-xl font-bold">1900.3313</h3>
                <p className="text-gray-300">Tổng đài chăm sóc khách hàng 24/7 <br />(8h00 - 17h30)</p>
              </div>
            </Col>
            <Col xs={24} md={6} className="text-center">
              <div className="flex flex-col items-center">
                <MdChatBubble style={{ fontSize: '40px', marginBottom: '8px', color: '#fff' }} />
                <h3 className="text-xl font-bold">0834.838.888</h3>
                <p className="text-gray-300">Tư vấn sản phẩm live chat hỗ trợ nhanh và hiệu quả nhất</p>
              </div>
            </Col>
            <Col xs={24} md={6} className="text-center">
              <div className="flex flex-col items-center">
                <FaFacebookF style={{ fontSize: '40px', marginBottom: '8px', color: '#fff' }} />
                <h3 className="text-xl font-bold">Facebook Fanpage</h3>
                <p className="text-gray-300">Phản hồi khách hàng nhanh chóng qua Facebook</p>
              </div>
            </Col>
            <Col xs={24} md={6} className="text-center">
              <div className="flex flex-col items-center">
                <FaYoutube style={{ fontSize: '40px', marginBottom: '8px', color: '#fff' }} />
                <h3 className="text-xl font-bold">Youtube Channel</h3>
                <p className="text-gray-300">Cập nhật trực quan cách sử dụng phần mềm 10Office</p>
              </div>
            </Col>
          </Row>
        </div>
      </div>

    </div>
  );
}

export default Introduction;
