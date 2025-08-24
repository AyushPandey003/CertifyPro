import type React from "react"
import type { Metadata } from "next"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"
import { ourFileRouter } from "./api/uploadthing/core"
import UserProviderWrapper from "@/components/user-provider-wrapper"
import "./globals.css"

export const metadata: Metadata = {
  title: "CertifyPro - Professional Certificate & Event Pass Generator",
  description: "Create professional certificates and event passes with our intuitive drag-and-drop editor",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
  <body>
        <UserProviderWrapper>
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          {children}
        </UserProviderWrapper>
      </body>
    </html>
  )
}
