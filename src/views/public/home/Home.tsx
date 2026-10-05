"use client";

import { getCookie } from "cookies-next";
import { useRouter } from "next-intl/client";
import React, { useEffect } from "react";

function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("access_token");
    if (token) {
      router.push("/business/profile");
    } else {
      router.push("/login");
    }
  }, [router]);
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>

        {/* loading screen */}
        <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-orange-500 animate-spin"></div> 
      </div>
    </div>
  );
}

export default Home;
