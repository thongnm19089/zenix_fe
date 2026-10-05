"use client";

import { useUpdateProfileMutation } from "@/api/SetUp/apiAccount";
import { languages } from "@/locale";
import { Avatar, Dropdown, notification } from "antd";
import { usePathname } from "next-intl/client";
import Link from "next-intl/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { setCookie } from "cookies-next";

export default function LocaleSwitcher({ edit }: { edit?: boolean }) {
  const pathname = usePathname();
  const params = useParams();
  const [flag, setFlag] = useState(params?.locale === "vi" ? "VN" : "US");

  const [updateProfile, { isLoading: isLoadingEdit }] =
    useUpdateProfileMutation();

  const updateLanguage = async (lang: string) => {
    try {
      const result = await updateProfile({
        language: lang,
      });
      if (result && "error" in result) {
        notification.error({
          message: `Cập nhật ngôn ngữ thất bại`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        localStorage.setItem("user", JSON.stringify(result?.data));
        setCookie("NEXT_LOCALE", lang);
        notification.success({
          message: `Cập nhật ngôn ngữ thành công`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dropdown
      menu={{
        items: Object.entries(languages).map(([lang, setting]) => ({
          key: lang,
          label: (
            <Link
              href={pathname ?? "/"}
              locale={lang}
              onClick={() => {
                setFlag(setting.flag);
                if (edit) {
                  updateLanguage(lang);
                }
              }}
            >
              <Avatar src={`/images/${setting.flag}-logo.png`} size={23} />
              &nbsp; <span className="font-bold">{setting.name}</span>
            </Link>
          ),
        })),
      }}
    >
      {/* <Icons.Languages className="h-5 w-5" /> */}

      <div className="max-md:h-[34px]  max-md:w-[34px] flex justify-center border border-white items-center hover:bg-primary/50 max-md:rounded-full md:px-2 md:py-1 md:rounded-md">
        <Avatar src={`/images/${flag}-logo.png`} size={22} />{" "}
        <div className="max-md:hidden font-semibold text-xs mx-2">
          {flag === "US" ? "English" : "Việt Nam"}
        </div>
      </div>
    </Dropdown>
  );
}
