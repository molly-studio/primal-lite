console.log("Primal: News.js loaded")

const style = document.createElement('style');
style.textContent = `
    [primal="news-item"] {
        opacity: 0;
        transition: all 0.3s ease;
    }
    [primal="news-item"][data-state] {
        opacity: 1;
    }
`;
document.head.appendChild(style);

const delay = 3000;

function applyItemStyles(items) {
    items.forEach((item, index) => {
        const state = parseInt(item.dataset.state);
        const zIndex = items.length - state + 1;
        
        let yOffset, zOffset, scale, opacity;
        
        if (state === 1) {
            yOffset = 0;
            zOffset = 0;
            scale = 1;
            opacity = 1;
        } else if (state === 2) {
            yOffset = 12;
            zOffset = -105;
            scale = 0.95;
            opacity = 0.65;
        } else {
            yOffset = 24;
            zOffset = -210;
            scale = 0.9;
            opacity = state === 3 ? 0.3 : 0;
        }
        
        item.style.zIndex = zIndex;
        item.style.position = state === 1 ? 'relative' : 'absolute';
        item.style.left = state === 1 ? '' : '0';
        item.style.right = state === 1 ? '' : '0';
        item.style.bottom = state === 1 ? '' : '0';
        item.style.opacity = opacity;
        item.style.transform = `translate3d(0px, ${yOffset}px, ${zOffset}px) scale(${scale})`;
    });
}

function rotateStates(items) {
    // Store current states
    const currentStates = items.map(item => parseInt(item.dataset.state));
    
    // Update states
    items.forEach((item, index) => {
        const currentState = currentStates[index];
        // If it's state 1, move to last position
        if (currentState === 1) {
            item.dataset.state = items.length.toString();
        } else {
            // Otherwise, move up one position
            item.dataset.state = (currentState - 1).toString();
        }
    });
    
    applyItemStyles(items);
}

function initializeNewsStack() {
    const newsWrapper = document.querySelector('[primal="news"]');
    if (!newsWrapper) return;

    const newsItems = Array.from(newsWrapper.querySelectorAll('[primal="news-item"]'));
    if (newsItems.length === 0) return;

    // Initialize states (1 is front, increasing numbers go back)
    newsItems.forEach((item, index) => {
        item.dataset.state = (index + 1).toString();
    });
    applyItemStyles(newsItems);

    setInterval(() => {
        rotateStates(newsItems);
    }, delay);
}

// Run immediately
initializeNewsStack();
