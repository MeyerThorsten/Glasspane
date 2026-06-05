import PublicTransparencyCenter from "@/components/public/PublicTransparencyCenter";
import PoweredByFooter from "@/components/layout/PoweredByFooter";
import {
  decodeTransparencyShareToken,
  getPublicWidgetsForShare,
} from "@/lib/transparency-share";

export default async function PublicTransparencyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = decodeTransparencyShareToken(token);

  if (!share) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 dark:bg-[#111118]">
        <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-[#2E2E3D] dark:bg-[#1C1C27] dark:text-gray-300">
          This transparency link is invalid or expired.
        </div>
        <PoweredByFooter />
      </main>
    );
  }

  return (
    <PublicTransparencyCenter
      share={share}
      widgets={getPublicWidgetsForShare(share)}
    />
  );
}
