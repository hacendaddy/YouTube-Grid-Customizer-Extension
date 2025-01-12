document.addEventListener("DOMContentLoaded", function () {
  const videoWidthInput = document.getElementById("videoWidth");
  const videoWidthValue = document.getElementById("videoWidthValue");
  const columnsInput = document.getElementById("columnsCount");
  const columnsValue = document.getElementById("columnsValue");

  // Load saved settings
  chrome.storage.sync.get(
    {
      videoWidth: 300,
      columns: 3,
    },
    function (items) {
      videoWidthInput.value = items.videoWidth;
      videoWidthValue.textContent = items.videoWidth;
      columnsInput.value = items.columns;
      columnsValue.textContent = items.columns;
    }
  );

  // Debounce function to prevent too many updates
  let timeout;
  function debounce(func, delay) {
    clearTimeout(timeout);
    timeout = setTimeout(func, delay);
  }

  // Update settings when changed
  function updateSettings() {
    const settings = {
      videoWidth: parseInt(videoWidthInput.value),
      columns: parseInt(columnsInput.value),
    };

    chrome.storage.sync.set(settings);

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].url.includes("youtube.com")) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "UPDATE_GRID_SETTINGS",
          settings: settings,
        });
      }
    });
  }

  videoWidthInput.addEventListener("input", function () {
    videoWidthValue.textContent = this.value;
    debounce(updateSettings, 100);
  });

  columnsInput.addEventListener("input", function () {
    columnsValue.textContent = this.value;
    debounce(updateSettings, 100);
  });
});
