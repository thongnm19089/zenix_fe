"use client";

import { useAvailableFunctionsQuery } from "@/api/SetUp/apiFunction";
import { setIsAuth } from "@/features/authSlice";
import { deleteCookie } from "cookies-next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaCheck, FaUser } from "react-icons/fa";
import { RxArrowTopRight } from "react-icons/rx";
import { useDispatch } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";

export default function WelcomeZenix() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: availableFunctionsData } = useAvailableFunctionsQuery<any>({});
  const [data, setData] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    if (availableFunctionsData?.categories?.length) {
      const first = availableFunctionsData.categories[0];
      setData(first.detail_function_list);
      setActiveId(first.id);
    }
  }, [availableFunctionsData]);

  const logout = () => {
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    sessionStorage.clear();
    dispatch(setIsAuth(false));
    router.push("/login");
  };

  const getImage = (title: string) => {
    const map: any = {
      "Data Analytics": "data",
      Branding: "brand",
      CRM: "crm",
      HR: "hr",
      Finance: "f88",
      Task: "task",
      Inventory: "kho1",
      Procurement: "cung-ung",
      Accounting: "ktnb",
      Learning: "ctv",
      "Customer Service": "cung-ung",
      "Project Management": "task",
    };
    return `/images/services/${map[title] || "default"}.png`;
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f6f6] text-gray-800 flex flex-col">
      {/* HEADER - Optimized for mobile */}
      <header className="w-full px-4 pt-4 md:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo and Brand */}
            <div className="flex items-start md:items-center gap-3">
              <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
                <Image
                  src="/logo.svg"
                  alt="Zenix Business Logo"
                  fill
                  className="object-contain"
                  style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" }}
                  priority
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-[#f1692f] leading-tight">
                  Zenix Business
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-4">
                  All-in-one Business Platform
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <Link
                href="/business/profile"
                className="hover:text-[#f1692f] transition-colors"
              >
                Hồ sơ cá nhân
              </Link>
              <Link
                href="/business"
                className="hover:text-[#f1692f] transition-colors"
              >
                Hướng dẫn
              </Link>
              <button
                onClick={logout}
                className="hover:text-red-500 transition-colors"
              >
                Đăng xuất
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - Optimized layout */}
      <main className="flex-1 w-full px-4 md:px-6 py-6 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 md:gap-10 ">
            {/* LEFT PANEL - Function List */}
            <div className="w-full bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg order-2 lg:order-1">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-[#f1692f] text-center">
                  {data?.[0]?.category_str || "Chức năng"}
                </h2>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Chọn chức năng để bắt đầu
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {data?.map((item, index) => (
                  <Link
                    key={index}
                    href={`/business${item.link}`}
                    className="
                      flex items-center gap-3
                      px-4 py-3 rounded-xl
                      bg-gray-50 hover:bg-[#f1692f]/10
                      active:bg-[#f1692f]/20
                      transition-all duration-200
                      border border-transparent hover:border-[#f1692f]/20
                    "
                  >
                    <FaCheck className="text-[#f1692f] flex-shrink-0" />
                    <span className="font-medium text-sm md:text-base truncate">
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL - Category Swiper */}
            <div className="w-full order-1 lg:order-2">
              <div className="mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                  Danh mục chức năng
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Chọn danh mục để xem các chức năng chi tiết
                </p>
              </div>

              <div className="relative">
                <Swiper
                  freeMode
                  modules={[FreeMode]}
                  breakpoints={{
                    320: {
                      slidesPerView: 1.2,
                      spaceBetween: 12
                    },
                    480: {
                      slidesPerView: 1.8,
                      spaceBetween: 16
                    },
                    640: {
                      slidesPerView: 2.5,
                      spaceBetween: 16
                    },
                    768: {
                      slidesPerView: 3,
                      spaceBetween: 20
                    },
                    1024: {
                      slidesPerView: 4,
                      spaceBetween: 24
                    },
                  }}
                  className="w-full pb-4"
                >
                  {availableFunctionsData?.categories?.map((item: any) => (
                    <SwiperSlide key={item.id} className="h-auto">
                      <div
                        onClick={() => {
                          setData(item.detail_function_list);
                          setActiveId(item.id);
                        }}
                        className={`
                          group relative rounded-2xl p-5 h-full min-h-[180px] md:min-h-[190px]
                          bg-white shadow-md hover:shadow-lg
                          transition-all duration-300 cursor-pointer
                          flex flex-col justify-between
                          ${activeId === item.id
                            ? "ring-2 ring-[#f1692f] shadow-lg"
                            : "hover:ring-1 hover:ring-[#f1692f]/30"
                          }
                        `}
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                            {item.title}
                          </h3>
                          <RxArrowTopRight
                            className="
                              mt-3 w-5 h-5
                              text-gray-400
                              group-hover:text-[#f1692f]
                              group-hover:rotate-45 transition-transform
                            "
                          />
                        </div>

                        <div className="relative mt-4 h-24">
                          <Image
                            src={getImage(item.en_title)}
                            alt={item.title}
                            fill
                            className="
                              object-contain object-center
                              transition-transform duration-300
                              group-hover:scale-110
                            "
                            sizes="(max-width: 768px) 100px, 120px"
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE FOOTER NAVIGATION - Enhanced for mobile */}
      <footer className="md:hidden w-full px-4 py-4 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-around">
            <Link
              href="/business/profile"
              className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-[#f1692f]/5 active:bg-[#f1692f]/10 transition-colors"
            >
              <FaUser className="w-5 h-5 text-gray-600" />
              <span className="text-xs font-medium">Hồ sơ</span>
            </Link>

            <Link
              href="/business"
              className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-[#f1692f]/5 active:bg-[#f1692f]/10 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs font-medium">Hướng dẫn</span>
            </Link>

            <button
              onClick={logout}
              className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs font-medium text-red-500">Đăng xuất</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}