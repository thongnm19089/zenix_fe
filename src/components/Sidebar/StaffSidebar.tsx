"use client";

import { setIsCollapse } from "@/features/collapseSlice";
import { AppDispatch, RootState } from "@/store/store";
import { AvailableFunctionsResponse } from "@/types/loginTypes";
import { ConfigProvider, Drawer, Menu } from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import Link from "next-intl/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  AiOutlineUserSwitch,
  AiOutlineUsergroupAdd,
} from "react-icons/ai";
import { CiCalculator1 } from "react-icons/ci";
import { FaHeadset, FaMoneyCheckAlt, FaTasks } from "react-icons/fa";
import { IoAnalyticsOutline } from "react-icons/io5";
import {
  MdAddShoppingCart,
  MdInventory,
  MdOutlineSocialDistance,
} from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import { RxDashboard } from "react-icons/rx";
import { SiGooglemarketingplatform, SiScikitlearn } from "react-icons/si";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";

interface SidebarProps {
  data: AvailableFunctionsResponse;
  isDrawer: boolean;
  setIsDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

/* ICON MAP */
const getIconForTitle = (en_title: string) => {
  const cls = "text-[18px]";
  switch (en_title) {
    case "Data Analytics":
      return <IoAnalyticsOutline className={cls} />;
    case "Branding":
      return <SiGooglemarketingplatform className={cls} />;
    case "CRM":
      return <AiOutlineUserSwitch className={cls} />;
    case "HR":
      return <AiOutlineUsergroupAdd className={cls} />;
    case "Finance":
      return <FaMoneyCheckAlt className={cls} />;
    case "Task":
      return <MdOutlineSocialDistance className={cls} />;
    case "Inventory":
      return <MdInventory className={cls} />;
    case "Procurement":
      return <MdAddShoppingCart className={cls} />;
    case "Accounting":
      return <CiCalculator1 className={cls} />;
    case "Learning":
      return <SiScikitlearn className={cls} />;
    case "Customer Service":
      return <FaHeadset className={cls} />;
    case "Project Management":
      return <FaTasks className={cls} />;
    default:
      return null;
  }
};

const StaffSidebar: React.FC<SidebarProps> = ({
  data,
  isDrawer,
  setIsDrawer,
}) => {
  const t: any = useTranslations();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [clock, setClock] = useState(
    new Date().toLocaleTimeString("vi-VN")
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString("vi-VN"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapse;
    dispatch(setIsCollapse(next));
    localStorage.setItem("sidebarCollapsed", JSON.stringify(next));
  };

  return (
    <>
      {/* DESKTOP */}
      <div className="relative h-screen flex max-md:hidden p-3">
        {/* SIDEBAR */}
        <aside
          className={`
              h-full
              ${isCollapse ? "w-20" : "w80"}
              bg-white
              border
              flex flex-col
              transition-all duration-300
              rounded-xl
              overflow-x-hidden
              overflow-y-hidden
              shadow-md
            `}
        >
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemHoverBg: "#fff3ee",
                  itemSelectedBg: "#fff3ee",
                  itemSelectedColor: "#f1692f",
                },
              },
            }}
          >
            {/* HEADER */}
            <div className="h-[72px] flex items-center justify-center gap-3 border-b">
              <Image
                src="/logo.svg"
                alt="logo"
                width={34}
                height={34}
                style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" }}
              />
              {!isCollapse && (
                <span className="text-lg font-bold text-[#f1692f]">
                  Zenix
                </span>
              )}
            </div>

            {/* CLOCK */}
            {!isCollapse && (
              <div className="text-center py-3 border-b">
                <div className="text-xl font-semibold">{clock}</div>
                <div className="text-xs text-gray-400">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}

            {/* MAIN MENU */}
            <div className="flex-1 overflow-y-auto">
              <Menu
                mode="inline"
                inlineCollapsed={isCollapse}
                openKeys={openKeys}
                onOpenChange={(keys) =>
                  setOpenKeys(keys.length ? [keys[keys.length - 1]] : [])
                }
                className="border-none"
              >
                <Menu.Item
                  key="analytics"
                  icon={<IoAnalyticsOutline />}
                  onClick={() => router.push("/business/analytics")}
                >
                  {t("functionCategory.Data Analytics")}
                </Menu.Item>

                {data?.categories?.map((cat) =>
                  cat.en_title !== "Data Analytics" ? (
                    <Menu.SubMenu
                      key={cat.en_title}
                      icon={getIconForTitle(cat.en_title)}
                      title={t(`functionCategory.${cat.en_title}`)}
                      className="pr-2"
                    >
                      {cat.detail_function_list.map((sub) => (
                        <Menu.Item
                          key={sub.link}
                          onClick={() =>
                            router.push(`/business${sub.link}`)
                          }
                          className="pr-2"
                        >
                          {t(`detailFunction.${sub.en_title}`)}
                        </Menu.Item>
                      ))}
                    </Menu.SubMenu>
                  ) : null
                )}
              </Menu>
            </div>

            {/* BOTTOM MENU */}
            <div className="border-t">
              <Menu
                mode="inline"
                inlineCollapsed={isCollapse}
                selectable={false}
                className="border-none"
              >
                <Menu.Item key="guide" icon={<RxDashboard />}>
                  <Link href="/business/">
                    {t("admin.guide")}
                  </Link>
                </Menu.Item>

                {data?.is_admin && (
                  <Menu.Item key="admin" icon={<RiAdminLine />}>
                    <Link href="/business/admin">
                      {t("admin.administrator")}
                    </Link>
                  </Menu.Item>
                )}
              </Menu>
            </div>
          </ConfigProvider>
        </aside>

        {/* TOGGLE BUTTON */}
        <button
          onClick={toggleCollapse}
          className="
            absolute top-1/2
            -translate-y-1/2
            left-full -ml-8
            w-9 h-9
            rounded-full
            bg-[#f1692f]
            text-white
            flex items-center justify-center
            shadow-lg
            hover:scale-110
            transition
            z-50
          "
        >
          {isCollapse ? (
            <HiChevronRight size={20} />
          ) : (
            <HiChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* MOBILE */}
      <Drawer
        placement="left"
        open={isDrawer}
        onClose={() => setIsDrawer(false)}
        width={280}
        bodyStyle={{ padding: 0 }}
      >
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemHoverBg: "#fff3ee",
                itemSelectedBg: "#fff3ee",
                itemSelectedColor: "#f1692f",
              },
            },
          }}
        >
          {/* HEADER */}
          <div className="h-[72px] flex items-center justify-center gap-3 border-b">
            <Image
              src="/logo.svg"
              alt="logo"
              width={34}
              height={34}
              style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" }}
            />
            <span className="text-lg font-bold text-[#f1692f]">
              Zenix
            </span>
          </div>

          {/* CLOCK */}
          <div className="text-center py-3 border-b">
            <div className="text-xl font-semibold">{clock}</div>
            <div className="text-xs text-gray-400">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          {/* MAIN MENU */}
          <div className="flex-1 overflow-y-auto">
            <Menu
              mode="inline"
              openKeys={openKeys}
              onOpenChange={(keys) =>
                setOpenKeys(keys.length ? [keys[keys.length - 1]] : [])
              }
              className="border-none"
            >
              <Menu.Item
                key="analytics"
                icon={<IoAnalyticsOutline />}
                onClick={() => {
                  router.push("/business/analytics");
                  setIsDrawer(false);
                }}
              >
                {t("functionCategory.Data Analytics")}
              </Menu.Item>

              {data?.categories?.map((cat) =>
                cat.en_title !== "Data Analytics" ? (
                  <Menu.SubMenu
                    key={cat.en_title}
                    icon={getIconForTitle(cat.en_title)}
                    title={t(`functionCategory.${cat.en_title}`)}
                    className="pr-2"
                  >
                    {cat.detail_function_list.map((sub) => (
                      <Menu.Item
                        key={sub.link}
                        onClick={() => {
                          router.push(`/business${sub.link}`);
                          setIsDrawer(false);
                        }}
                        className="pr-2"
                      >
                        {t(`detailFunction.${sub.en_title}`)}
                      </Menu.Item>
                    ))}
                  </Menu.SubMenu>
                ) : null
              )}
            </Menu>
          </div>

          {/* BOTTOM MENU */}
          <div className="border-t">
            <Menu
              mode="inline"
              selectable={false}
              className="border-none"
            >
              <Menu.Item key="guide" icon={<RxDashboard />}>
                <Link href="/business/" onClick={() => setIsDrawer(false)}>
                  {t("admin.guide")}
                </Link>
              </Menu.Item>

              {data?.is_admin && (
                <Menu.Item key="admin" icon={<RiAdminLine />}>
                  <Link href="/business/admin" onClick={() => setIsDrawer(false)}>
                    {t("admin.administrator")}
                  </Link>
                </Menu.Item>
              )}
            </Menu>
          </div>
        </ConfigProvider>
      </Drawer>
    </>
  );
};

export default StaffSidebar;
