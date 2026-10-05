import { defaultLocale, languages } from "./locale";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

export default createMiddleware({
  // A list of all locales that are supported
  locales: Object.keys(languages),

  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale,
});

export const config = {
  // Skip all paths that aren't pages that you'd like to internationalize
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

// import { defaultLocale, languages } from "./locale";
// import { locale } from "dayjs";
// import createMiddleware from "next-intl/middleware";
// // import { NextResponse } from "next/server";
// import { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// const initMiddleware = createMiddleware({
//   // A list of all locales that are supported
//   locales: Object.keys(languages),

//   // If this locale is matched, pathnames work without a prefix (e.g. /about)
//   defaultLocale,
// });
// export default async function middleware(request: NextRequest) {
//   // kiểm tra xem có token trong cookie không
//   const cookie = request.cookies.get("access_token")?.value;
//   const url = request.nextUrl.clone();
//   if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/")) {
//     return; // Tiếp tục mà không thực hiện gì thêm
//   }
//   if (cookie === undefined && !url.pathname.endsWith("/login")) {
//     url.pathname = "/login/";
//     console.log("cookie", cookie);
//     return NextResponse.redirect(url);
//   }

//   if (cookie !== undefined && !url.pathname.endsWith("/welcome")) {
//     url.pathname = "/welcome/";
//     return NextResponse.redirect(url);
//   }

//   // nêu có token thì cho phép truy cập vào trang welcome

//   return initMiddleware(request);
// }

// export const config = {
//   // Skip all paths that aren't pages that you'd like to internationalize
//   matcher: ["/((?!api|_next|.*\\..*).*)"],
// };
