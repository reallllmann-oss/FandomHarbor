import {
  createServerAuthProvider,
  type AuthCookieMutation,
} from "@fandom-harbor/auth";
import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const auth = createServerAuthProvider(readPublicRuntimeConfig(), {
    getAll: () => request.cookies.getAll(),
    setAll(mutations: AuthCookieMutation[]) {
      for (const { name, options, value } of mutations) {
        request.cookies.set(name, value);
        response = NextResponse.next({ request });
        response.cookies.set(name, value, options);
      }
    },
  });

  await auth.getSession();
  response.headers.set("x-fandom-harbor-surface", "web");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
