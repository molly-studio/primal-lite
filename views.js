console.log("Primal: Views.js loaded")

document.addEventListener('DOMContentLoaded', () => {
  // Add initial CSS properties
  document.querySelectorAll('[primal="view-name"]').forEach(view => {
    view.style.cssText = `
      opacity: 0;
      display: none;
      transition: opacity 0.2s ease-in-out;
    `;
  });
  
  document.querySelectorAll('[primal="view-layout"]').forEach(layout => {
    layout.style.cssText = `
      transform: scale(0.95);
      transition: transform 0.9s var(--ease-out-elastic);
    `;
  });

  // Handle opening views
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement?.getAttribute('primal') === 'view-name') {
        targetElement.style.display = 'block';
        requestAnimationFrame(() => {
          targetElement.style.opacity = '1';
          targetElement.querySelector('[primal="view-layout"]').style.transform = 'scale(1)';
        });
      }
    });
  });

  // Handle closing views
  const closeL2 = (l2Sheet) => {
    l2Sheet.style.opacity = '0';
    l2Sheet.querySelector('[primal="view-layout"]').style.transform = 'scale(0.95)';
    
    l2Sheet.addEventListener('transitionend', () => {
      if (l2Sheet.style.opacity === '0') {
        l2Sheet.style.display = 'none';
      }
    }, { once: true });
  };

  // Close button handlers
  document.querySelectorAll('[primal="close"], [primal="view-bg"]').forEach(el => {
    el.addEventListener('click', () => {
      const l2Sheet = el.closest('[primal="view-name"]');
      if (l2Sheet) closeL2(l2Sheet);
    });
  });

  // Escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const visibleL2 = document.querySelector('[primal="view-name"][style*="display: block"]');
      if (visibleL2) closeL2(visibleL2);
    }
  });
});
