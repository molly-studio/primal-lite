console.log("Primal: Main.js loaded");

// Your actual component files
import './views.js';
import './news.js';
import './stories.js';
import './carousel.js';

// Erase Hidden CMS Items from DOM Begin //
    const eraseHidden =  () => {
      document
      .querySelectorAll(".w-condition-invisible")
      .forEach(
        el => {
          el.remove();
        }
      );
  }
  document.addEventListener("DOMContentLoaded", eraseHidden);
