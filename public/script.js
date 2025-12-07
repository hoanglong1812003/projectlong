// ==== CONFIG ====
// YouTube video id (chỉ id)
const YOUTUBE_VIDEO_ID = "MJzqr9qdopQ";

// =================
document.addEventListener('DOMContentLoaded', () => {
  // --------- helpers ----------
  function qs(id) { return document.getElementById(id); }
  function pad(n){ return n < 10 ? '0' + n : '' + n; }

  // --------- Audio / YouTube autoplay (try) ----------
  const ytContainer = qs('yt-container');
  const audioBtn = qs('audio-btn');
  let iframeEl = null;
  let isPlaying = false;

  function createYouTubeIframe(id) {
    // tạo iframe với autoplay khi người dùng click (tương tác)
    const iframe = document.createElement('iframe');
    iframe.width = "0";
    iframe.height = "0";
    iframe.style.border = "0";
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&controls=0&modestbranding=1`;
    iframe.allow = "autoplay; encrypted-media";
    return iframe;
  }

  audioBtn.addEventListener('click', () => {
    if (!isPlaying) {
      // nếu chưa tạo iframe thì tạo
      if (!iframeEl) {
        iframeEl = createYouTubeIframe(YOUTUBE_VIDEO_ID);
        ytContainer.appendChild(iframeEl);
      } else {
        // reload src to force play (bảo đảm tương tác)
        iframeEl.src = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&controls=0&modestbranding=1`;
      }
      audioBtn.textContent = '⏸'; // cập nhật icon
      isPlaying = true;
    } else {
      // để tắt: remove iframe (YouTube sẽ dừng)
      if (iframeEl && iframeEl.parentNode) {
        iframeEl.parentNode.removeChild(iframeEl);
        iframeEl = null;
      }
      isPlaying = false;
      audioBtn.textContent = '🔊';
    }
  });
  

  // --------- Countdown logic ----------
  // Grab elements but allow missing ones
  const gradDateInput = qs('grad-date'); // may be null if no input on page
  const setBtn = qs('set-date');
  const clearBtn = qs('clear-date');

  const daysEl = qs('days');
  const hoursEl = qs('hours');
  const minutesEl = qs('minutes');
  const secondsEl = qs('seconds');
  const displayDate = qs('display-date');
  const inviteDateText = qs('invite-date-text');
  const infoDateText = qs('info-date');

  // fallback safe setters
  function safeSet(el, v) { if (el) el.textContent = v; }

  let countdownTimer = null;

  function updateDisplayDate(d) {
    if (!(d instanceof Date) || isNaN(d)) return;
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    safeSet(displayDate, `${day} | Tháng ${pad(month)} | ${year}`);
    safeSet(inviteDateText, `${pad(day)}/${pad(month)}/${year}`);
    safeSet(infoDateText, `${pad(day)}/${pad(month)}/${year}`);
  }

  function updateCountdownValues(days, hours, mins, secs) {
    safeSet(daysEl, String(days));
    safeSet(hoursEl, pad(hours));
    safeSet(minutesEl, pad(mins));
    safeSet(secondsEl, pad(secs));
  }

  function clearCountdownDisplay() {
    updateCountdownValues(0, 0, 0, 0);
  }

  function startCountdown(toDate) {
    if (!(toDate instanceof Date) || isNaN(toDate)) {
      console.warn('Invalid target date for countdown', toDate);
      clearCountdownDisplay();
      return;
    }
    if (countdownTimer) clearInterval(countdownTimer);

    function tick() {
      const now = new Date();
      const diff = toDate - now;
      if (diff <= 0) {
        clearInterval(countdownTimer);
        clearCountdownDisplay();
        return;
      }
      const sec = Math.floor(diff / 1000);
      const days = Math.floor(sec / (3600*24));
      const hours = Math.floor((sec % (3600*24)) / 3600);
      const mins = Math.floor((sec % 3600) / 60);
      const secs = sec % 60;
      updateCountdownValues(days, hours, mins, secs);
    }

    // run immediately then every second
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  // Attach set/clear button handlers but only if elements exist
  if (setBtn && gradDateInput) {
    setBtn.addEventListener('click', () => {
      const val = gradDateInput.value;
      if (!val) { alert('Vui lòng chọn ngày giờ hợp lệ.'); return; }
      const d = new Date(val);
      if (isNaN(d.getTime())) { alert('Ngày giờ không hợp lệ.'); return; }
      updateDisplayDate(d);
      if (d > new Date()) startCountdown(d);
      else {
        if (countdownTimer) clearInterval(countdownTimer);
        clearCountdownDisplay();
        alert('Ngày bạn nhập đã tới hoặc đã qua. Đồng hồ đếm ngược sẽ không chạy.');
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (gradDateInput) gradDateInput.value = '';
      if (countdownTimer) clearInterval(countdownTimer);
      clearCountdownDisplay();
      // reset to default sample date
      const sample = new Date('2026-01-09T07:30:00');
      updateDisplayDate(sample);
    });
  }

  // ---- Init with sample date (09 Jan 2026 07:30 local) ----
  try {
    const sampleDate = new Date('2026-01-09T07:30:00');
    updateDisplayDate(sampleDate);
    // Only start countdown if sampleDate is in future
    if (sampleDate > new Date()) {
      startCountdown(sampleDate);
    } else {
      // sample is in past on user's client: show zeros
      clearCountdownDisplay();
    }
  } catch (e) {
    console.error('Init countdown error', e);
    clearCountdownDisplay();
  }

  // Small safety: log if important elements missing
  const missing = [];
  if (!daysEl) missing.push('days');
  if (!hoursEl) missing.push('hours');
  if (!minutesEl) missing.push('minutes');
  if (!secondsEl) missing.push('seconds');
  if (!displayDate) missing.push('display-date');
  if (missing.length) console.warn('Some countdown elements are missing from the page:', missing.join(', '));
});
