console.log("Primal: Main.js loaded");

// Function to load a script and return a promise
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Load all components
Promise.all([
    loadScript('https://cdn.jsdelivr.net/gh/molly-studio/primal-lite@main/src/views.js'),
    loadScript('https://cdn.jsdelivr.net/gh/molly-studio/primal-lite@main/src/news.js'),
    loadScript('https://cdn.jsdelivr.net/gh/molly-studio/primal-lite@main/src/stories.js'),
    loadScript('https://cdn.jsdelivr.net/gh/molly-studio/primal-lite@main/src/carousel.js')
]).then(() => {
    console.log("Primal: All components loaded");
}).catch(error => {
    console.error("Error loading components:", error);
});

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
