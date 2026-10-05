"use client";

import StaffSidebar from "@/components/Sidebar/StaffSidebar";
import { useAvailableFunctionsQuery } from "@/api/SetUp/apiFunction";
import StaffNavBar from "@/components/Navbar/StaffNavBar";
import { getAccessTokenFromCookie, scheduleTokenRefresh } from "@/utils/token";
import { usePathname } from "next-intl/client";
import { redirect } from "next/navigation";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

function Layout({ children }: { children: React.ReactNode }) {
  const [isDrawer, setIsDrawer] = useState(false);
  const { data: availableFunctionsData, isLoading } = useAvailableFunctionsQuery({});
  const t: any = useTranslations();

  const token = getAccessTokenFromCookie();

  useEffect(() => {
    if (token) {
      scheduleTokenRefresh();
    } else {
      redirect("/login");
    }
  }, [token]);

  const pathname = usePathname().slice(9) + "/";

  const { title, isMatch } = useMemo(() => {
    if (availableFunctionsData) {
      const functionList = availableFunctionsData?.categories?.reduce(
        (acc: any, item: any) => acc.concat(item?.detail_function_list),
        []
      );

      if (pathname.startsWith("/admin/") && availableFunctionsData?.is_admin) {
        return { title: `${t('admin.administrator')}`, isMatch: true };
      }

      for (let item of functionList) {
        if (pathname === item.link) {
          return { title: item.title, isMatch: true };
        }
      }
    }

    return { title: "", isMatch: false };
  }, [pathname]);

  return (
    <div className="flex h-full relative ">
      <div className="absolute top-0 left-0 w-full h-[250px] bg-gradient-to-b from-orange-50 to-orange-100 to-white z-0"></div>
      {availableFunctionsData && (
        <StaffSidebar data={availableFunctionsData} isDrawer={isDrawer} setIsDrawer={setIsDrawer} />
      )}
      <div className="flex-1 min-h-screen">
        <StaffNavBar title={title} setIsDrawer={setIsDrawer} />
        <div className="w-full h- full relative z-100"> {children}</div>
      </div>
    </div>
  );
}

export default React.memo(Layout);
