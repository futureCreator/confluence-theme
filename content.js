// content.js — Applies theme CSS to Confluence pages
// Runs on all URLs; checks if current URL matches user-defined patterns

const STYLE_ID = "confluence-theme-injected";
const FONT_STYLE_ID = "confluence-theme-fonts";

function matchesPattern(url, pattern) {
  try {
    // Convert simple wildcard pattern to regex
    // Supports: *.atlassian.net, company.atlassian.net, https://...
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*");
    const regex = new RegExp(`^${escaped}`, "i");
    const urlObj = new URL(url);
    // Match against full URL or just hostname
    return regex.test(url) || regex.test(urlObj.hostname);
  } catch {
    return false;
  }
}

function injectFonts() {
  if (document.getElementById(FONT_STYLE_ID)) return;

  // Load Pretendard from CDN
  const pretendardLink = document.createElement("link");
  pretendardLink.rel = "stylesheet";
  pretendardLink.href =
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css";

  // Load JetBrains Mono from Google Fonts
  const jbMonoLink = document.createElement("link");
  jbMonoLink.rel = "stylesheet";
  jbMonoLink.href =
    "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap";

  const marker = document.createElement("meta");
  marker.id = FONT_STYLE_ID;

  document.head.appendChild(pretendardLink);
  document.head.appendChild(jbMonoLink);
  document.head.appendChild(marker);
}

function buildCSS(theme) {
  return `
/* ===== Confluence Theme: ${theme.name} ===== */

/* --- Base Layout --- */
html, body,
#app, #confluence, #main,
#product-container, #full-height-container,
.css-1k1axy4, .css-5uzxfm,
[data-testid="content"],
#AkMainContent,
.page-content-container,
.page-wrapper-container,
.ia-splitter-main {
  background-color: ${theme.bg} !important;
  color: ${theme.fg} !important;
}

/* --- Typography --- */
body, p, li, td, th, span, div,
.ak-renderer-document,
.wiki-content,
#content-body, #main-content {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif !important;
  color: ${theme.fg} !important;
}

/* --- Navigation / Header --- */
#product-navbar,
nav[aria-label="Confluence navigation"],
header[role="banner"],
[data-testid="navigation-container"],
[data-testid="product-navigation"],
.css-4b1r0h,
#header,
.aui-header,
.ia-fixed-sidebar,
#navigation {
  background-color: ${theme.bgAlt} !important;
  border-bottom-color: ${theme.surface} !important;
  border-right-color: ${theme.surface} !important;
}

/* --- Sidebar / Space Navigation --- */
[data-testid="left-sidebar"],
[data-testid="left-sidebar-container"],
aside, aside nav,
.space-sidebar,
.ia-splitter-left,
.sidebar, #sidebar,
[class*="LeftSidebar"],
[class*="left-sidebar"] {
  background-color: ${theme.bgAlt} !important;
  border-right-color: ${theme.surface} !important;
}

/* --- Nav Links --- */
nav a, aside a, header a,
[data-testid="left-sidebar"] a,
[role="navigation"] a,
#navigation a, .ia-splitter-left a {
  color: ${theme.fg} !important;
}

nav a:hover, aside a:hover,
[data-testid="left-sidebar"] a:hover {
  background-color: ${theme.surface} !important;
  color: ${theme.fg} !important;
  border-radius: 6px !important;
}

/* --- Main Content --- */
.ak-renderer-document,
[data-testid="renderer-content"],
.wiki-content, .view-content,
#content-body, #main-content,
[class*="content-body"],
[class*="page-content"],
.content-container,
#content .aui-page-panel-content {
  background-color: ${theme.bg} !important;
  color: ${theme.fg} !important;
}

/* --- Page Title --- */
h1[data-testid="page-title"],
.page-title, .page-header h1,
#title-text, #title-text a,
.page-metadata-banner h1 {
  color: ${theme.fg} !important;
}

/* --- Headings --- */
.ak-renderer-document h1,
.ak-renderer-document h2,
.ak-renderer-document h3,
.ak-renderer-document h4,
.ak-renderer-document h5,
.ak-renderer-document h6,
.wiki-content h1, .wiki-content h2,
.wiki-content h3, .wiki-content h4,
.wiki-content h5, .wiki-content h6,
#content h1, #content h2,
#content h3, #content h4 {
  color: ${theme.fg} !important;
}

/* --- Links --- */
.ak-renderer-document a,
.wiki-content a,
#content a, #main-content a {
  color: ${theme.blue} !important;
}

.ak-renderer-document a:hover,
.wiki-content a:hover {
  color: ${theme.cyan} !important;
}

/* --- Code Blocks --- */
.code-block, .CodeBlock,
[data-testid="renderer-code-block"],
[class*="CodeBlock"],
.syntaxhighlighter, .highlight,
pre, .code-macro {
  background-color: ${theme.surface} !important;
  border: 1px solid ${theme.bgAlt} !important;
  border-radius: 8px !important;
}

.code-block code, .CodeBlock code,
pre code, pre span,
.syntaxhighlighter span,
.highlight span {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Consolas, monospace !important;
  color: ${theme.fg} !important;
  background-color: transparent !important;
}

/* Syntax highlighting colors */
.syntaxhighlighter .keyword, .hljs-keyword { color: ${theme.purple} !important; }
.syntaxhighlighter .string, .hljs-string { color: ${theme.green} !important; }
.syntaxhighlighter .comment, .hljs-comment { color: ${theme.fgMuted} !important; font-style: italic !important; }
.syntaxhighlighter .number, .hljs-number { color: ${theme.orange} !important; }
.syntaxhighlighter .function, .hljs-function { color: ${theme.blue} !important; }
.syntaxhighlighter .type, .hljs-type { color: ${theme.yellow} !important; }

/* --- Inline Code --- */
.ak-renderer-document code:not(pre code),
.wiki-content code:not(pre code),
#content code:not(pre code) {
  font-family: 'JetBrains Mono', monospace !important;
  background-color: ${theme.surface} !important;
  color: ${theme.cyan} !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 0.1em 0.4em !important;
  font-size: 0.875em !important;
}

/* --- Tables --- */
.ak-renderer-document table,
.wiki-content table,
.confluenceTable, table.aui {
  border-color: ${theme.surface} !important;
  background-color: ${theme.bg} !important;
}

.ak-renderer-document th,
.wiki-content th, .confluenceTh,
table.aui th {
  background-color: ${theme.bgAlt} !important;
  color: ${theme.fg} !important;
  border-color: ${theme.surface} !important;
}

.ak-renderer-document td,
.wiki-content td, .confluenceTd,
table.aui td {
  background-color: ${theme.bg} !important;
  color: ${theme.fg} !important;
  border-color: ${theme.surface} !important;
}

.ak-renderer-document tr:nth-child(even) td,
.wiki-content tr:nth-child(even) td {
  background-color: ${theme.bgAlt} !important;
}

/* --- Panels / Callouts --- */
[data-node-type="panel"],
.ak-editor-panel,
.confluence-information-macro,
.panel, .aui-message,
[class*="Panel"] {
  background-color: ${theme.bgAlt} !important;
  border-radius: 8px !important;
  border-left-color: ${theme.blue} !important;
}

[data-panel-type="info"] { border-left-color: ${theme.blue} !important; }
[data-panel-type="note"] { border-left-color: ${theme.yellow} !important; }
[data-panel-type="warning"] { border-left-color: ${theme.orange} !important; }
[data-panel-type="error"] { border-left-color: ${theme.red} !important; }
[data-panel-type="success"] { border-left-color: ${theme.green} !important; }

.confluence-information-macro-information { border-left-color: ${theme.blue} !important; }
.confluence-information-macro-warning { border-left-color: ${theme.orange} !important; }
.confluence-information-macro-tip { border-left-color: ${theme.green} !important; }
.confluence-information-macro-note { border-left-color: ${theme.yellow} !important; }

.panel p, .aui-message p,
[data-node-type="panel"] p {
  color: ${theme.fg} !important;
}

/* --- Blockquotes --- */
.ak-renderer-document blockquote,
.wiki-content blockquote {
  border-left: 3px solid ${theme.purple} !important;
  background-color: ${theme.bgAlt} !important;
  color: ${theme.fg} !important;
  border-radius: 0 6px 6px 0 !important;
  padding: 8px 16px !important;
}

/* --- Horizontal Rules --- */
.ak-renderer-document hr, .wiki-content hr,
hr.ak-renderer-rule { border-color: ${theme.surface} !important; }

/* --- Breadcrumbs --- */
.breadcrumbs, #breadcrumbs,
[data-testid="breadcrumbs"],
[class*="breadcrumb"],
#header-breadcrumbs {
  color: ${theme.fgMuted} !important;
}

.breadcrumbs a, #breadcrumbs a,
[data-testid="breadcrumbs"] a {
  color: ${theme.fgMuted} !important;
}

.breadcrumbs a:hover, #breadcrumbs a:hover {
  color: ${theme.fg} !important;
}

/* --- Page Metadata --- */
[data-testid="page-metadata-container"],
.page-metadata-modification-info,
.page-metadata, .lastModified,
#page-metadata-container {
  color: ${theme.fgMuted} !important;
}

/* --- Expand/Collapse Macros --- */
.expand-container, .expand-title,
[data-macro-name="expand"],
[class*="expand"],
.aui-expander-content,
.aui-expander-trigger {
  background-color: ${theme.bgAlt} !important;
  color: ${theme.fg} !important;
  border-color: ${theme.surface} !important;
}

/* --- Macro containers --- */
[data-macro-name],
.macro-body, .conf-macro {
  background-color: ${theme.bgAlt} !important;
  color: ${theme.fg} !important;
  border-color: ${theme.surface} !important;
}

/* --- AUI Components --- */
.aui-label, .badge,
.aui-badge, .aui-lozenge {
  background-color: ${theme.surface} !important;
  color: ${theme.fg} !important;
  border-color: ${theme.bgAlt} !important;
}

.aui-nav, .aui-navgroup,
.aui-page-panel, .aui-page-panel-content {
  background-color: ${theme.bg} !important;
  color: ${theme.fg} !important;
  border-color: ${theme.surface} !important;
}

/* --- Search & Dialog --- */
[data-testid="search-dialog"],
.aui-dialog, .aui-dialog2,
.aui-dialog2-content {
  background-color: ${theme.bgAlt} !important;
  color: ${theme.fg} !important;
  border-color: ${theme.surface} !important;
}

/* --- Form Elements --- */
input[type="text"], input[type="search"],
textarea, select {
  background-color: ${theme.surface} !important;
  color: ${theme.fg} !important;
  border-color: ${theme.bgAlt} !important;
}

/* --- Scrollbar --- */
* { scrollbar-color: ${theme.surface} ${theme.bgAlt}; scrollbar-width: thin; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: ${theme.bgAlt}; }
::-webkit-scrollbar-thumb { background: ${theme.surface}; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: ${theme.fgMuted}; }

/* --- Page restrictions indicator --- */
[data-testid="page-restrictions-icon"] { color: ${theme.fgMuted} !important; }

/* --- Toolbar (editor) --- */
[data-testid="toolbar-container"],
[class*="toolbar"], .aui-toolbar2,
.toolbar-container {
  background-color: ${theme.bgAlt} !important;
  border-color: ${theme.surface} !important;
}
`;
}

function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return;

  injectFonts();

  let styleEl = document.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = buildCSS(theme);
}

function removeTheme() {
  const styleEl = document.getElementById(STYLE_ID);
  if (styleEl) styleEl.remove();
}

function init() {
  chrome.storage.sync.get(["themeId", "urlPatterns", "enabled"], (data) => {
    const { themeId, urlPatterns = [], enabled = true } = data;
    if (!enabled || !themeId) return;

    const currentUrl = window.location.href;
    const shouldApply = urlPatterns.some((pattern) =>
      matchesPattern(currentUrl, pattern)
    );

    if (shouldApply) applyTheme(themeId);
  });
}

// Listen for storage changes (theme switched in popup while page is open)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;

  chrome.storage.sync.get(["themeId", "urlPatterns", "enabled"], (data) => {
    const { themeId, urlPatterns = [], enabled = true } = data;
    const currentUrl = window.location.href;
    const shouldApply =
      enabled &&
      themeId &&
      urlPatterns.some((pattern) => matchesPattern(currentUrl, pattern));

    if (shouldApply) {
      applyTheme(themeId);
    } else {
      removeTheme();
    }
  });
});

init();
