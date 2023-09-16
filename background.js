let code_hit_follow = `
function getSpansByTextContent(text) {
  return Array.from(document.querySelectorAll('span')).filter(span => span.textContent.trim() === text);
}

// Usage:
const matchingSpans = getSpansByTextContent('Follow');
matchingSpans.forEach(span => {
  // Do something with each span
  console.log(span);
  span.click()
});

`
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.urls) {
        twitterUrls = message.urls;
        openTwitterProfileAndFollow();
    }
});

let twitterUrls = [];
let currentIndex = 0;

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// function openTwitterProfileAndFollow() {
//     if (currentIndex >= twitterUrls.length) {
//         console.log("All profiles processed!");
//         return;
//     }

//     // Get the current active tab
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//         let currentTab = tabs[0];  // There will be only one in this array
        
//         // Update the current tab's URL to the next Twitter profile URL
//         chrome.tabs.update(currentTab.id, {url: twitterUrls[currentIndex]}, function() {
//             setTimeout(() => {
//                 // Try to click the follow button after waiting for the page to load
//                 chrome.tabs.executeScript(currentTab.id, {
//                     code: `
//                     function getSpansByTextContent(text) {
//                       return Array.from(document.querySelectorAll('span')).filter(span => span.textContent.trim() === text);
//                     }
                    
//                     // Usage:
//                     const matchingSpans = getSpansByTextContent('Follow');
//                     matchingSpans.forEach(span => {
//                       const text = span.textContent.trim();
//                       if (text.includes("Follow") && !text.includes("Following")){
//                         span.click()
//                       }
//                       // Do something with each span
//                       console.log(span);
                      
//                     });
                    
//                     `
//                 }, function() {
//                     currentIndex++;
//                     // Move on to the next profile after a delay, reusing the same tab
//                     setTimeout(openTwitterProfileAndFollow, randomBetween(10000, 20000));
//                 });
//             }, 5000);  // Waiting 7 seconds for the page to load might need adjustment
//         });
//     });
// }

function openTwitterProfileAndFollow() {
    if (currentIndex >= twitterUrls.length) {
        console.log("All profiles processed!");
        return;
    }

    // Get the current active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let currentTab = tabs[0];  // There will be only one in this array
        
        // Update the current tab's URL to the next Twitter profile URL
        chrome.tabs.update(currentTab.id, {url: twitterUrls[currentIndex]});

        // Add a one-time listener for tab updates
        chrome.tabs.onUpdated.addListener(handleTabUpdate);
    });
}

function handleTabUpdate(tabId, changeInfo, tab) {
    // Check if the tab's status is "complete"
    if (changeInfo.status === 'complete') {
        // Remove the listener to avoid multiple invocations
        chrome.tabs.onUpdated.removeListener(handleTabUpdate);

        setTimeout(() => {
            // Try to click the follow button after waiting for the page to load
            chrome.tabs.executeScript(tabId, {
                code: `
                function getSpansByTextContent(text) {
                    return Array.from(document.querySelectorAll('span')).filter(span => span.textContent.trim() === text);
                  }
                  
                  // Usage:
                  const matchingSpans = getSpansByTextContent('Follow');
                  matchingSpans.forEach(span => {
                    // Do something with each span
                    console.log(span);
                    span.click()
                  });
                `
            }, function(result) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                }

                currentIndex++;
                // Move on to the next profile after a delay, reusing the same tab
                setTimeout(openTwitterProfileAndFollow, randomBetween(5000, 10000));
            });
        }, 3000);  // Waiting 5 seconds for the page to load might need adjustment
    }
}
