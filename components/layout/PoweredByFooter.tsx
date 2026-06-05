import { RiSparklingLine } from "@remixicon/react";

/**
 * Shared "Powered by Thorsten Meyer AI" footer.
 * Rendered at the bottom of every page so attribution is consistent across the app.
 * The "Thorsten Meyer AI" text links to https://thorstenmeyerai.com/.
 */
export default function PoweredByFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-[#2E2E3D] px-6 py-5 text-center">
      <a
        href="https://thorstenmeyerai.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      >
        <RiSparklingLine className="h-3.5 w-3.5" />
        <span>
          Powered by{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Thorsten Meyer AI
          </span>
        </span>
      </a>
    </footer>
  );
}
