/**
 * 맏춤법 검사기 v4
 * - 카드 이미지 다운로드 (인스타그램 스토리용)
 */

import { useState, useRef, useCallback, useEffect } from "react";
import html2canvas from "html2canvas";
import { reverseSpellCheck, buildHighlightedHtml, type ReverseResult } from "@/lib/reverseSpellCheck";
import { getCharCountBucket, getResultAnalytics, initAnalytics, trackEvent } from "@/lib/analytics";
import { ClipboardList, Copy, Check, FileText, Image as ImageIcon, PencilLine, RotateCcw, Search, Share2 } from "lucide-react";
import { toast } from "sonner";

const MAX_CHARS = 500;
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648376380/2SRdrV75XsmtRYhUoQfvux/hero-fun-VBuQr4WrVZE2Gw6GUrPhEw.webp";

function getSiteUrl() {
  return import.meta.env.VITE_SITE_URL || window.location.origin;
}

const TYPE_STYLE: Record<string, { bg: string; dot: string; badge: string; badgeText: string; highlight: string }> = {
  "맞춤법":   { bg: "#FFF3B0", dot: "#FFB800", badge: "#FFE234", badgeText: "#7a4800", highlight: "#FFE234" },
  "띄어쓰기": { bg: "#D4F8E0", dot: "#5EE87A", badge: "#5EE87A", badgeText: "#1a6e3a", highlight: "#5EE87A" },
  "표준어":   { bg: "#FFD6E8", dot: "#FF6B9D", badge: "#FF6B9D", badgeText: "#fff",    highlight: "#FF6B9D" },
  "외래어":   { bg: "#DDEBFF", dot: "#4A8BFF", badge: "#4A8BFF", badgeText: "#fff",    highlight: "#A7C8FF" },
};

const LOADING_MSGS = [
  "문장 확인 중…",
  "표현 찾는 중…",
  "결과 준비 중…",
];

const SAMPLE_TEXTS = [
  "오랜만에 친구를 만나서 정말 좋았다. 며칠 전부터 기대하고 있었다.",
  "오늘은 집에 가도 돼요. 내일 다시 봐도 돼서 좋아요.",
  "웬만하면 오늘 끝내고, 왠지 내일은 쉬고 싶어요.",
  "비가 그치더니 금세 맑아졌다. 그 상황은 정말 어이없다.",
  "설렘을 안고 설거지를 마치고 좋은 결과를 바라요.",
  "오늘 점심으로 된장찌개와 떡볶이를 먹었다.",
  "액세서리와 케이크 사진을 메시지로 보냈다.",
  "새 콘텐츠를 커피숍에서 같이 볼 수 있어요.",
  "보고 싶다. 할 수 있다면 내일 다시 보자.",
  "역할을 맡은 사람이 희한하다 싶은 실수를 했다.",
];

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<ReverseResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [btnWiggle, setBtnWiggle] = useState(false);
  const [loadingMsg] = useState(() => LOADING_MSGS[Math.floor(Math.random() * LOADING_MSGS.length)]);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const resultPanelRef = useRef<HTMLDivElement>(null);
  const lastSampleRef = useRef("");
  const usedSampleRef = useRef(false);
  const inputStartedRef = useRef(false);
  const siteUrl = getSiteUrl();

  useEffect(() => {
    initAnalytics();
  }, []);

  const handleCheck = useCallback(() => {
    if (!inputText.trim()) {
      setBtnWiggle(true);
      setTimeout(() => setBtnWiggle(false), 600);
      return;
    }
    trackEvent("check_submit", {
      char_count_bucket: getCharCountBucket(inputText),
      used_sample: usedSampleRef.current,
    });
    setIsChecking(true);
    setResult(null);

    setTimeout(() => {
      const res = reverseSpellCheck(inputText);
      trackEvent("result_generated", {
        ...getResultAnalytics(res),
        used_sample: usedSampleRef.current,
      });
      setResult(res);
      setIsChecking(false);
      requestAnimationFrame(() => {
        if (!window.matchMedia("(max-width: 959px)").matches) return;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        resultPanelRef.current?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    }, 750);
  }, [inputText]);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.wrongText).then(() => {
      trackEvent("copy_result", getResultAnalytics(result));
      setCopied(true);
      toast.success("복사 완료");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  const handleReset = useCallback(() => {
    if (inputText || result) {
      trackEvent("reset_input", {
        had_result: Boolean(result),
        char_count_bucket: getCharCountBucket(inputText || result?.originalText || ""),
      });
    }
    setInputText("");
    setResult(null);
    usedSampleRef.current = false;
    inputStartedRef.current = false;
  }, [inputText, result]);

  const handleSample = useCallback(() => {
    let text = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];

    if (SAMPLE_TEXTS.length > 1) {
      while (text === lastSampleRef.current) {
        text = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
      }
    }

    lastSampleRef.current = text;
    usedSampleRef.current = true;
    inputStartedRef.current = true;
    trackEvent("sample_used", {
      char_count_bucket: getCharCountBucket(text),
    });
    trackEvent("input_start", {
      source: "sample",
      char_count_bucket: getCharCountBucket(text),
    });
    setInputText(text);
    setResult(null);
  }, []);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const shareText = `맏춤법 검사기\n\n${result.wrongText}`;
    const fallbackText = `${shareText}\n\n${siteUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "맏춤법 검사기",
          text: shareText,
          url: siteUrl,
        });
        trackEvent("share_result", {
          ...getResultAnalytics(result),
          share_method: "native",
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await navigator.clipboard.writeText(fallbackText);
    trackEvent("share_result", {
      ...getResultAnalytics(result),
      share_method: "clipboard",
    });
    setCopied(true);
    toast.success("공유할 내용을 복사했어요");
    setTimeout(() => setCopied(false), 2000);
  }, [result, siteUrl]);

  // ── 카드 이미지 다운로드 ──
  const handleDownloadCard = useCallback(async () => {
    if (!cardRef.current || !result) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = "맏춤법검사기_결과.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      trackEvent("save_image", getResultAnalytics(result));
      toast.success("이미지 저장 완료");
    } catch {
      toast.error("이미지 저장에 실패했어요.");
    } finally {
      setIsDownloading(false);
    }
  }, [result]);

  const highlightedHtml = result ? buildHighlightedHtml(result) : "";

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", backgroundColor: "#FFFBF0" }}>
      {/* ── 헤더 ── */}
      <header style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover", backgroundPosition: "center", opacity: 0.85,
        }} />
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,251,240,0.25)" }} />
        <div className="app-container" style={{ position: "relative", paddingTop: "3rem", paddingBottom: "2.5rem" }}>
          <div className="hero-content">
            <div className="hero-title-block">
              <p className="hero-reverse-tag" aria-label="리버스">
                <RotateCcw className="hero-reverse-tag__mark" size={14} strokeWidth={3} aria-hidden="true" />
                <span className="hero-reverse-tag__text">리버스</span>
              </p>
              <h1 className="hero-title" style={{
                fontFamily: "'Black Han Sans', sans-serif",
                fontSize: "clamp(2.4rem, 6vw, 3.8rem)",
                color: "#1a1a1a", lineHeight: 1.1, letterSpacing: 0,
              }}>
                맏춤법{" "}
                <span className="hero-title__accent" style={{ background: "linear-gradient(transparent 45%, #FFE234 45%)", paddingRight: "0.1em" }}>검사기</span>
              </h1>
            </div>
            <div className="hero-sample-card" aria-label="예시">
              <div className="hero-sample-card__row">
                <span className="hero-sample-card__from">돼요</span>
                <span className="hero-sample-card__arrow" aria-hidden="true">→</span>
                <span className="hero-sample-card__to">되요</span>
              </div>
              <div className="hero-sample-card__row">
                <span className="hero-sample-card__from">며칠 전부터</span>
                <span className="hero-sample-card__arrow" aria-hidden="true">→</span>
                <span className="hero-sample-card__to">몇일 전부터</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ lineHeight: 0, marginTop: "-2px" }}>
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ width: "100%", height: 40, display: "block" }}>
            <path d="M0,20 C240,40 480,0 720,20 C960,40 1200,0 1440,20 L1440,40 L0,40 Z" fill="#FFFBF0" />
          </svg>
        </div>
      </header>

      {/* ── 메인 ── */}
      <main className="app-container" style={{ flex: 1, paddingTop: "1.5rem", paddingBottom: "2rem" }}>
        <div className="checker-grid">

          {/* ── 왼쪽: 입력 ── */}
          <div className="checker-panel workspace-card workspace-card--input" style={{
            backgroundColor: "#fff", borderRadius: "1.25rem",
            border: "2px solid #1a1a1a", boxShadow: "4px 4px 0 #1a1a1a",
            overflow: "hidden", display: "flex", flexDirection: "column",
          }}>
            <div className="panel-header" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.75rem 1.1rem 0.6rem", borderBottom: "2px solid #f0ebe0",
            }}>
              <span className="section-title" style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: "1.08rem", color: "#1a1a1a" }}>
                <PencilLine size={18} strokeWidth={2.4} aria-hidden="true" />
                원문
              </span>
              <span style={{
                fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.82rem",
                color: inputText.length > MAX_CHARS * 0.8 ? "#b84100" : "#6f6860",
                fontWeight: 500, transition: "color 0.2s",
              }}>
                {inputText.length} / {MAX_CHARS}
              </span>
            </div>

            <textarea
              className="main-textarea"
              aria-label="검사할 원문"
              name="sourceText"
              autoComplete="off"
              value={inputText}
              onChange={(e) => {
                if (e.target.value.length > MAX_CHARS) return;

                if (!inputStartedRef.current && e.target.value.trim()) {
                  inputStartedRef.current = true;
                  usedSampleRef.current = false;
                  trackEvent("input_start", {
                    source: "manual",
                    char_count_bucket: getCharCountBucket(e.target.value),
                  });
                }

                setInputText(e.target.value);
              }}
              placeholder={"문장을 입력해보세요.\nCtrl+Enter로 검사"}
              style={{
                flex: 1, width: "100%", resize: "none", border: "none",
                padding: "1rem 1.1rem",
                fontFamily: "'Noto Sans KR', sans-serif", fontSize: "1.08rem",
                lineHeight: 1.85, color: "#1a1a1a", backgroundColor: "transparent", minHeight: 240,
              }}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleCheck(); }}
            />

            <div className="panel-footer input-footer" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.65rem 1.1rem", borderTop: "2px solid #f0ebe0",
              backgroundColor: "#fdfaf3", gap: "0.5rem", flexWrap: "wrap",
            }}>
              {!inputText && !result && (
                <button
                  onClick={handleSample}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.35rem",
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: "0.86rem", fontWeight: 600, color: "#b35c00",
                    backgroundColor: "#FFF3B0", border: "1.5px dashed #FFB800",
                    borderRadius: "999px", minHeight: 44, padding: "0 0.9rem",
                    transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FFE234"; e.currentTarget.style.borderStyle = "solid"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFF3B0"; e.currentTarget.style.borderStyle = "dashed"; }}
                >
                  <PencilLine size={15} strokeWidth={2.4} aria-hidden="true" />
                  예시 문장 써보기
                </button>
              )}

              <div className="input-legend" style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                {Object.entries(TYPE_STYLE).map(([label, s]) => (
                  <span key={label} style={{
                    display: "flex", alignItems: "center", gap: "0.3rem",
                    fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.8rem", color: "#5f594f", fontWeight: 600,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: s.dot, display: "inline-block", flexShrink: 0 }} />
                    {label}
                  </span>
                ))}
              </div>

              <div className="input-actions" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
                {(inputText || result) && (
                  <button
                    onClick={handleReset}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.25rem",
                      fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.82rem", color: "#6f6860", fontWeight: 600,
                      background: "none", border: "none", minHeight: 44, padding: "0 0.65rem", borderRadius: "0.65rem",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6f6860")}
                  >
                    <RotateCcw size={12} /> 초기화
                  </button>
                )}
                <button
                  onClick={handleCheck}
                  disabled={isChecking}
                  className={`${btnWiggle ? "animate-wiggle " : ""}check-button`}
                  style={{
                    fontFamily: "'Black Han Sans', sans-serif", fontSize: "1rem",
                    minHeight: 44, padding: "0 1.4rem", border: "2px solid #1a1a1a", borderRadius: "999px",
                    display: "flex", alignItems: "center", gap: "0.4rem",
                  }}
                >
                  {isChecking ? (
                    <><span className="button-spinner button-spinner--light" />검사 중</>
                  ) : "검사하기"}
                </button>
              </div>
            </div>
          </div>

          {/* ── 오른쪽: 결과 ── */}
          <div ref={resultPanelRef} className="checker-panel workspace-card workspace-card--result" style={{
            backgroundColor: "#fff", borderRadius: "1.25rem",
            border: "2px solid #1a1a1a", boxShadow: "4px 4px 0 #1a1a1a",
            overflow: "hidden", display: "flex", flexDirection: "column",
          }}>
            <div className="panel-header result-header" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.75rem 1.1rem 0.6rem", borderBottom: "2px solid #f0ebe0",
            }}>
              <span className="section-title" style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: "1.08rem", color: "#1a1a1a" }}>
                <Search size={18} strokeWidth={2.4} aria-hidden="true" />
                결과
              </span>
              {result && result.errors.length > 0 && (
                <span className="animate-pop-in result-count-badge" style={{
                  backgroundColor: "#FFF3B0", color: "#7a4800",
                  fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.82rem", fontWeight: 900,
                  padding: "0.2rem 0.65rem", borderRadius: "999px",
                  border: "1px solid #E2B900",
                }}>
                  {result.errors.length}개 표시
                </span>
              )}
            </div>

            {/* 결과 본문 */}
            <div
              className="result-body"
              aria-live="polite"
              aria-busy={isChecking}
              style={{ flex: 1, position: "relative", padding: "1rem 1.1rem", minHeight: result ? 0 : 240 }}
            >
              {!result && !isChecking && (
                <div style={{
                  position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: 0.35, pointerEvents: "none",
                }}>
                  <FileText size={38} strokeWidth={1.8} color="#8a8176" aria-hidden="true" />
                  <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.94rem", color: "#6f6860", fontWeight: 600 }}>아직 비어 있어요</p>
                </div>
              )}

              {isChecking && (
                <div style={{
                  position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: "0.75rem",
                }}>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} style={{
                        width: 10, height: 10, borderRadius: "50%", backgroundColor: "#FFB800",
                        display: "inline-block",
                        animation: `bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                  <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.94rem", color: "#6f6860", fontWeight: 600 }}>{loadingMsg}</p>
                </div>
              )}

              {result && !isChecking && (
                <div className="animate-slide-up">
                  <div
                    className="result-text"
                    style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "1.08rem", lineHeight: 1.9, color: "#1a1a1a", wordBreak: "keep-all", overflowWrap: "anywhere" }}
                    dangerouslySetInnerHTML={{ __html: highlightedHtml || result.wrongText }}
                  />

                  {result.errors.length > 0 && (
                    <div className="result-expression-list" aria-label="바뀐 표현">
                      <div className="result-expression-list__header">
                        <span className="section-title" style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: "1rem", color: "#1a1a1a" }}>
                          <ClipboardList size={17} strokeWidth={2.4} aria-hidden="true" />
                          바뀐 표현
                        </span>
                      </div>
                      {result.errors.map((err, i) => {
                        const s = TYPE_STYLE[err.type] || TYPE_STYLE["맞춤법"];
                        return (
                          <div key={err.id} className="expression-row" style={{ animationDelay: `${0.04 * i + 0.08}s`, animationFillMode: "both" }}>
                            <span className="expression-row__badge" style={{ backgroundColor: s.badge, color: s.badgeText }}>
                              {err.type}
                            </span>
                            <div className="expression-row__body">
                              <div className="expression-row__words">
                                <span className="expression-row__wrong" style={{ background: `linear-gradient(transparent 42%, ${s.bg} 42%)` }}>
                                  {err.wrong}
                                </span>
                                <span className="expression-row__arrow" aria-hidden="true">←</span>
                                <span className="expression-row__original" style={{ textDecorationColor: s.dot }}>
                                  {err.original}
                                </span>
                              </div>
                              <p className="expression-row__reason">{err.reason}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 결과 하단 바 */}
            {result && (
              <div className="panel-footer result-footer" style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.65rem 1.1rem", borderTop: "2px solid #f0ebe0",
                backgroundColor: "#fdfaf3", gap: "0.5rem", flexWrap: "wrap",
              }}>
                <div className="result-type-list" style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {result.errors.length > 0 &&
                  Array.from(new Set(result.errors.map((e) => e.type))).map((type) => {
                    const s = TYPE_STYLE[type] || TYPE_STYLE["맞춤법"];
                    return (
                      <span key={type} style={{
                        backgroundColor: s.badge, color: s.badgeText,
                        fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.78rem", fontWeight: 700,
                        padding: "0.2rem 0.6rem", borderRadius: "999px",
                        border: "1.5px solid rgba(0,0,0,0.12)",
                      }}>
                        {type}
                      </span>
                    );
                  })}
                </div>

	                <div className="result-action-strip">
	                  <button
	                    onClick={handleCopy}
	                    title={copied ? "복사됨" : "복사하기"}
	                    aria-label={copied ? "복사됨" : "복사하기"}
	                    className={`button-icon button-icon--light ${copied ? "button-icon--success" : ""}`}
	                  >
	                    {copied ? <Check size={18} strokeWidth={2.6} aria-hidden="true" /> : <Copy size={18} strokeWidth={2.4} aria-hidden="true" />}
	                  </button>

	                  <button
	                    onClick={handleShare}
	                    title="공유하기"
	                    aria-label="공유하기"
	                    className="button-icon button-icon--light"
	                  >
	                    <Share2 size={18} strokeWidth={2.4} aria-hidden="true" />
	                  </button>

	                  <button
	                    onClick={handleDownloadCard}
	                    disabled={isDownloading}
	                    title={isDownloading ? "이미지 저장 중" : "이미지 저장"}
	                    aria-label={isDownloading ? "이미지 저장 중" : "이미지 저장"}
	                    className="button-icon button-icon--light"
	                  >
	                    {isDownloading ? <span className="button-spinner" aria-hidden="true" /> : <ImageIcon size={18} strokeWidth={2.4} aria-hidden="true" />}
	                  </button>
	                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 숨겨진 카드 (html2canvas 캡처용) ── */}
        {result && (
          <div
            ref={cardRef}
            aria-hidden="true"
            style={{
              position: "fixed", left: "-9999px", top: 0,
              width: 540, padding: "0",
              backgroundColor: "#FFFBF0",
              borderRadius: "1.5rem",
              overflow: "hidden",
              fontFamily: "'Noto Sans KR', sans-serif",
            }}
          >
            {/* 카드 상단 */}
            <div style={{
              background: "linear-gradient(135deg, #FFE234 0%, #FFB800 100%)",
              padding: "1.5rem 1.75rem 1.2rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{
                  fontFamily: "'Black Han Sans', sans-serif", fontSize: "1.3rem",
                  color: "#1a1a1a", letterSpacing: 0,
                }}>
                  맏춤법 검사기
                </span>
                <span style={{
                  backgroundColor: "#1a1a1a", color: "#FFE234",
                  fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.65rem", fontWeight: 700,
                  padding: "3px 10px", borderRadius: "999px",
                }}>
                  {result.errors.length}개
                </span>
              </div>
              <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.7rem", color: "#7a4800", fontWeight: 500 }}>
                바뀐 문장
              </p>
            </div>

            {/* 카드 본문 */}
            <div style={{ padding: "1.5rem 1.75rem", backgroundColor: "#fff" }}>
              <p style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "1.1rem", lineHeight: 1.9, color: "#1a1a1a",
                fontWeight: 500, wordBreak: "keep-all",
              }}>
                {result.wrongText}
              </p>
            </div>

            {/* 카드 바뀐 표현 목록 */}
            <div style={{ padding: "0 1.75rem 1.5rem", backgroundColor: "#fff" }}>
              <div style={{ borderTop: "2px dashed #f0ebe0", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {result.errors.slice(0, 4).map((err) => {
                  const s = TYPE_STYLE[err.type] || TYPE_STYLE["맞춤법"];
                  return (
                    <div key={err.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{
                        backgroundColor: s.badge, color: s.badgeText,
                        fontSize: "0.6rem", fontWeight: 700,
                        padding: "1px 7px", borderRadius: "999px",
                        border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0,
                      }}>
                        {err.type}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "#1a1a1a", fontWeight: 700, background: `linear-gradient(transparent 40%, ${s.bg} 40%)`, padding: "0 2px" }}>{err.wrong}</span>
                      <span style={{ fontSize: "0.72rem", color: "#746b60" }}>←</span>
                      <span style={{ fontSize: "0.75rem", color: "#746b60", textDecoration: "line-through", textDecorationColor: s.dot }}>{err.original}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 카드 푸터 */}
            <div style={{
              padding: "0.75rem 1.75rem",
              backgroundColor: "#fdfaf3",
              borderTop: "1px solid #f0ebe0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: "0.75rem", color: "#6f6860" }}>
                맏춤법 검사기
              </span>
              <span style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.65rem", color: "#746b60" }}>
                {siteUrl.replace(/^https?:\/\//, "")}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* ── 푸터 ── */}
      <footer style={{ borderTop: "2px dashed #e8e0d0", padding: "1rem 0", backgroundColor: "#FFFBF0", marginTop: "auto" }}>
        <div className="app-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.72rem", color: "#746b60", fontWeight: 500 }}>
            맏춤법 검사기
          </p>
          <p style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: "0.7rem", color: "#746b60" }}>© 2026</p>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.6); }
          70% { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-4deg); }
          40% { transform: rotate(4deg); }
          60% { transform: rotate(-3deg); }
          80% { transform: rotate(3deg); }
        }
        .animate-slide-up { animation: slideUp 0.3s ease forwards; }
        .animate-pop-in   { animation: popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .animate-wiggle   { animation: wiggle 0.5s ease; }
        .animate-fade-in  { animation: fadeIn 0.4s ease forwards; }

        .result-text .error-word {
          background: linear-gradient(transparent 62%, rgba(255, 226, 52, 0.42) 62%, rgba(255, 226, 52, 0.42) 84%, transparent 84%);
          color: #1a1a1a; font-weight: 700; padding: 0 2px;
          border-radius: 2px; cursor: default;
          text-decoration-line: underline;
          text-decoration-color: #d8241f;
          text-decoration-thickness: 2.5px;
          text-underline-offset: 0.16em;
          position: relative;
        }

        textarea::placeholder { color: #8a8176; font-weight: 500; }
      `}</style>
    </div>
  );
}
