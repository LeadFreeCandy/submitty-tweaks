(function() {
    'use strict';

    let nextIsReady = false;
    let nextIsClicked = false;
    let prevIsReady = false;
    let prevIsClicked = false;

    function prefetchPage(url, id, navigate_callback) {

        nextIsReady = false;
        nextIsClicked = false;
        prevIsReady = false;
        prevIsClicked = false;

        // Remove any existing prefetch iframe to ensure a fresh one is created
        console.log('Appending new prefetch iframe');
        // Create a new invisible iframe for prefetching
        const prefetchFrame = document.createElement('iframe');
        prefetchFrame.style.display = 'none'; // Hide the prefetch iframe
        prefetchFrame.style.width = '100%'; // Full width
        prefetchFrame.style.height = '100vh'; // Full height
        prefetchFrame.style.border = 'none'; // No border
        prefetchFrame.id = `prefetch-frame-${id}`;
        prefetchFrame.src = url;

        // Append the iframe to the document for prefetching
        document.body.appendChild(prefetchFrame);

        prefetchFrame.onload = () => {
            console.log(`Prefetched page loaded in iframe: ${url}`);
            nextIsReady = true;
            if (nextIsClicked) {
                navigate_callback()
            }
        };

    }

    function loadPrefetchedPage(id) {
        const prefetchFrame = document.getElementById(`prefetch-frame-${id}`);

        if (!prefetchFrame) {
            console.error('Prefetched iframe not found.');
            return;
        }

        try {

            // Remove all other content from the document body except the main frame
            const bodyChildren = Array.from(document.body.children);
            bodyChildren.forEach((child) => {
                if (child.id !== `prefetch-frame-${id}`) {
                    document.body.removeChild(child);
                }
            });

            // Make the prefetch iframe visible
            prefetchFrame.style.display = 'block';
            prefetchFrame.id = 'main-frame'; // Rename to indicate it's now the main content

            console.log("recursing")
            setPrefetchHref();
            // // Set up for the next prefetch
            // console.log('Setting up for next prefetch');
            // const mainFrame = prefetchFrame;
            // const nextStudentElement = mainFrame.contentWindow.document.querySelector(
            //     '#next-student'
            // );
            //
            // nextStudentElement.setAttribute('href', 'javascript:void(0)');
            // nextStudentElement.removeEventListener('click', loadPrefetchedPage); // Avoid duplicate listeners
            // nextStudentElement.addEventListener('click', loadPrefetchedPage);
            //
            // if (nextStudentElement) {
            //     const nextUrl = nextStudentElement.getAttribute('data-href');
            //     if (nextUrl) {
            //         prefetchPage(nextUrl);
            //     }
            // } else {
            //     console.log('No next student element found in the current frame.');
            // }
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

    function wrapPageInIframe() {
        // Check if main-frame already exists
        if (document.getElementById('main-frame')) {
            console.log('main-frame already exists. No wrapping performed.');
            return;
        }

        console.log('Wrapping the entire page in an iframe.');

        // Get the current page URL
        const currentUrl = window.location.href;

        // Create the main-frame iframe
        const mainFrame = document.createElement('iframe');
        mainFrame.id = 'main-frame';
        mainFrame.style.width = '100%';
        mainFrame.style.height = '100vh';
        mainFrame.style.border = 'none';
        mainFrame.src = currentUrl; // Set the iframe's src to the current page URL

        // Clear the body and append the iframe
        document.body.innerHTML = ''; // Clear the current body
        document.body.appendChild(mainFrame); // Add the iframe
    }

    function waitForElements(mainFrame, selectors, callback) {
        const observer = new MutationObserver(() => {
            const loadedElements = selectors.map(selector =>
                mainFrame.contentWindow.document.querySelector(selector)
            );

            if (loadedElements.every(el => el)) {
                observer.disconnect(); // Stop observing once all elements are found
                callback(loadedElements); // Pass the loaded elements to the callback
            }
        });

        // Start observing the iframe's document body
        const iframeBody = mainFrame.contentWindow.document.body;
        observer.observe(iframeBody, { childList: true, subtree: true });
    }

    function setPrefetchHref() {
        const mainFrame = document.getElementById('main-frame');

        if (!mainFrame) {
            console.log('main-frame does not exist');
            return;
        }

        const nextStudentElement = mainFrame.contentWindow.document.getElementById('next-student');
        const prevStudentElement = mainFrame.contentWindow.document.getElementById('prev-student');

        console.log(nextStudentElement);
        console.log(prevStudentElement);

        if (nextStudentElement && prevStudentElement) {
            console.log("elems already loaded so setting up");
            nextStudentElement.setAttribute('href', 'javascript:void(0)');
            prevStudentElement.setAttribute('href', 'javascript:void(0)');

            const nextUrl = nextStudentElement.getAttribute('data-href');
            prefetchPage(nextUrl, 'next');

            const prevUrl = prevStudentElement.getAttribute('data-href');
            prefetchPage(prevUrl, 'prev');

            console.log('Setting hrefs for next and prev elements');
            nextStudentElement.addEventListener('click', () => {
                loadPrefetchedPage('next');
            });
            prevStudentElement.addEventListener('click', () => {
                loadPrefetchedPage('prev');
            });
        } else {
            console.log('starting listener');
            mainFrame.addEventListener('load', () => {
                console.log('Waiting for elements...');
                waitForElements(mainFrame, ['#next-student', '#prev-student'], ([nextStudentElement, prevStudentElement]) => {
                    nextStudentElement.setAttribute('href', 'javascript:void(0)');
                    prevStudentElement.setAttribute('href', 'javascript:void(0)');

                    const nextUrl = nextStudentElement.getAttribute('data-href');
                    prefetchPage(nextUrl, 'next', () => {
                        loadPrefetchedPage('next');
                    });

                    const prevUrl = prevStudentElement.getAttribute('data-href');
                    prefetchPage(prevUrl, 'prev');

                    console.log('Setting hrefs for next and prev elements');
                    nextStudentElement.addEventListener('click', () => {
                        nextIsClicked = true;
                        if (nextIsReady) {
                            loadPrefetchedPage('next');
                        }
                    });
                    prevStudentElement.addEventListener('click', () => {
                        loadPrefetchedPage('prev');
                    });
                });
            });
        }
    }

    function setupPrefetches() {

    }

    window.addEventListener('load', function() {
        // Prefetch the initial page for the next student
        // addPrefetchAndUpdateHref('#next-student');
        wrapPageInIframe();
        setPrefetchHref();
        console.log('Started prefetching');
    });
})();
