"use client";
import { Button } from "antd";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import React, { useEffect } from "react";

function Instruction() {
  const router = useRouter();

  return (
    <div>
      <div
        className="relative bg-cover bg-center p-8 h-[550px]"
        style={{
          backgroundImage: "url('/images/instruction/anh-device.png')",
        }}
      >
        <div className="container mx-auto flex flex-col lg:flex-row items-center relative z-10">
          {/* Left section with text */}
          <div className="lg:w-1/2 text-left">
            <h1 className="text-white font-bold text-[40px] mt-26 mb-12">
              <span className="bg-orange-500 text-white px-4 py-2 rounded-lg">ZENIX</span>
            </h1>
            <h2 className="text-white text-3xl md:text-5xl font-semibold mb-4">Ứng dụng bàn làm việc</h2>
            <p className="text-white text-base md:text-lg mb-12">
              1.500+ doanh nghiệp ứng dụng, 30.000+ người dùng hàng ngày
            </p>
            <div>
              <Button
                type="primary"
                size="large"
                className="bg-orange-600 hover:bg-white hover:text-orange-600"
                onClick={() => router.push('/payment')}
              >
                ĐĂNG KÝ NGAY
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2"></div>
        </div>
      </div>
      <div className="container mx-auto flex flex-col lg:flex-row items-center py-20 px-4">
        <div className="lg:w-1/2 flex justify-center lg:justify-start">
          <Image
            src="/images/instruction/cskh-db.png"
            alt="Product Dashboard"
            width={600}
            height={400}
            className="object-contain"
          />
        </div>

        <div className="container mx-auto flex flex-col items-center text-center py-12 px-4">
          <h2 className="text-orange-600 text-3xl md:text-4xl font-semibold mb-4">Giới thiệu</h2>
          <div className="w-12 h-1 bg-gray-300 mb-4"></div>

          <div className="max-w-2xl text-gray-800 text-lg md:text-xl">
            <p className="text-gray-600">
              <span className="font-semibold">Phần mềm quản lý lịch biểu</span> là công cụ giúp quản lý chi tiết toàn bộ sự kiện, công việc của một cá nhân theo ngày, tuần, tháng... Căn cứ vào lịch biểu, cả quản lý và nhân viên có thể dễ dàng theo dõi và có kế hoạch thực hiện công việc một cách khoa học.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 py-12">
        <div className="text-center mb-6">
          <h2 className="text-orange-600 text-3xl md:text-4xl font-semibold mb-2">Quản trị khách hàng</h2>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-1 bg-orange-300"></div>
          </div>
        </div>
        <div className="container mx-auto flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src="/images/instruction/view-shedule.png"
                alt="Calendar Icon"
                className="w-10 h-10 text-orange-500"
                style={{ filter: 'invert(33%) sepia(99%) saturate(3722%) hue-rotate(197deg) brightness(99%) contrast(104%)' }}
              />
              <p className="text-gray-700 text-xl mt-4">Quản lý khách hàng</p>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src="/images/instruction/overtime-1.png"
                alt="Marketing Icon"
                className="w-10 h-10 text-orange-500"
                style={{ filter: 'invert(33%) sepia(99%) saturate(3722%) hue-rotate(197deg) brightness(99%) contrast(104%)' }}
              />
              <p className="text-gray-700 text-xl mt-4">Quản lý marketing</p>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src="/images/instruction/icon-line-13-1.png"
                alt="Order Icon"
                className="w-10 h-10 text-orange-500"
                style={{ filter: 'invert(33%) sepia(99%) saturate(3722%) hue-rotate(197deg) brightness(99%) contrast(104%)' }}
              />
              <p className="text-gray-700 text-xl mt-4">Quản lý đơn hàng</p>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src="/images/instruction/icon-line-24.png"
                alt="Debt Icon"
                className="w-10 h-10 text-orange-500"
                style={{ filter: 'invert(33%) sepia(99%) saturate(3722%) hue-rotate(197deg) brightness(99%) contrast(104%)' }}
              />
              <p className="text-gray-700 text-xl mt-4">Quản lý công nợ bán hàng</p>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src="/images/instruction/to-do.png"
                alt="Consulting Icon"
                className="w-10 h-10 text-orange-500"
                style={{ filter: 'invert(33%) sepia(99%) saturate(3722%) hue-rotate(197deg) brightness(99%) contrast(104%)' }}
              />
              <p className="text-gray-700 text-xl mt-4">Quản lý tư vấn bán hàng</p>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src="/images/instruction/to-do.png"
                alt="Consulting Icon"
                className="w-10 h-10 text-orange-500"
                style={{ filter: 'invert(33%) sepia(99%) saturate(3722%) hue-rotate(197deg) brightness(99%) contrast(104%)' }}
              />
              <p className="text-gray-700 text-xl mt-4">Quản lý báo giá</p>
            </div>
          </div>

          <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center lg:justify-end">
            <Image
              src="/images/guide/admin/a-1.png"
              alt="Customer Management Dashboard"
              width={600}
              height={400}
              className="object-contain"
            />
          </div>
        </div>
      </div>
      <div className="py-20 bg-gradient-to-b from-orange-50 to-orange-100">
        <div className="text-center mb-6">
          <h2 className="text-orange-600 text-3xl md:text-4xl font-semibold mb-2">Quản trị nhân sự</h2>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-1 bg-orange-300"></div>
          </div>
        </div>

        <div className="container mx-auto flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center lg:justify-start">
            <Image
              src="/images/instruction/cskh-db.png"
              alt="Scheduler Dashboard"
              width={600}
              height={400}
              className="object-contain"
            />
          </div>

          <div className="lg:w-1/2 space-y-6 lg:pl-12 text-left">
            <div className="flex items-center space-x-4">
              <img src="/images/instruction/icon-line-13-1.png" alt="Plan Icon" className="w-10 h-10 text-blue-500"
                style={{ filter: 'invert(33%) sepia(99%) saturate(3722%) hue-rotate(197deg) brightness(99%) contrast(104%)' }} />
              <p className="text-gray-700 text-xl mt-4">Quản lý tuyển dụng</p>
            </div>
            <div className="flex items-center space-x-4">
              <img src="/images/instruction/to-do.png" alt="Meeting Icon" className="w-10 h-10 text-blue-500"
                style={{ filter: 'invert(33%) sepia(99%) saturate(3722%) hue-rotate(197deg) brightness(99%) contrast(104%)' }} />
              <p className="text-gray-700 text-xl mt-4">Quản lý ứng viên</p>
            </div>
            <div className="flex items-center space-x-4">
              <img src="/images/instruction/icon-line-24.png" alt="Holiday Icon" className="w-10 h-10 text-blue-500"
                style={{ filter: 'invert(33%) sepia(99%) saturate(3722%) hue-rotate(197deg) brightness(99%) contrast(104%)' }} />
              <p className="text-gray-700 text-xl mt-4">Quản lý KPI</p>
            </div>
            <div className="flex items-center space-x-4">
              <img src="/images/instruction/overtime-1.png" alt="Work Icon" className="w-10 h-10 text-blue-500"
                style={{ filter: 'invert(33%) sepia(99%) saturate(3722%) hue-rotate(197deg) brightness(99%) contrast(104%)' }} />
              <p className="text-gray-700 text-xl mt-4">Hồ sơ nhân sự</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-orange-200 to-orange-300 py-16">
        <div className="text-center mb-12">
          <h2 className="text-white text-5xl font-bold mb-6">Kế toán nội bộ</h2>
          <p className="text-white text-lg">Hệ thống quản lý hiệu quả các hoạt động tài chính nội bộ của doanh nghiệp</p>
        </div>

        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white shadow-md rounded-xl p-8 hover:shadow-xl transition duration-300 ease-in-out">
            <img src="/images/instruction/view-shedule.png" alt="Revenue Icon" className="w-20 h-20 mx-auto mb-6" />
            <h3 className="text-2xl text-center font-semibold text-orange-600">Quản lý doanh thu</h3>
            <p className="text-gray-500 text-center mt-4">Giám sát doanh thu của công ty một cách hiệu quả và chính xác.</p>
          </div>

          <div className="bg-white shadow-md rounded-xl p-8 hover:shadow-xl transition duration-300 ease-in-out">
            <img src="/images/instruction/overtime-1.png" alt="Expense Icon" className="w-20 h-20 mx-auto mb-6" />
            <h3 className="text-2xl text-center font-semibold text-orange-600">Quản lý chi phí</h3>
            <p className="text-gray-500 text-center mt-4">Quản lý chi phí dễ dàng và theo dõi các khoản chi tiêu trong doanh nghiệp.</p>
          </div>

          <div className="bg-white shadow-md rounded-xl p-8 hover:shadow-xl transition duration-300 ease-in-out">
            <img src="/images/instruction/icon-line-13-1.png" alt="Debt Management Icon" className="w-20 h-20 mx-auto mb-6" />
            <h3 className="text-2xl text-center font-semibold text-orange-600">Quản lý công nợ</h3>
            <p className="text-gray-500 text-center mt-4">Giúp theo dõi các khoản nợ và công việc quản lý dễ dàng hơn.</p>
          </div>

          <div className="bg-white shadow-md rounded-xl p-8 hover:shadow-xl transition duration-300 ease-in-out">
            <img src="/images/instruction/icon-line-24.png" alt="Invoice Icon" className="w-20 h-20 mx-auto mb-6" />
            <h3 className="text-2xl text-center font-semibold text-orange-600">Hóa đơn đầu vào</h3>
            <p className="text-gray-500 text-center mt-4">Theo dõi và quản lý hóa đơn đầu vào dễ dàng, nhanh chóng.</p>
          </div>

          <div className="bg-white shadow-md rounded-xl p-8 hover:shadow-xl transition duration-300 ease-in-out">
            <img src="/images/instruction/to-do.png" alt="Outgoing Invoice Icon" className="w-20 h-20 mx-auto mb-6" />
            <h3 className="text-2xl text-center font-semibold text-orange-600">Hóa đơn đầu ra</h3>
            <p className="text-gray-500 text-center mt-4">Quản lý hóa đơn đầu ra một cách chính xác và kịp thời.</p>
          </div>

          <div className="bg-white shadow-md rounded-xl p-8 hover:shadow-xl transition duration-300 ease-in-out">
            <img src="/images/instruction/to-do.png" alt="Order Management Icon" className="w-20 h-20 mx-auto mb-6" />
            <h3 className="text-2xl text-center font-semibold text-orange-600">Quản lý đơn hàng</h3>
            <p className="text-gray-500 text-center mt-4">Tối ưu hóa quy trình xử lý và quản lý đơn hàng.</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-purple-300 to-orange-500 py-20">
        <div className="text-center mb-12">
          <h2 className="text-white text-6xl font-bold mb-6">Phân tích dữ liệu</h2>
          <p className="text-gray-300 text-lg">Giải pháp phân tích dữ liệu chuyên sâu, hỗ trợ ra quyết định dựa trên số liệu thực tế.</p>
        </div>

        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition duration-300 ease-in-out">
            <img src="/images/instruction/icon-line-13-1.png" alt="Supply Chain Analysis Icon" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-600 text-center">Phân tích cung ứng</h3>
            <p className="text-gray-600 mt-4 text-center">Phân tích dữ liệu nhà cung cấp và vận hành chuỗi cung ứng để tối ưu hóa quá trình.</p>
            <div className="mt-6 bg-gray-100 p-4 w-full text-center rounded-md">
              <span className="text-3xl font-bold text-indigo-600">90%</span>
              <p className="text-gray-600">Tối ưu hóa chi phí cung ứng</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition duration-300 ease-in-out">
            <img src="/images/instruction/to-do.png" alt="Company Analysis Icon" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-600 text-center">Phân tích công ty</h3>
            <p className="text-gray-600 mt-4 text-center">Phân tích toàn diện về các chỉ số hiệu suất và hoạt động kinh doanh.</p>
            <div className="mt-6 bg-gray-100 p-4 w-full text-center rounded-md">
              <span className="text-3xl font-bold text-indigo-600">75%</span>
              <p className="text-gray-600">Hiệu suất hoạt động tăng trưởng</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition duration-300 ease-in-out">
            <img src="/images/instruction/icon-line-24.png" alt="Sales Analysis Icon" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-600 text-center">Phân tích bán hàng</h3>
            <p className="text-gray-600 mt-4 text-center">Theo dõi doanh thu và phân tích các yếu tố ảnh hưởng đến doanh số.</p>
            <div className="mt-6 bg-gray-100 p-4 w-full text-center rounded-md">
              <span className="text-3xl font-bold text-indigo-600">50%</span>
              <p className="text-gray-600">Doanh thu tăng trưởng hàng năm</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition duration-300 ease-in-out">
            <img src="/images/instruction/overtime-1.png" alt="Marketing Analysis Icon" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-600 text-center">Phân tích marketing</h3>
            <p className="text-gray-600 mt-4 text-center">Đánh giá chiến lược tiếp thị và hiệu quả chiến dịch.</p>
            <div className="mt-6 bg-gray-100 p-4 w-full text-center rounded-md">
              <span className="text-3xl font-bold text-indigo-600">30%</span>
              <p className="text-gray-600">Tăng trưởng khách hàng qua chiến dịch</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition duration-300 ease-in-out">
            <img src="/images/instruction/to-do.png" alt="Inventory Analysis Icon" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-600 text-center">Phân tích tồn kho</h3>
            <p className="text-gray-600 mt-4 text-center">Phân tích dữ liệu tồn kho để quản lý hàng hóa hiệu quả và giảm thiểu lãng phí.</p>
            <div className="mt-6 bg-gray-100 p-4 w-full text-center rounded-md">
              <span className="text-3xl font-bold text-indigo-600">85%</span>
              <p className="text-gray-600">Tồn kho giảm thiểu lãng phí</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition duration-300 ease-in-out">
            <img src="/images/instruction/to-do.png" alt="Product Analysis Icon" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-600 text-center">Phân tích sản phẩm</h3>
            <p className="text-gray-600 mt-4 text-center">Phân tích dữ liệu sản phẩm để tối ưu hóa chất lượng và sự hài lòng của khách hàng.</p>
            <div className="mt-6 bg-gray-100 p-4 w-full text-center rounded-md">
              <span className="text-3xl font-bold text-indigo-600">60%</span>
              <p className="text-gray-600">Tăng cường chất lượng sản phẩm</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition duration-300 ease-in-out">
            <img src="/images/instruction/to-do.png" alt="Financial Analysis Icon" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-600 text-center">Phân tích tài chính</h3>
            <p className="text-gray-600 mt-4 text-center">Theo dõi và đánh giá hiệu suất tài chính của doanh nghiệp.</p>
            <div className="mt-6 bg-gray-100 p-4 w-full text-center rounded-md">
              <span className="text-3xl font-bold text-indigo-600">70%</span>
              <p className="text-gray-600">Tăng trưởng tài chính hàng năm</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition duration-300 ease-in-out">
            <img src="/images/instruction/to-do.png" alt="Customer Analysis Icon" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-600 text-center">Phân tích khách hàng</h3>
            <p className="text-gray-600 mt-4 text-center">Phân tích hành vi và xu hướng của khách hàng để tối ưu hóa chiến lược bán hàng.</p>
            <div className="mt-6 bg-gray-100 p-4 w-full text-center rounded-md">
              <span className="text-3xl font-bold text-indigo-600">40%</span>
              <p className="text-gray-600">Tăng cường sự hài lòng khách hàng</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition duration-300 ease-in-out">
            <img src="/images/instruction/to-do.png" alt="HR Analysis Icon" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-600 text-center">Phân tích nhân sự</h3>
            <p className="text-gray-600 mt-4 text-center">Phân tích dữ liệu nhân sự để cải thiện hiệu suất và quản lý nhân sự hiệu quả.</p>
            <div className="mt-6 bg-gray-100 p-4 w-full text-center rounded-md">
              <span className="text-3xl font-bold text-indigo-600">65%</span>
              <p className="text-gray-600">Cải thiện hiệu suất nhân viên</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition duration-300 ease-in-out">
            <img src="/images/instruction/to-do.png" alt="Work Analysis Icon" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-600 text-center">Phân tích công việc</h3>
            <p className="text-gray-600 mt-4 text-center">Đánh giá và quản lý hiệu suất công việc dựa trên các chỉ số cụ thể.</p>
            <div className="mt-6 bg-gray-100 p-4 w-full text-center rounded-md">
              <span className="text-3xl font-bold text-indigo-600">55%</span>
              <p className="text-gray-600">Hiệu suất công việc tăng lên</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition duration-300 ease-in-out">
            <img src="/images/instruction/to-do.png" alt="Training Analysis Icon" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-indigo-600 text-center">Phân tích đào tạo</h3>
            <p className="text-gray-600 mt-4 text-center">Đánh giá hiệu quả các chương trình đào tạo và phát triển nhân lực.</p>
            <div className="mt-6 bg-gray-100 p-4 w-full text-center rounded-md">
              <span className="text-3xl font-bold text-indigo-600">80%</span>
              <p className="text-gray-600">Hiệu quả đào tạo nhân viên</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 py-20">
        <div className="text-center mb-12">
          <h2 className="text-white text-6xl font-bold mb-4">Quản trị cung ứng</h2>
          <p className="text-gray-300 text-lg">Hệ thống quản lý cung ứng hiện đại, giúp doanh nghiệp tối ưu hoá quy trình mua sắm và quản lý nhà cung cấp</p>
        </div>

        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 transform rotate-6">
          <div className="bg-white shadow-lg rounded-lg p-8 transform -rotate-6 hover:rotate-0 transition duration-300 ease-in-out">
            <img src="/images/instruction/icon-line-13-1.png" alt="Warehouse Management Icon" className="w-28 h-28 mx-auto mb-6" />
            <h3 className="text-3xl text-center font-semibold text-indigo-600">Danh sách nhà cung cấp</h3>
            <p className="text-gray-600 text-center mt-4">Quản lý và theo dõi thông tin chi tiết về các nhà cung cấp, đảm bảo hiệu quả trong chuỗi cung ứng.</p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8 transform -rotate-6 hover:rotate-0 transition duration-300 ease-in-out">
            <img src="/images/instruction/to-do.png" alt="Stock Transaction Icon" className="w-28 h-28 mx-auto mb-6" />
            <h3 className="text-3xl text-center font-semibold text-indigo-600">Danh sách sản phẩm</h3>
            <p className="text-gray-600 text-center mt-4">Quản lý danh sách sản phẩm chi tiết, dễ dàng theo dõi tình trạng hàng hóa trong kho.</p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8 transform -rotate-6 hover:rotate-0 transition duration-300 ease-in-out">
            <img src="/images/instruction/icon-line-24.png" alt="Warehouse Entry Icon" className="w-28 h-28 mx-auto mb-6" />
            <h3 className="text-3xl text-center font-semibold text-indigo-600">Công nợ nhà cung cấp</h3>
            <p className="text-gray-600 text-center mt-4">Theo dõi công nợ với các nhà cung cấp, đảm bảo các giao dịch thanh toán minh bạch và chính xác.</p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8 transform -rotate-6 hover:rotate-0 transition duration-300 ease-in-out">
            <img src="/images/instruction/overtime-1.png" alt="Warehouse Exit Icon" className="w-28 h-28 mx-auto mb-6" />
            <h3 className="text-3xl text-center font-semibold text-indigo-600">Quản lý mua hàng</h3>
            <p className="text-gray-600 text-center mt-4">Quản lý quy trình mua hàng hiệu quả, từ việc đặt hàng đến nhận hàng, đảm bảo cung ứng kịp thời.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Instruction;
