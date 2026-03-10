"use client";

import { useState } from "react";
import WidgetShell from "@/components/widgets/WidgetShell";
import { RiFilePdf2Line, RiDownloadLine, RiEyeLine, RiCloseLine, RiPlayCircleLine } from "@remixicon/react";

const videos = [
  {
    title: "AI-Powered Infrastructure Transparency Project Description",
    embedUrl: "https://www.youtube.com/embed/q1NrQSXtXx4",
    description:
      "All Is Well, a sophisticated real-time monitoring platform designed to eliminate the transparency gap between managed service providers and their clients. By utilizing IBM watsonx.ai, the dashboard replaces outdated static reports with interactive data visualizations tailored for executive, business, and technical stakeholders.",
  },
  {
    title: "AI-Powered Infrastructure Visibility for Managed Services",
    embedUrl: "https://www.youtube.com/embed/ZEhyzk88Wcg",
    description:
      "All Is Well is an advanced, AI-powered digital dashboard designed to provide managed service provider customers with real-time visibility into their IT infrastructure. The system uses IBM watsonx.ai to offer role-aware insights tailored specifically for executives, business managers, or technical leads.",
  },
  {
    title: "Digital Health Dashboard Technology Statement",
    embedUrl: "https://www.youtube.com/embed/48NgsBR0FsI",
    description:
      "The All Is Well digital health dashboard utilizes IBM watsonx.ai and Granite foundation models to transform complex infrastructure metrics into actionable intelligence. This technical architecture relies on a Next.js and TypeScript stack to deliver core AI capabilities.",
  },
  {
    title: "The Business Case for Operational Transparency",
    embedUrl: "https://www.youtube.com/embed/2FbqpUaY-rE",
    description:
      "All Is Well — Your End-to-End Digital Health Dashboard — becomes a fundamentally different product when it stops showing illustrative data and starts showing operational truth. Four IBM services make this possible.",
  },
];

const documents = [
  {
    title: "Business Case",
    filename: "transparency-portal-business-case.pdf",
    description:
      "Strategic business case for the All Is Well platform, covering ROI, market analysis, and value proposition.",
  },
  {
    title: "Project Description",
    filename: "transparency-portal-project-description.pdf",
    description:
      "Comprehensive project overview including scope, objectives, and key deliverables of All Is Well.",
  },
  {
    title: "Technology Statement",
    filename: "transparency-portal-technology-statement.pdf",
    description:
      "Technical architecture and technology stack powering the All Is Well digital health dashboard.",
  },
];

export default function DocumentationPage() {
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const activeVideoData = videos.find((v) => v.embedUrl === activeVideo);

  return (
    <div className="space-y-6">
      <WidgetShell title="Video Library" size="full">
        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Watch presentations and overviews of the All Is Well platform.
          </p>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {videos.map((video) => (
              <button
                key={video.embedUrl}
                onClick={() => setActiveVideo(video.embedUrl)}
                className="group flex flex-col gap-3 p-4 rounded-lg border border-gray-100 dark:border-[#2E2E3D] bg-gray-50 dark:bg-[#262633] text-left hover:border-magenta/40 hover:shadow-md transition-all"
              >
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-200 dark:bg-[#1C1C27]">
                  <img
                    src={`https://img.youtube.com/vi/${video.embedUrl.split("/").pop()}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <RiPlayCircleLine className="w-12 h-12 text-white drop-shadow-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {video.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {video.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </WidgetShell>

      <WidgetShell title="Project Documentation" size="full">
        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All Is Well — Your End-to-End Digital Health Dashboard. Download or view project documents below.
          </p>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            {documents.map((doc) => (
              <div
                key={doc.filename}
                className="flex flex-col gap-3 p-4 rounded-lg border border-gray-100 dark:border-[#2E2E3D] bg-gray-50 dark:bg-[#262633]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                    <RiFilePdf2Line className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {doc.title}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {doc.description}
                </p>
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <button
                    onClick={() => setPreviewFile(doc.filename)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-magenta/10 text-magenta hover:bg-magenta/20 transition-colors"
                  >
                    <RiEyeLine className="w-3.5 h-3.5" />
                    View
                  </button>
                  <a
                    href={`/docs/${doc.filename}`}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-[#2E2E3D] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2E2E3D] transition-colors"
                  >
                    <RiDownloadLine className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </WidgetShell>

      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setActiveVideo(null)}>
          <div className="relative w-full max-w-4xl mx-4 bg-white dark:bg-[#1C1C27] rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#2E2E3D]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate pr-4">
                {activeVideoData?.title}
              </h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={`${activeVideo}?autoplay=1&rel=0`}
                className="w-full h-full"
                title="Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-5xl h-[85vh] mx-4 bg-white dark:bg-[#1C1C27] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#2E2E3D]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {documents.find((d) => d.filename === previewFile)?.title}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src={`/docs/${previewFile}`}
              className="flex-1 w-full"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
