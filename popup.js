document.getElementById('startButton').addEventListener('click', function() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const csvData = event.target.result;
            const twitterUrls = parseCSV(csvData);
            
            // Send the URLs to the background script to start the process
            chrome.runtime.sendMessage({ urls: twitterUrls });
        };

        reader.readAsText(file);
    }
});

function parseCSV(data) {
    const urls = [];
    const rows = data.split('\n');

    for (let i = 0; i < rows.length; i++) {
        const trimmedUrl = rows[i].trim();
        if (trimmedUrl !== '') {
            if (!trimmedUrl.startsWith('https')) {
                urls.push('https://x.com' + trimmedUrl);
            } else {
                urls.push(trimmedUrl);
            }
        }
    }

    return urls;
}
