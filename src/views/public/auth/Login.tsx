"use client";

import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import LoginForm from "../../../components/Auth/LoginForm";
import { useUserLoginMutation } from "@/api/SetUp/apiLogin";
import { column } from "@/constants/columnData";
import { setIsAuth } from "@/features/authSlice";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from 'axios';
import { Button } from 'antd';

function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [userLogin, { isLoading }] = useUserLoginMutation();
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  const onChangeInput = () => {
    setErrorLogin(null);
  };

  const onFinish = async (values: any) => {
    try {
      const result = await userLogin({
        username: values.username,
        password: values.password,
      });
      if ("data" in result) {
        handleLoginSuccess(result.data);
      } else if ("error" in result) {
        const errorDetail = result as unknown as {
          error: { data: { detail: string } };
        };
        setErrorLogin(errorDetail.error.data?.detail || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error("Failed to login", err);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        // Gọi Google UserInfo API để lấy thông tin người dùng
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`
          }
        });

        const userInfo = userInfoResponse.data;
        console.log(userInfo); // Kiểm tra thông tin người dùng

        const result = await userLogin({
          provider: "google",
          uid: userInfo.sub, // Sử dụng 'sub' làm UID từ Google
          token: tokenResponse.access_token,
          extra_data: {
            email: userInfo.email,
            name: userInfo.name
          },
        });

        if ("data" in result) {
          handleLoginSuccess(result.data);
        } else if ("error" in result) {
          const errorDetail = result as unknown as {
            error: { data: { detail: string } };
          };
          setErrorLogin(errorDetail.error.data?.detail || "Có lỗi xảy ra");
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        setErrorLogin("Failed to retrieve user profile");
      }
    },
    onError: error => {
      console.error("Google login failed", error);
      setErrorLogin("Google login failed");
    }
  });

  const onGoogleLogin = () => {
    googleLogin();
  };

  const handleLoginSuccess = (data: any) => {
    setCookie("access_token", data.access_token, {
      maxAge: 3 * 24 * 60 * 60, // 3 ngày
      path: "/",
    });
    setCookie("refresh_token", data.refresh_token, {
      maxAge: 7 * 24 * 60 * 60, // 7 ngày
      path: "/",
    });
    setCookie("NEXT_LOCALE", data.user.user_profile.language);
    localStorage.setItem("user", JSON.stringify(data.user));
    const storedColumn = localStorage.getItem("column");
    if (!storedColumn) {
      localStorage.setItem("column", JSON.stringify(column));
    }

    dispatch(setIsAuth(true));
    const language = data.user.user_profile?.language || "vi";
    router.push(`/${language}/welcome`);
  };

  return (
    <div className="bg-[#2d1810] relative ">
      <div className="bg-gradient-orange trapezoid absolute top-0 right-0 left-0 "></div>

      <div className="flex flex-col justify-center items-center gap-16 h-screen overflow-y-hidden">
        <LoginForm
          onFinish={onFinish}
          error={errorLogin}
          onChangeInput={onChangeInput}
          loading={isLoading}
          onGoogleLogin={onGoogleLogin} // Truyền hàm xử lý đăng nhập Google
        />
        <div className="flex justify-center gap-10 text-white font-semibold items-center">

          <div>Support</div>
          <div>Terms of Use</div>
          <div>Blog</div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <GoogleOAuthProvider clientId="575960613940-j1vt07o084g9i8179pds5i9083gm8b0h.apps.googleusercontent.com">
      <Login />
    </GoogleOAuthProvider>
  );
}
