(function() {
    'use strict';

    function addPrefetchAndUpdateHref(elementId) {
        const element = document.querySelector(elementId);
        if (element) {
            const url = element.getAttribute('data-href');
            if (url) {
                // Create and append prefetch link
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prerender';
                prefetchLink.href = url;
                document.head.appendChild(prefetchLink);

                // Update the href attribute
                element.href = url;
            }
        }
    }

    setTimeout(() => {
        // Handle both next and previous student links
        addPrefetchAndUpdateHref('#next-student');
        addPrefetchAndUpdateHref('#prev-student');
    }, 500);

})();

