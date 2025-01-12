let currentSettings = {
  videoWidth: 300,
  columns: 3,
};

// Create style element
const styleEl = document.createElement("style");
styleEl.id = "yt-grid-customizer-style";
document.head.appendChild(styleEl);

// Load saved settings
chrome.storage.sync.get(
  {
    videoWidth: 300,
    columns: 3,
  },
  function (items) {
    currentSettings = items;
    applySettings();
  }
);

// Listen for settings updates
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "UPDATE_GRID_SETTINGS") {
    currentSettings = request.settings;
    applySettings();
  }
});

function applySettings() {
  const css = `
    ytd-rich-grid-renderer {
      --ytd-rich-grid-items-per-row: ${currentSettings.columns} !important;
      --ytd-rich-grid-item-max-width: ${currentSettings.videoWidth}px !important;
      --ytd-rich-grid-mini-items-per-row: ${currentSettings.columns} !important;
    }
    
    ytd-rich-item-renderer {
      max-width: ${currentSettings.videoWidth}px !important;
      min-width: 0 !important;
    }
    
    ytd-rich-grid-row {
      display: grid !important;
      grid-template-columns: repeat(${currentSettings.columns}, 1fr) !important;
      gap: 16px !important;
      padding: 0 16px !important;
    }
  `;

  styleEl.textContent = css;
}

// Watch for YouTube SPA navigation
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      if (document.querySelector("ytd-rich-grid-renderer")) {
        applySettings();
        break;
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
