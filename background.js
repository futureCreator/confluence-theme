// background.js — Service worker for Confluence Theme extension

chrome.runtime.onInstalled.addListener(() => {
  // Set default settings on install
  chrome.storage.sync.get(["themeId", "urlPatterns", "enabled"], (data) => {
    const defaults = {};
    if (!data.themeId) defaults.themeId = "catppuccin-mocha";
    if (!data.urlPatterns) defaults.urlPatterns = [];
    if (data.enabled === undefined) defaults.enabled = true;

    if (Object.keys(defaults).length > 0) {
      chrome.storage.sync.set(defaults);
    }
  });
});

// Re-inject content script when navigating (for SPAs like Confluence)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;
  if (!tab.url || tab.url.startsWith("chrome://")) return;

  chrome.storage.sync.get(["themeId", "urlPatterns", "enabled"], (data) => {
    const { themeId, urlPatterns = [], enabled = true } = data;
    if (!enabled || !themeId || urlPatterns.length === 0) return;

    // Check if this tab's URL matches any stored pattern
    const matches = urlPatterns.some((pattern) => matchesPattern(tab.url, pattern));
    if (!matches) return;

    // Inject scripts into matching tab
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["themes.js", "content.js"],
    }).catch(() => {
      // Ignore errors for restricted pages
    });
  });
});

function matchesPattern(url, pattern) {
  try {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*");
    const regex = new RegExp(`^${escaped}`, "i");
    const urlObj = new URL(url);
    return regex.test(url) || regex.test(urlObj.hostname);
  } catch {
    return false;
  }
}
