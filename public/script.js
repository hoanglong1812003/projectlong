// ==== CONFIG ====
// Thay bằng YouTube video id bạn muốn (chỉ id, ví dụ: "dQw4w9WgXcQ")
const YOUTUBE_VIDEO_ID = "MJzqr9qdopQ"; // <-- đổi ở đây

// Ảnh mặc định có thể thay hoặc người dùng sẽ chèn link trong HTML
// =================

document.addEventListener('DOMContentLoaded', () => {
  const audioBtn = document.getElementById('audio-btn');
  const ytContainer = document.getElementById('yt-container');

  let isPlaying = false;
  let iframeEl = null;

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

  // ===== Countdown logic =====
  const gradDateInput = document.getElementById('grad-date');
  const setBtn = document.getElementById('set-date');
  const clearBtn = document.getElementById('clear-date');

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const displayDate = document.getElementById('display-date');
  const inviteDateText = document.getElementById('invite-date-text');
  const infoDateText = document.getElementById('info-date');

  let countdownTimer = null;
  let targetDate = null;

  // Helper
  function pad(n){ return n < 10 ? '0' + n : '' + n; }

  function updateDisplayDate(d) {
    // format: DD | Tháng MM | YYYY
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    displayDate.textContent = `${day} | Tháng ${pad(month)} | ${year}`;
    inviteDateText.textContent = `${pad(day)}/${pad(month)}/${year}`;
    infoDateText.textContent = `${pad(day)}/${pad(month)}/${year}`;
  }

  function startCountdown(toDate) {
    if (countdownTimer) clearInterval(countdownTimer);
    function tick() {
      const now = new Date();
      const diff = toDate - now;
      if (diff <= 0) {
        // kết thúc
        clearInterval(countdownTimer);
        daysEl.textContent = 0;
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
        return;
      }
      const sec = Math.floor(diff / 1000);
      const days = Math.floor(sec / (3600*24));
      const hours = Math.floor((sec % (3600*24)) / 3600);
      const mins = Math.floor((sec % 3600) / 60);
      const secs = sec % 60;

      daysEl.textContent = days;
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(mins);
      secondsEl.textContent = pad(secs);
    }
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  // Set button
  setBtn.addEventListener('click', () => {
    const val = gradDateInput.value;
    if (!val) {
      alert('Vui lòng chọn ngày giờ hợp lệ.');
      return;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      alert('Ngày giờ không hợp lệ.');
      return;
    }
    targetDate = d;
    updateDisplayDate(d);

    if (d > new Date()) {
      startCountdown(d);
    } else {
      // nếu ngày đã qua thì reset timer và hiển thị 0
      if (countdownTimer) clearInterval(countdownTimer);
      daysEl.textContent = 0;
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      alert('Ngày bạn nhập đã tới hoặc đã qua. Đồng hồ đếm ngược sẽ không chạy.');
    }
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    gradDateInput.value = '';
    if (countdownTimer) clearInterval(countdownTimer);
    daysEl.textContent = 0;
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    // reset to default sample
    const sample = new Date('2026-01-09T07:30:00');
    updateDisplayDate(sample);
  });

  // Init with sample date
  const sampleDate = new Date('2026-01-09T07:30:00');
  updateDisplayDate(sampleDate);
  // if sample in future, start countdown
  if (sampleDate > new Date()) startCountdown(sampleDate);
});
