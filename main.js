// Countdown timer for June 4, 2026
// Beautiful animated timer with hearts and loving messages

const root = document.querySelector('.root');

const targetDate = new Date('2026-07-04T00:00:00');

const isSmall = window.screen.width < window.screen.height;

let heartIntervalId = null;
let commentQueue = [];
let isShowingBirthday = false;

let timerInitialized = false;

function isMobilePortrait() {
  return window.innerWidth <= 768 || (window.screen.width < window.screen.height);
}

function createTimerMarkup() {
  // если уже инициализировано — удалим старую разметку, чтобы создать новую
  if (timerInitialized) {
    const existing = root.querySelector('.timer') || root.querySelector('.timer-compact');
    if (existing) existing.remove();
  }

  if (isMobilePortrait()) {
    // компактная версия: каждый юнит — на новой строке (символы \n в textContent не создают <br>, используем <div>)
    root.innerHTML = `
      <div class="timer-compact">
        <div class="line"><span class="value" data-key="days">0</span> <span class="label">Дней</span></div>
        <div class="line"><span class="value" data-key="hours">0</span> <span class="label">Часов</span></div>
        <div class="line"><span class="value" data-key="minutes">0</span> <span class="label">Минут</span></div>
        <div class="line"><span class="value" data-key="seconds">0</span> <span class="label">Секунд</span></div>
        <div class="line"><span class="value" data-key="milliseconds">0</span> <span class="label">Мс</span></div>
      </div>
    `;
  } else {
    root.innerHTML = `
      <div class="timer">
        <div class="unit"><div class="value" data-key="days">0</div><div class="label">Дней</div></div>
        <div class="unit"><div class="value" data-key="hours">0</div><div class="label">Часов</div></div>
        <div class="unit"><div class="value" data-key="minutes">0</div><div class="label">Минут</div></div>
        <div class="unit"><div class="value" data-key="seconds">0</div><div class="label">Секунд</div></div>
        <div class="unit"><div class="value" data-key="milliseconds">0</div><div class="label">Мс</div></div>
      </div>
    `;
  }

  timerInitialized = true;
  attachTimerListeners();
}

// пересоздавать разметку при изменении размера / ориентации
let lastMobileState = isMobilePortrait();
window.addEventListener('resize', () => {
  const nowMobile = isMobilePortrait();
  if (nowMobile !== lastMobileState) {
    lastMobileState = nowMobile;
    timerInitialized = false;
    // Прямо обновим таймер — он создаст подходящую разметку
    updateTimer();
  }
});


function updateValue(key, text) {
  const el = document.querySelector(`.value[data-key="${key}"]`);
  if (!el) return;
  if (el.textContent !== String(text)) {
    el.textContent = text;
    el.classList.add('pulse');
    el.addEventListener('animationend', () => el.classList.remove('pulse'), { once: true });
  }
}

// Intro sequence: film leader 3-2-1, show letterbox bars and grain
function runIntroSequence() {
  return new Promise(resolve => {
    const leader = document.createElement('div');
    leader.className = 'leader';
    document.body.appendChild(leader);

    const topBar = document.createElement('div'); topBar.className = 'bar top'; document.body.appendChild(topBar);
    const bottomBar = document.createElement('div'); bottomBar.className = 'bar bottom'; document.body.appendChild(bottomBar);
    const grain = document.createElement('div'); grain.className = 'grain'; document.body.appendChild(grain);

    let count = 3;
    leader.classList.add('show');

    const step = () => {
      leader.textContent = count > 0 ? count : 'Начало';
      if (count > 0) {
        // flash effect
        leader.style.transform = 'scale(1.05)';
        setTimeout(() => leader.style.transform = 'scale(1)', 180);
      }
      count -= 1;
      if (count >= -0) {
        setTimeout(() => {
          if (count >= 0) step();
          else finish();
        }, 800);
      }
    };

    function finish() {
      leader.classList.remove('show');
      topBar.classList.add('show');
      bottomBar.classList.add('show');
      grain.classList.add('show');
      // keep bars for a short moment then remove leader elements
      setTimeout(() => {
        leader.remove();
        // bars remain during the experience
        resolve();
      }, 900);
    }

    step();
  });
}

function updateTimer() {
  const now = new Date();
  const timeDifference = targetDate - now;

  if (timeDifference <= 0) {
    if (!isShowingBirthday) {
      isShowingBirthday = true;
      showBirthdayMessage();
      startHeartAnimation();
    }
  } else {
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
    const seconds = Math.floor((timeDifference / 1000) % 60);
    const milliseconds = Math.floor(timeDifference % 1000);

    if (!timerInitialized) createTimerMarkup();

    updateValue('days', String(days));
    updateValue('hours', String(hours).padStart(2, '0'));
    updateValue('minutes', String(minutes).padStart(2, '0'));
    updateValue('seconds', String(seconds).padStart(2, '0'));
    updateValue('milliseconds', String(milliseconds).padStart(3, '0'));

    attachTimerListeners();
  }
}

function attachTimerListeners() {
  const timerElement = root.querySelector('.timer');
  if (timerElement) {
    timerElement.addEventListener('mousemove', showTooltip);
    timerElement.addEventListener('mouseleave', hideTooltip);
    timerElement.addEventListener('click', openInfoPage);
  }
}

function showBirthdayMessage() {
  root.innerHTML = '<h1>С Днём Рождения, моя любимая!</h1>';
  const h1 = root.querySelector('h1');
  if (h1) {
    h1.addEventListener('click', openInfoPage);
  }
  // Начинаем показывать комментарии вместе с поздравлением
  displayComments();
}

function createHeart() {
  const heart = document.createElement('div');
  heart.classList.add('heart');
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.animationDuration = (Math.random() * 2 + 3) + 's';
  document.body.appendChild(heart);
  
  setTimeout(() => {
    heart.remove();
  }, 5500);
}

function startHeartAnimation() {
  if (!heartIntervalId) {
    heartIntervalId = setInterval(createHeart, 300);
  }
}

function showComment(text) {
  const comment = document.createElement('div');
  comment.classList.add('comment');
  comment.textContent = text;
  document.body.appendChild(comment);
  
  setTimeout(() => {
    comment.remove();
  }, 4500);
}

function displayComments() {
  let delay = 0;
  comments.forEach((text, index) => {
    setTimeout(() => {
      showComment(text);
    }, delay); // Start immediately after birthday
    delay += 4200; // 4.2 seconds between comments (чтобы новый начинался чуть раньше конца предыдущего)
  });
}

function showTooltip(event) {
  hideTooltip();
  const daysRemaining = Math.floor((targetDate - new Date()) / (1000 * 60 * 60 * 24));
  const tooltip = document.createElement('div');
  tooltip.classList.add('tooltip');
  tooltip.textContent = `До дня рождения осталось ${daysRemaining} дней`;
  document.body.appendChild(tooltip);
  
  const rect = event.target.getBoundingClientRect();
  tooltip.style.left = (event.pageX - tooltip.offsetWidth / 2) + 'px';
  tooltip.style.top = (rect.top - 60) + 'px';
}

function hideTooltip() {
  const tooltip = document.querySelector('.tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

function openInfoPage() {
  alert('Информационная страница будет доступна вскоре!');
}

// Initialize
updateTimer();
setInterval(updateTimer, 100);
