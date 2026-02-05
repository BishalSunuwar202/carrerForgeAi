import { auth } from "@/auth"

export default auth((req) => {
  // Optional: protect API routes when required
  // const isLoggedIn = !!req.auth
  // if (req.nextUrl.pathname.startsWith("/api/protected") && !isLoggedIn) {
  //   return Response.json({ error: "Unauthorized" }, { status: 401 })
  // }
  return undefined
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
