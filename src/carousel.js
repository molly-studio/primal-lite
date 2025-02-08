console.log("Primal: Carousel.js loading");

// Function to load a script and return a promise
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onerror = reject;
        script.onload = resolve;
        document.head.appendChild(script);
    });
}

// Load dependencies first, then initialize your carousel
Promise.all([
    loadScript('https://unpkg.com/embla-carousel/embla-carousel.umd.js'),
    loadScript('https://unpkg.com/embla-carousel-wheel-gestures/dist/embla-carousel-wheel-gestures.umd.js')
]).then(() => {
    console.log("Primal: Carousel dependencies loaded");
    
    console.log("Primal: EmblaPrimal.js loaded")

    const isTouchDevice = window.matchMedia("(hover: none)").matches
    const getCSSVariable = (variable) => getComputedStyle(document.documentElement).getPropertyValue(
        variable).trim()
    const isSpecialDomain = ["primal-molly.webflow.io", "primal.site"].includes(window.location
        .hostname)
    const desktopPaddingVar = isSpecialDomain ? "--container--padding--desktop" :
        "--primal-library---container--padding--desktop"
    const tabletPaddingVar = isSpecialDomain ? "--container--padding--tablet" :
        "--primal-library---container--padding--tablet"
    const mobilePaddingVar = isSpecialDomain ? "--container--padding--mobile" :
        "--primal-library---container--padding--mobile"

    const EMBLA_OPTIONS = {
        standard: {
            loop: false,
            speed: 5,
            dragFree: true,
            dragThreshold: 10,
            align: "start",
            containScroll: "trimSnaps"
        },
        plus: {
            loop: false,
            speed: 5,
            dragFree: false,
            dragThreshold: 10,
            align: "start",
            containScroll: false
        }
    }

    const getBreakpointPadding = () => {
        const width = window.innerWidth
        if (width >= 992) return `calc(${getCSSVariable(desktopPaddingVar)} / 2)`
        if (width >= 768) return `calc(${getCSSVariable(tabletPaddingVar)} / 2)`
        return `calc(${getCSSVariable(mobilePaddingVar)} / 2)`
    }

    const getFullBreakpointPadding = () => {
        const width = window.innerWidth
        if (width >= 992) return getCSSVariable(desktopPaddingVar)
        if (width >= 768) return getCSSVariable(tabletPaddingVar)
        return getCSSVariable(mobilePaddingVar)
    }

    const getNegativePadding = () => {
        const width = window.innerWidth
        if (width >= 992) return `-${getCSSVariable(desktopPaddingVar)}`
        if (width >= 768) return `-${getCSSVariable(tabletPaddingVar)}`
        return `-${getCSSVariable(mobilePaddingVar)}`
    }

    const emblaNodes = document.querySelectorAll('[primal-embla="embla"], [primal-embla="embla-plus"]')
    emblaNodes.forEach((emblaNode) => {
        const isPlus = emblaNode.getAttribute('primal-embla') === 'embla-plus'
        setupCarousel(emblaNode, isPlus)
    })

    function setupCarousel(emblaNode, isPlus) {
        const emblaContainer = emblaNode.querySelector('[primal-embla="container"]')
        if (!emblaContainer) return

        const slides = Array.from(emblaContainer.children)

        if (isTouchDevice) {
            setupTouchDevice(emblaContainer, slides, isPlus)
        } else {
            setupEmblaCarousel(emblaNode, emblaContainer, slides, isPlus)
        }
    }

    function setupTouchDevice(container, slides, isPlus) {
        container.style.overflowX = "scroll"
        container.style.scrollSnapType = "x mandatory"

        const paddingValue = getBreakpointPadding()
        const negativePadding = getNegativePadding()
        const fullPadding = getFullBreakpointPadding()

        // Add padding to the container itself
        container.style.paddingLeft = fullPadding
        container.style.paddingRight = fullPadding
        
        // Apply negative margins for full-width behavior
        container.style.marginLeft = negativePadding
        container.style.marginRight = negativePadding
        container.style.scrollPaddingLeft = getCSSVariable(mobilePaddingVar)

        const startBuffer = document.createElement("div")
        const endBuffer = document.createElement("div")
        startBuffer.style.width = paddingValue
        endBuffer.style.width = paddingValue
        container.insertBefore(startBuffer, container.firstChild)
        container.appendChild(endBuffer)

        slides.forEach(slide => {
            slide.style.scrollSnapAlign = "start"
            if (isPlus) {
                slide.style.transition = 'transform 300ms ease-out'
                slide.style.transform = 'scale(0.9)'
            }
        })

        // Add resize listener to update padding on breakpoint changes
        const updatePadding = () => {
            const newFullPadding = getFullBreakpointPadding()
            container.style.paddingLeft = newFullPadding
            container.style.paddingRight = newFullPadding
            
            const newNegativePadding = getNegativePadding()
            container.style.marginLeft = newNegativePadding
            container.style.marginRight = newNegativePadding
        }

        window.addEventListener('resize', updatePadding)

        if (isPlus) {
            container.addEventListener('scroll', () => {
                const containerRect = container.getBoundingClientRect()

                slides.forEach(slide => {
                    const slideRect = slide.getBoundingClientRect()
                    const isActive = slideRect.left >= containerRect.left &&
                        slideRect.right <= containerRect.right

                    slide.style.transform = isActive ? 'scale(1)' : 'scale(0.9)'
                })
            }, { passive: true })
        }
    }

    function setupEmblaCarousel(node, container, slides, isPlus) {
        const options = isPlus ? EMBLA_OPTIONS.plus : EMBLA_OPTIONS.standard

        const plugins = [
            EmblaCarouselWheelGestures({
                target: null,
                forceWheelAxis: null,
                interval: 32,
                precision: 15,
                canScroll: (embla) => embla.canScrollNext() || embla.canScrollPrev(),
            })
        ]

        const embla = EmblaCarousel(node, options, plugins)

        if (isPlus) {
            const removeTweenScale = setupTweenScale(embla, slides)
            embla.on('destroy', removeTweenScale)
        }
    }

    function setupTweenScale(emblaApi, slides) {
        const TWEEN_FACTOR = 0.3

        function tweenScale() {
            const scrollProgress = emblaApi.scrollProgress()

            emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
                const diffToTarget = scrollSnap - scrollProgress
                const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR)
                const scale = Math.min(Math.max(tweenValue, 0.9), 1).toString()

                slides[snapIndex].style.transform = `scale(${scale})`
            })
        }

        tweenScale()
        emblaApi.on('scroll', tweenScale)

        return () => {
            slides.forEach(slide => slide.removeAttribute('style'))
        }
    }

}).catch(error => {
    console.error("Error loading carousel dependencies:", error);
});
