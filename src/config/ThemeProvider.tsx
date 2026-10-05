"use client";

import { AntdProvider } from "./AntdProvider";
import { defaultLocale, languages } from "@/locale";
import { ConfigProvider, theme } from "antd";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { useTheme } from "next-themes";
import { PropsWithChildren, useEffect, useState } from "react";

export type ProviderProps = PropsWithChildren<{
  locale: string;
}>;

export function AntdConfigProvider({ children, locale }: ProviderProps) {
  const { theme: nowTheme } = useTheme();

  return (
    <ConfigProvider
      locale={(languages as any)[(locale as any) ?? defaultLocale].antd}
      theme={{
        algorithm: nowTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <AntdProvider>{children}</AntdProvider>
    </ConfigProvider>
  );
}

export default function ThemeProvider(props: ProviderProps) {
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // use your loading page
    return <div className="hidden">{props.children}</div>;
  }

  return (
    <NextThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <AntdConfigProvider {...props} />
    </NextThemeProvider>
  );
}
