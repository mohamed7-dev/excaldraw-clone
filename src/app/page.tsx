import { EditorPageView } from "@/features/views/components/editor-page-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Excaldraw Clone",
    template: "%s | Excaldraw Clone",
  },
  description:
    "A lightweight Excalidraw-like canvas editor. Draw shapes, annotate, and export your work.",
  keywords: [
    "excalidraw",
    "canvas",
    "fabric.js",
    "diagram",
    "whiteboard",
    "drawing",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Excaldraw Clone",
    title: "Excaldraw Clone",
    description:
      "A lightweight Excalidraw-like canvas editor. Draw shapes, annotate, and export your work.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Excaldraw Clone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Excaldraw Clone",
    description:
      "A lightweight Excalidraw-like canvas editor. Draw shapes, annotate, and export your work.",
    images: ["/og.png"],
  },
};

export const dynamic = "force-static";
export const revalidate = false;

export default function Home() {
  return <EditorPageView />;
}
