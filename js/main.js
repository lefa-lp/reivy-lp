// =========================
// REIVY Facial Wax LP - main.js
// =========================

// EDIT: LINE予約URL — ここを変更するとページ内の全LINEボタンに反映されます
const LINE_URL = "ここにLINE予約URLを入力してください";

document.addEventListener("DOMContentLoaded", () => {
  applyLineUrl();
  initHeaderScroll();
  initFixedCta();
  initFadeIn();
  initFaqAccordion();
  initBeforeAfterSlider();
  initSmoothScroll();
  initHeroVideo();
});

// -------------------------
// ヒーロー動画：自動再生の保険処理
// （一部のモバイルブラウザではmuted属性だけでは自動再生されない場合があるため、
//   JS側でも明示的にmutedを設定し、再生に失敗した場合は初回タップで再生を試みる）
// -------------------------
function initHeroVideo() {
  const video = document.querySelector(".hero-video");
  if (!video) return;

  video.muted = true;
  video.setAttribute("muted", "");
  video.playsInline = true;

  const tryPlay = () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // 自動再生がブロックされた場合、最初のタップ/クリックで再生
        const resumeOnInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener("touchstart", resumeOnInteraction);
          document.removeEventListener("click", resumeOnInteraction);
        };
        document.addEventListener("touchstart", resumeOnInteraction, { once: true });
        document.addEventListener("click", resumeOnInteraction, { once: true });
      });
    }
  };

  if (video.readyState >= 2) {
    tryPlay();
  } else {
    video.addEventListener("loadeddata", tryPlay, { once: true });
  }
}

// -------------------------
// LINEボタンへのURL反映
// -------------------------
function applyLineUrl() {
  document.querySelectorAll(".js-line-btn").forEach((el) => {
    el.setAttribute("href", LINE_URL);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
}

// -------------------------
// ヘッダー：スクロールで背景変化
// -------------------------
function initHeaderScroll() {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// -------------------------
// スマホ固定CTA：フッター/最終CTA付近で自然に隠す
// -------------------------
function initFixedCta() {
  const fixedCta = document.getElementById("fixedCta");
  const hideTarget = document.getElementById("final-cta");
  if (!fixedCta || !hideTarget) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        fixedCta.classList.toggle("is-hidden", entry.isIntersecting);
      });
    },
    { threshold: 0.15 }
  );
  observer.observe(hideTarget);
}

// -------------------------
// スクロールでのフェードイン表示
// -------------------------
function initFadeIn() {
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  targets.forEach((el) => observer.observe(el));
}

// -------------------------
// FAQ アコーディオン
// -------------------------
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // 他のFAQを閉じる（1つずつ開く仕様）
      items.forEach((other) => {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-answer").style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove("open");
        question.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("open");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

// -------------------------
// Before / After 比較スライダー（Vanilla JS / タッチ対応）
// -------------------------
function initBeforeAfterSlider() {
  const slider = document.getElementById("baSlider");
  if (!slider) return;

  const afterWrap = slider.querySelector(".ba-after-wrap");
  const divider = slider.querySelector(".ba-divider");
  const handle = slider.querySelector(".ba-handle");
  let isDragging = false;

  const setPosition = (percent) => {
    const clamped = Math.max(0, Math.min(100, percent));
    afterWrap.style.width = clamped + "%";
    divider.style.left = clamped + "%";
    handle.setAttribute("aria-valuenow", Math.round(clamped));
  };

  const getPercentFromEvent = (clientX) => {
    const rect = slider.getBoundingClientRect();
    const x = clientX - rect.left;
    return (x / rect.width) * 100;
  };

  const startDrag = () => { isDragging = true; };
  const stopDrag = () => { isDragging = false; };

  const onMove = (clientX) => {
    if (!isDragging) return;
    setPosition(getPercentFromEvent(clientX));
  };

  // マウス操作
  handle.addEventListener("mousedown", startDrag);
  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("mousemove", (e) => onMove(e.clientX));

  // スライダー全体クリックでも位置調整できるように
  slider.addEventListener("click", (e) => {
    setPosition(getPercentFromEvent(e.clientX));
  });

  // タッチ操作
  handle.addEventListener("touchstart", (e) => {
    startDrag();
    e.preventDefault();
  }, { passive: false });
  window.addEventListener("touchend", stopDrag);
  window.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    if (touch) onMove(touch.clientX);
    e.preventDefault();
  }, { passive: false });

  // キーボード操作（左右矢印）
  handle.addEventListener("keydown", (e) => {
    const current = parseFloat(handle.getAttribute("aria-valuenow")) || 50;
    if (e.key === "ArrowLeft") {
      setPosition(current - 5);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      setPosition(current + 5);
      e.preventDefault();
    }
  });

  // 初期位置
  setPosition(50);
}

// -------------------------
// スムーススクロール（ヘッダー分のオフセット付き）
// -------------------------
function initSmoothScroll() {
  const header = document.getElementById("siteHeader");
  const headerHeight = header ? header.offsetHeight : 0;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}
