"use client";

import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import PasswordReset from "../../../components/Auth/ResetEmail";
import { useUserLoginMutation } from "@/api/SetUp/apiLogin";
import { column } from "@/constants/columnData";
import { setIsAuth } from "@/features/authSlice";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from 'axios';
function RequestEmail() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [userLogin, { isLoading }] = useUserLoginMutation();
    const [errorLogin, setErrorLogin] = useState<string | null>(null);

    return (
        <div className="bg-[#172b4d] relative ">
            <div className="bg-gradient-login trapezoid absolute top-0 right-0 left-0 "></div>

            <div className="flex flex-col justify-center items-center gap-16 h-screen overflow-y-hidden">
                <PasswordReset />
                <div className="flex justify-center gap-10 text-white font-semibold">
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
            <RequestEmail />
        </GoogleOAuthProvider>
    );
}
