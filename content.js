(function() {
    'use strict';

    function prefetchPage(url) {
        // Remove any existing prefetch iframe to ensure a fresh one is created
        const existingPrefetchFrame = document.getElementById('prefetch-frame');
        if (existingPrefetchFrame) {
            existingPrefetchFrame.remove();
        }

        console.log('Appending new prefetch iframe');
        // Create a new invisible iframe for prefetching
        const prefetchFrame = document.createElement('iframe');
        prefetchFrame.style.display = 'none'; // Hide the prefetch iframe
        prefetchFrame.style.width = '100%'; // Full width
        prefetchFrame.style.height = '100vh'; // Full height
        prefetchFrame.style.border = 'none'; // No border
        prefetchFrame.id = 'prefetch-frame';
        prefetchFrame.src = url;

        // Append the iframe to the document for prefetching
        document.body.appendChild(prefetchFrame);

        prefetchFrame.onload = () => {
            console.log(`Prefetched page loaded in iframe: ${url}`);
        };
    }

    function loadPrefetchedPage() {
        const prefetchFrame = document.getElementById('prefetch-frame');

        if (!prefetchFrame) {
            console.error('Prefetched iframe not found.');
            return;
        }

        try {

            // Remove all other content from the document body except the main frame
            const bodyChildren = Array.from(document.body.children);
            bodyChildren.forEach((child) => {
                if (child.id !== 'prefetch-frame') {
                    document.body.removeChild(child);
                }
            });

            // Make the prefetch iframe visible
            prefetchFrame.style.display = 'block';
            prefetchFrame.id = 'main-frame'; // Rename to indicate it's now the main content

            // Set up for the next prefetch
            console.log('Setting up for next prefetch');
            const mainFrame = prefetchFrame;
            const nextStudentElement = mainFrame.contentWindow.document.querySelector(
                '#next-student'
            );

            nextStudentElement.setAttribute('href', 'javascript:void(0)');
            nextStudentElement.removeEventListener('click', loadPrefetchedPage); // Avoid duplicate listeners
            nextStudentElement.addEventListener('click', loadPrefetchedPage);

            if (nextStudentElement) {
                const nextUrl = nextStudentElement.getAttribute('data-href');
                if (nextUrl) {
                    prefetchPage(nextUrl);
                }
            } else {
                console.log('No next student element found in the current frame.');
            }
        } catch (error) {
            console.error('Error while replacing content:', error);
        }
    }

    function addPrefetchAndUpdateHref(elementId) {
        const element = document.querySelector(elementId);

        if (element) {
            const url = element.getAttribute('data-href');
            if (url) {
                // Prefetch the next page
                prefetchPage(url);

                // Update the click handler to load the prefetched page
                element.setAttribute('href', 'javascript:void(0)');
                element.removeEventListener('click', loadPrefetchedPage); // Avoid duplicate listeners
                element.addEventListener('click', loadPrefetchedPage);
            }
        }
    }

    window.addEventListener('load', function() {
        // Prefetch the initial page for the next student
        const initialUrl =
            'https://submitty.cs.rpi.edu/courses/f24/csci4968/gradeable/Mid-Year-Review/rubric';
        prefetchPage(initialUrl);

        // Set up navigation for '#next-student'
        addPrefetchAndUpdateHref('#next-student');

        console.log('Started prefetching');
    });
})();
