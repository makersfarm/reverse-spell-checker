import type { ReverseResult } from "./reverseSpellCheck";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

type AnalyticsEventName =
  | "sample_used"
  | "input_start"
  | "check_submit"
  | "result_generated"
  | "copy_result"
  | "share_result"
  | "save_image"
  | "reset_input"
  | "rule_report_opened"
  | "rule_report_submitted";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let analyticsInitialized = false;

export function initAnalytics() {
  if (analyticsInitialized || !GA_MEASUREMENT_ID) return;

  analyticsInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

export function trackEvent(name: AnalyticsEventName, params: EventParams = {}) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag("event", name, {
    app_name: "madchumbeop",
    ...params,
  });
}

export function getCharCountBucket(text: string) {
  const length = text.trim().length;

  if (length === 0) return "0";
  if (length <= 50) return "1_50";
  if (length <= 150) return "51_150";
  if (length <= 300) return "151_300";
  return "301_500";
}

export function getResultAnalytics(result: ReverseResult) {
  const categories = Array.from(new Set(result.errors.map((error) => error.type))).join(",");

  return {
    error_count: result.errors.length,
    categories: categories || "none",
    char_count_bucket: getCharCountBucket(result.originalText),
  };
}
