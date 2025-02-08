console.log("Primal: Stories.js loaded");

$(document).ready(function () {
  // DOM targeting selectors
  const SELECTORS = {
    contentWrap: '[primal="stories-content-wrap"]',
    navigation: '[primal="stories-nav"]',
    navigationDot: '[primal="stories-nav-dot"]',
    dotFill: '[primal="stories-dot-fill"]',
    prevButton: '[primal="stories-left"]',
    nextButton: '[primal="stories-right"]',
  };

  // Animation configuration
  const CONFIG = {
    slideTime: 5000,      // Time per slide in milliseconds
    holdDelay: 300,       // Delay before hold triggers pause
    activeDotWidth: '60px',
    inactiveDotWidth: '8px',
    activeScale: 'scale(1)',
    inactiveScale: 'scale(1.05)'
  };

  // Get main containers
  const contentWrap = document.querySelector(SELECTORS.contentWrap);
  const navContainer = document.querySelector(SELECTORS.navigation);

  if (!contentWrap || !navContainer) {
    console.error("Content wrap or nav container not found!");
    return;
  }

  // Set up slides and initial dot
  const slides = contentWrap.children;
  const slideCount = slides.length;
  const firstDot = navContainer.querySelector(SELECTORS.navigationDot);

  if (!firstDot) {
    console.error("Initial navigation dot not found!");
    return;
  }

  // Clear existing dots except the first one
  const extraDots = navContainer.querySelectorAll(`${SELECTORS.navigationDot}:not(:first-child)`);
  extraDots.forEach(dot => dot.remove());

  // Create dots based on slide count
  for (let i = 1; i < slideCount; i++) {
    const newDot = firstDot.cloneNode(true);
    navContainer.appendChild(newDot);
  }

  // Initialize state
  let currentIndex = 0;
  let timer = null;
  let holdTimer = null;
  let isHolding = false;
  let pausedTime = 0;
  let animationStartTime = 0;

  const startHold = () => {
    holdTimer = setTimeout(() => {
      isHolding = true;
      if (timer) clearTimeout(timer);
      
      const currentFill = navContainer.querySelectorAll(SELECTORS.dotFill)[currentIndex];
      if (currentFill) {
        $(currentFill).stop();
        pausedTime = CONFIG.slideTime - ((Date.now() - animationStartTime));
        if (pausedTime < 0) pausedTime = 0;
      }
    }, CONFIG.holdDelay);
  };

  const endHold = () => {
    clearTimeout(holdTimer);
    if (isHolding) {
      isHolding = false;
      resumeTimer();
    }
  };

  const resumeTimer = () => {
    if (isHolding) return;

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    const dotFills = navContainer.querySelectorAll(SELECTORS.dotFill);
    const currentFill = dotFills[currentIndex];
    
    if (currentFill) {
      const progressPercent = ((CONFIG.slideTime - pausedTime) / CONFIG.slideTime) * 100;
      $(currentFill)
        .css('width', `${progressPercent}%`)
        .animate({width: '100%'}, pausedTime, 'linear');
    }

    timer = setTimeout(showNextSlide, pausedTime);
  };

  const resetTimer = () => {
    if (isHolding) return;

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    const dotFills = navContainer.querySelectorAll(SELECTORS.dotFill);
    dotFills.forEach(fill => {
      $(fill).stop().css('width', '0%');
    });

    const currentFill = dotFills[currentIndex];
    if (currentFill) {
      $(currentFill)
        .css('width', '0%')
        .animate({width: '100%'}, CONFIG.slideTime, 'linear');
    }

    animationStartTime = Date.now();
    pausedTime = CONFIG.slideTime;
    timer = setTimeout(showNextSlide, CONFIG.slideTime);
  };

  const showSlide = (index) => {
    Array.from(slides).forEach((slide, i) => {
      slide.style.visibility = i === index ? 'visible' : 'hidden';
      slide.setAttribute('aria-current', i === index ? 'true' : 'false');
      slide.style.transform = i === index ? CONFIG.activeScale : CONFIG.inactiveScale;
    });

    const dots = navContainer.querySelectorAll(SELECTORS.navigationDot);
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      dot.style.width = i === index ? CONFIG.activeDotWidth : CONFIG.inactiveDotWidth;
    });

    currentIndex = index;
    resetTimer();
  };

  const showNextSlide = () => {
    const nextIndex = (currentIndex + 1) % slideCount;
    showSlide(nextIndex);
  };

  // Event Listeners
  $(document).on('mousedown touchstart', startHold);
  $(document).on('mouseup touchend', endHold);

  $(`${SELECTORS.prevButton}, ${SELECTORS.nextButton}`).on('mousedown', function(e) {
    e.preventDefault();
    $(this).data('pressStart', $.now());
  });

  $(`${SELECTORS.prevButton}, ${SELECTORS.nextButton}`).on('mouseup', function() {
    if (isHolding) return;

    const pressTime = $.now() - $(this).data('pressStart');
    if (pressTime < CONFIG.holdDelay) {
      if ($(this).attr('primal') === 'stories-right') {
        showNextSlide();
      } else {
        const prevIndex = (currentIndex - 1 + slideCount) % slideCount;
        showSlide(prevIndex);
      }
    }
  });

  $(document).keydown(function(e) {
    if (isHolding) return;

    switch(e.which) {
      case 37: // left
        const prevIndex = (currentIndex - 1 + slideCount) % slideCount;
        showSlide(prevIndex);
        break;
      case 39: // right
        showNextSlide();
        break;
      default: return;
    }
    e.preventDefault();
  });

  // Dot click handlers
  navContainer.addEventListener('click', (e) => {
    const dot = e.target.closest(SELECTORS.navigationDot);
    if (dot) {
      const dots = Array.from(navContainer.querySelectorAll(SELECTORS.navigationDot));
      const index = dots.indexOf(dot);
      if (index !== -1) {
        showSlide(index);
      }
    }
  });

  // Initialize first slide
  showSlide(0);
});
