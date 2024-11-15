(function() {
    'use strict';

    function getAnonId() {
        return $('#anon-id').attr('data-anon_id');
    }

    function prefetch(url) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prerender';
        prefetchLink.href = url;
        document.head.appendChild(prefetchLink);
    }



    function gotoNextStudent() {
        let filter;
        const navigate_assigned_students_only = localStorage.getItem('general-setting-navigate-assigned-students-only') !== 'false';

        const inquiry_status = Cookies.get('inquiry_status');
        if (inquiry_status === 'on') {
            filter = 'active-inquiry';
        }
        else {
            if (localStorage.getItem('general-setting-arrow-function') !== 'active-inquiry') {
                filter = localStorage.getItem('general-setting-arrow-function') || 'default';
            }
            else {
                filter = 'default';
            }
        }
        const selector = '#next-student';
        let window_location = `${$(selector)[0].dataset.href}&filter=${filter}`;

        switch (filter) {
            case 'ungraded':
                window_location += `&component_id=${getFirstOpenComponentId()}`;
                break;
            case 'itempool':
                window_location += `&component_id=${getFirstOpenComponentId(true)}`;
                break;
            case 'ungraded-itempool':
                component_id = getFirstOpenComponentId(true);
                if (component_id === NO_COMPONENT_ID) {
                    component_id = getFirstOpenComponentId();
                }
                break;
            case 'inquiry':
                window_location += `&component_id=${getFirstOpenComponentId()}`;
                break;
            case 'active-inquiry':
                window_location += `&component_id=${getFirstOpenComponentId()}`;
                break;
        }

        if (!navigate_assigned_students_only) {
            window_location += '&navigate_assigned_students_only=false';
        }

        if (getGradeableId() !== '') {
            closeAllComponents(true).then(() => {
                waitForAllAjaxToComplete(() => {
                    window.location = window_location;
                });
            }).catch(() => {
                if (confirm('Could not save open component, change student anyway?')) {
                    window.location = window_location;
                }
            });
        }
        else {
            window.location = window_location;
        }
    }

    // function waitForElements(selectors, callback) {
    //     // Convert selectors into an array if not already
    //     const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    //
    //     const elementsFound = new Set();
    //
    //     const observer = new MutationObserver(() => {
    //         selectorArray.forEach(selector => {
    //             if (!elementsFound.has(selector) && document.querySelector(selector)) {
    //                 elementsFound.add(selector);
    //
    //                 // Check if all selectors have been found
    //                 if (elementsFound.size === selectorArray.length) {
    //                     observer.disconnect();  // Stop observing
    //                     callback();  // Execute callback
    //                 }
    //             }
    //         });
    //     });
    //
    //     observer.observe(document.documentElement, { childList: true, subtree: true });
    // }
    //
    // // Usage:
    // waitForElements(['#component-list'], () => {
    //     // alert("It's loaded!")
    //     console.log('All specified elements are found on the page!');
    // });

    function addPrefetchAndUpdateHref(elementId) {
        const element = document.querySelector(elementId);
        if (element) {
            const url = element.getAttribute('data-href');
            if (url) {


                // Create and append prefetch link
                // const prefetchLink = document.createElement('link');
                // prefetchLink.rel = 'prerender';
                // prefetchLink.href = url;
                // document.head.appendChild(prefetchLink);
                //
                // // Update the href attribute
                // element.href = url;

                fetch(url, { cache: "force-cache" })
                    .then(response => {
                        if (response.ok) {
                            console.log("accessed prefetch")

                            prefetch(url);

                            // Update the href attribute
                            element.href = url;

                            return response.text();
                        } else {
                            throw new Error("Failed to fetch prefetch resource");
                        }
                    })
                    .then(htmlString => {
                        // Parse the HTML string into a document
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(htmlString, "text/html");

                        // Use querySelector to find the element and get the attribute
                        const nextStudentElement = doc.querySelector("#next-student");
                        const dataHref = nextStudentElement.getAttribute("data-href");
                        // const anonId = anonElement ? anonElement.getAttribute("data-anon_id") : null;

                        // Log or use the data-anon_id as needed
                        // console.log("data-anon_id:", doc);
                        // console.log("data-anon_id:", anonElement);

                        console.log(dataHref);
                        const next_url = new URL(dataHref, window.location.origin);

                        const fromValue = next_url.searchParams.get("from");

                        console.log("Extracted 'from' value:", fromValue);

                        // New anon_id value
                        const newAnonId = fromValue;

                        // Parse the original URL
                        const rubric_url = new URL(url);

                        // Trim the path to end at "/grading"
                        const pathSegments = rubric_url.pathname.split('/');
                        const gradingIndex = pathSegments.indexOf("grading");
                        if (gradingIndex !== -1) {
                            rubric_url.pathname = pathSegments.slice(0, gradingIndex + 1).join('/') + "/graded_gradeable";
                        }

                        // Set the new query parameters, clearing any previous ones
                        rubric_url.search = '';  // Clears all query parameters
                        rubric_url.searchParams.set("anon_id", newAnonId);
                        rubric_url.searchParams.set("all_peers", "false");

                        // Output the modified URL
                        const newUrl = rubric_url.toString();
                        console.log("New URL:", newUrl);
                        // console.log("data-anon_id:", anonId);

                        const prefetchLink = document.createElement('link');
                        prefetchLink.rel = 'prerender';
                        prefetchLink.href = newUrl;
                        document.head.appendChild(prefetchLink);

                    })
                    .catch(error => {
                        console.error("Error fetching or parsing HTML:", error);
                    });
            }
        }
    }


    window.addEventListener('load', function() {
        // alert("It's loaded!")
        prefetch("https://submitty.cs.rpi.edu/courses/f24/csci4968/gradeable/Mid-Year-Review/rubric");
        addPrefetchAndUpdateHref('#next-student');
        // addPrefetchAndUpdateHref('#prev-student');

        console.log("started prefetch")

        // url = "https://submitty.cs.rpi.edu/courses/f24/csci4968/gradeable/Mid-Year-Review/grading/graded_gradeable?anon_id=5tAsRm1UKCSPBAc&all_peers=false"
        //
        // const prefetchLink = document.createElement('link');
        // prefetchLink.rel = 'prerender';
        // prefetchLink.href = url;
        // document.head.appendChild(prefetchLink);
    })
    // setTimeout(() => {
    //     // Handle both next and previous student links
    //     addPrefetchAndUpdateHref('#next-student');
    //     addPrefetchAndUpdateHref('#prev-student');
    // }, 500);

})();

