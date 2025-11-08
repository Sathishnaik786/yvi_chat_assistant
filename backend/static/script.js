// ----------------------------
// Global variables
// ----------------------------
let isLightTheme = false;
let isSidebarOpen = false;
let chatSessions = [];
let currentSessionId = null;
let messageFeedback = {};
let isListening = false;
let recognition = null;
let isMuted = false;
let synth = window.speechSynthesis;
let currentLanguage = 'en'; // Default language
let supportedLanguages = {
  'en': 'English',
  'hi': 'Hindi',
  'te': 'Telugu',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'ta': 'Tamil'
};

// ----------------------------
// DOM Elements
// ----------------------------
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const themeToggle = document.getElementById("theme-toggle");
const welcomeMessage = document.getElementById("welcome-message");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const newChatBtn = document.getElementById("new-chat-btn");
const chatHistoryBtn = document.getElementById("chat-history-btn");
const clearAllBtn = document.getElementById("clear-all-btn");
const settingsBtn = document.getElementById("settings-btn");
const chatHistoryList = document.getElementById("chat-history-list");
const chatHistoryItems = document.getElementById("chat-history-items");
const settingsPanel = document.getElementById("settings-panel");
const micBtn = document.getElementById("mic-btn");
const listeningIndicator = document.getElementById("listening-indicator");
const muteToggle = document.getElementById("mute-toggle");
const muteHeaderToggle = document.getElementById("mute-header-toggle");
const languageBtn = document.getElementById("language-btn");
const languageDropdown = document.getElementById("language-dropdown");
const languageOptions = document.querySelectorAll(".language-option");

// ----------------------------
// Language Functions
// ----------------------------
function detectLanguage(text) {
  // Simple language detection based on common words
  // In a real implementation, you would use a library like franc or implement a more sophisticated detection
  const languagePatterns = {
    'hi': /[\u0900-\u097F]/, // Devanagari script (Hindi)
    'te': /[\u0C00-\u0C7F]/, // Telugu script
    'ta': /[\u0B80-\u0BFF]/, // Tamil script
    'es': /\b(de|la|que|el|en|y|a|los|del|se|las|por|un|para|con|no|una|su|al|lo|como|más|pero|sus|le|ya|o|este|sí|porque|esta|entre|cuando|muy|sin|sobre|también|me|hasta|hay|donde|quien|desde|todo|nos|durante|todos|uno|les|ni|contra|otros|ese|eso|ante|ellos|e|esto|mi|antes|algunos|qué|unos|yo|otro|otras|otra|él|tanto|esa|estos|mucho|quienes|nada|muchos|cual|poco|ella|estar|estas|algunas|algo|nosotros|mi|mis|tus|te|ti|tu|tuyos|tuyo|mío|mía|míos|mías|tuyo|tuya|tuyos|tuyas|nuestro|nuestra|nuestros|nuestras|vuestro|vuestra|vuestros|vuestras)\b/i,
    'fr': /\b(le|de|un|être|et|à|il|avoir|ne|je|son|qui|se|la|ce|leur|ou|lui|si|mais|dans|du|pas|en|par|pour|au|sur|avec|comme|été|sont|était|être|ont|été|été|été)\b/i,
    'de': /\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|eine|als|auch|werden|aus|er|hat|dass|sie|nach|wird|bei|einer|deren|noch|war|haben|ihn|dieser|ihr|dann|um|einem|zu|können|nur|ihn|hatte|mir|ihn|ihn|ihn)\b/i
  };
  
  // Check for script-based languages first
  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  
  // Default to English
  return 'en';
}

async function translateText(text, sourceLang, targetLang) {
  if (sourceLang === targetLang) {
    return text;
  }
  
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);
    const data = await response.json();
    return data.responseData.translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

function updateLanguageSelector() {
  // Update button text to show current language
  languageBtn.title = `Language: ${supportedLanguages[currentLanguage] || 'English'}`;
}

function setLanguage(langCode) {
  currentLanguage = langCode;
  localStorage.setItem('language', langCode);
  updateLanguageSelector();
  
  // Update speech recognition language
  if (recognition) {
    recognition.lang = currentLanguage;
  }
  
  // Hide dropdown
  languageDropdown.classList.add('hidden');
}

// ----------------------------
// Voice Functions
// ----------------------------
function initializeVoice() {
  // Check for SpeechRecognition support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = currentLanguage;
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onstart = function() {
      isListening = true;
      micBtn.classList.add('listening');
      listeningIndicator.classList.add('show');
      userInput.placeholder = "Listening...";
    };
    
    recognition.onresult = function(event) {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      userInput.value = finalTranscript + interimTranscript;
      adjustTextareaHeight();
    };
    
    recognition.onerror = function(event) {
      console.error('Speech recognition error', event.error);
      stopListening();
      showToast('Speech recognition error: ' + event.error);
    };
    
    recognition.onend = function() {
      stopListening();
      if (userInput.value.trim() !== '') {
        sendMessage();
      }
    };
  } else {
    // Disable mic button if not supported
    micBtn.disabled = true;
    micBtn.title = "Voice input not supported in this browser";
    console.warn('Speech recognition not supported');
  }
}

function toggleMic() {
  if (!recognition) {
    showToast('Voice input not supported in this browser');
    return;
  }
  
  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
}

function startListening() {
  if (!recognition) return;
  
  try {
    recognition.start();
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    showToast('Error starting voice input');
  }
}

function stopListening() {
  if (!recognition) return;
  
  try {
    recognition.stop();
  } catch (error) {
    console.error('Error stopping speech recognition:', error);
  }
  
  isListening = false;
  micBtn.classList.remove('listening');
  listeningIndicator.classList.remove('show');
  userInput.placeholder = "Message YVI Tech Assistant...";
}

function speakMessage(text, messageId) {
  if (isMuted || !synth) return;
  
  // Cancel any ongoing speech
  synth.cancel();
  
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = currentLanguage;
  utter.rate = 1.0;
  utter.pitch = 1.0;
  utter.volume = isLightTheme ? 1.0 : 0.8; // Lower volume in dark mode
  
  // Add event to mark message as spoken
  utter.onend = function() {
    if (messageId) {
      const replayBtn = document.querySelector(`[data-message-id="${messageId}"] .replay-btn`);
      if (replayBtn) {
        replayBtn.innerHTML = '🔊';
      }
    }
  };
  
  synth.speak(utter);
}

function replaySpeech(messageId) {
  if (isMuted) {
    showToast('Voice output is muted');
    return;
  }
  
  const messageElement = document.querySelector(`[data-message-id="${messageId}"] .message-text`);
  if (messageElement) {
    const text = messageElement.innerText;
    
    // Update button to show speaking state
    const replayBtn = document.querySelector(`[data-message-id="${messageId}"] .replay-btn`);
    if (replayBtn) {
      replayBtn.innerHTML = '🔊 Speaking...';
    }
    
    speakMessage(text, messageId);
  }
}

function toggleMute() {
  isMuted = !isMuted;
  
  // Update UI
  if (isMuted) {
    muteToggle.checked = true;
    muteHeaderToggle.textContent = '🔇';
    muteHeaderToggle.title = "Unmute Voice Output";
  } else {
    muteToggle.checked = false;
    muteHeaderToggle.textContent = '🔊';
    muteHeaderToggle.title = "Mute Voice Output";
  }
  
  // Save preference
  localStorage.setItem('muteVoice', isMuted);
  
  // Cancel any ongoing speech
  if (synth) {
    synth.cancel();
  }
}

// ----------------------------
// Utility Functions
// ----------------------------
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `Chat on ${date.toLocaleDateString()} - ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
}

// ----------------------------
// Toast Notification
// ----------------------------
function showToast(message) {
  // Remove any existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  // Add to document
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}

// ----------------------------
// Message Actions
// ----------------------------
function copyMessageText(messageId) {
  const messageElement = document.querySelector(`[data-message-id="${messageId}"] .message-text`);
  if (messageElement) {
    const text = messageElement.innerText;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard! ✅');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy text');
    });
  }
}

function regenerateResponse(messageId) {
  // Find the message in chat history
  const messageIndex = window.chatHistory.findIndex(msg => msg.id === messageId);
  if (messageIndex > 0) {
    // Get the previous user message
    const previousMessage = window.chatHistory[messageIndex - 1];
    if (previousMessage.sender === "user") {
      // Show loading indicator
      const loadingId = showLoadingIndicator();
      
      // Send the previous message again
      sendToBackend(previousMessage.text, loadingId);
    }
  }
}

function toggleFeedback(messageId) {
  // Get current feedback state
  const currentFeedback = messageFeedback[messageId] || null;
  
  // Toggle feedback state
  if (currentFeedback === "helpful") {
    messageFeedback[messageId] = "not-helpful";
  } else if (currentFeedback === "not-helpful") {
    delete messageFeedback[messageId];
  } else {
    messageFeedback[messageId] = "helpful";
  }
  
  // Save to localStorage
  localStorage.setItem('messageFeedback', JSON.stringify(messageFeedback));
  
  // Update UI
  const feedbackBtn = document.querySelector(`[data-message-id="${messageId}"] .feedback-btn`);
  if (feedbackBtn) {
    if (messageFeedback[messageId] === "helpful") {
      feedbackBtn.innerHTML = '⭐ Helpful';
      feedbackBtn.classList.add('helpful');
    } else if (messageFeedback[messageId] === "not-helpful") {
      feedbackBtn.innerHTML = '⭐ Not Helpful';
      feedbackBtn.classList.add('not-helpful');
    } else {
      feedbackBtn.innerHTML = '⭐ Rate';
      feedbackBtn.classList.remove('helpful', 'not-helpful');
    }
  }
  
  // Show toast notification
  if (messageFeedback[messageId] === "helpful") {
    showToast('Thanks for your feedback! 👍');
  } else if (messageFeedback[messageId] === "not-helpful") {
    showToast('Thanks for your feedback! We\'ll improve.');
  }
}

function createMessageActions(messageId) {
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'msg-actions';
  
  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'action-btn copy-btn';
  copyBtn.innerHTML = '📋 Copy';
  copyBtn.setAttribute('aria-label', 'Copy message');
  copyBtn.addEventListener('click', () => copyMessageText(messageId));
  
  // Regenerate button
  const regenBtn = document.createElement('button');
  regenBtn.className = 'action-btn regen-btn';
  regenBtn.innerHTML = '🔁 Regenerate';
  regenBtn.setAttribute('aria-label', 'Regenerate response');
  regenBtn.addEventListener('click', () => regenerateResponse(messageId));
  
  // Replay button (for TTS)
  const replayBtn = document.createElement('button');
  replayBtn.className = 'action-btn replay-btn';
  replayBtn.innerHTML = '🔊';
  replayBtn.setAttribute('aria-label', 'Replay message audio');
  replayBtn.addEventListener('click', () => replaySpeech(messageId));
  
  // Feedback button
  const feedbackBtn = document.createElement('button');
  feedbackBtn.className = 'action-btn feedback-btn';
  feedbackBtn.innerHTML = '⭐ Rate';
  feedbackBtn.setAttribute('aria-label', 'Rate response');
  
  // Set initial feedback state
  if (messageFeedback[messageId] === "helpful") {
    feedbackBtn.innerHTML = '⭐ Helpful';
    feedbackBtn.classList.add('helpful');
  } else if (messageFeedback[messageId] === "not-helpful") {
    feedbackBtn.innerHTML = '⭐ Not Helpful';
    feedbackBtn.classList.add('not-helpful');
  }
  
  feedbackBtn.addEventListener('click', () => toggleFeedback(messageId));
  
  actionsDiv.appendChild(copyBtn);
  actionsDiv.appendChild(regenBtn);
  actionsDiv.appendChild(replayBtn);
  actionsDiv.appendChild(feedbackBtn);
  
  return actionsDiv;
}

// ----------------------------
// Sidebar Functions
// ----------------------------
function toggleSidebar() {
  isSidebarOpen = !isSidebarOpen;
  
  if (isSidebarOpen) {
    sidebar.classList.add("open");
    sidebarOverlay.classList.remove("hidden");
    sidebarOverlay.classList.add("visible");
    
    // On desktop, also add class to chat wrapper
    if (window.innerWidth > 768) {
      document.querySelector(".chat-wrapper").classList.add("sidebar-open");
    }
  } else {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("visible");
    sidebarOverlay.classList.add("hidden");
    document.querySelector(".chat-wrapper").classList.remove("sidebar-open");
    
    // Hide panels when closing sidebar
    chatHistoryList.classList.add("hidden");
    settingsPanel.classList.add("hidden");
  }
  
  // Save sidebar state
  localStorage.setItem('sidebarOpen', isSidebarOpen);
}

function closeSidebar() {
  isSidebarOpen = false;
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("visible");
  sidebarOverlay.classList.add("hidden");
  document.querySelector(".chat-wrapper").classList.remove("sidebar-open");
  
  // Hide panels when closing sidebar
  chatHistoryList.classList.add("hidden");
  settingsPanel.classList.add("hidden");
}

// ----------------------------
// Chat Session Management
// ----------------------------
function createNewChat() {
  // Clear current chat window
  showWelcome();
  
  // Create new session
  currentSessionId = generateUUID();
  window.chatHistory = [];
  
  // Save to localStorage
  saveCurrentSession();
  localStorage.setItem('currentSessionId', currentSessionId);
  
  // Close sidebar
  closeSidebar();
}

function saveCurrentSession() {
  if (!currentSessionId) return;
  
  // Create or update current session
  const session = {
    id: currentSessionId,
    timestamp: new Date().toISOString(),
    messages: window.chatHistory || []
  };
  
  // Update or add to chatSessions
  const existingIndex = chatSessions.findIndex(s => s.id === currentSessionId);
  if (existingIndex >= 0) {
    chatSessions[existingIndex] = session;
  } else {
    chatSessions.push(session);
  }
  
  // Save to localStorage
  localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
}

function loadChatSessions() {
  try {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      chatSessions = JSON.parse(savedSessions);
    } else {
      chatSessions = [];
    }
  } catch (e) {
    console.error('Failed to load chat sessions:', e);
    chatSessions = [];
  }
}

function showChatHistory() {
  // Hide other panels
  settingsPanel.classList.add("hidden");
  
  // Show chat history panel
  chatHistoryList.classList.remove("hidden");
  
  // Populate chat history list
  chatHistoryItems.innerHTML = '';
  
  if (chatSessions.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No chat history yet";
    chatHistoryItems.appendChild(emptyItem);
    return;
  }
  
  // Sort sessions by timestamp (newest first)
  const sortedSessions = [...chatSessions].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  sortedSessions.forEach(session => {
    const listItem = document.createElement("li");
    listItem.textContent = formatTimestamp(session.timestamp);
    listItem.addEventListener("click", () => openChatSession(session.id));
    chatHistoryItems.appendChild(listItem);
  });
}

function openChatSession(sessionId) {
  const session = chatSessions.find(s => s.id === sessionId);
  if (!session) return;
  
  // Set as current session
  currentSessionId = session.id;
  window.chatHistory = session.messages;
  localStorage.setItem('currentSessionId', currentSessionId);
  
  // Load messages into chat window
  showWelcome();
  
  // Close sidebar
  closeSidebar();
}

function clearAllChats() {
  if (chatSessions.length === 0) {
    alert("No chat history to clear");
    return;
  }
  
  if (confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
    // Clear all sessions
    chatSessions = [];
    localStorage.removeItem('chatSessions');
    
    // Create new session
    createNewChat();
    
    // Refresh chat history display
    if (!chatHistoryList.classList.contains("hidden")) {
      showChatHistory();
    }
  }
}

// ----------------------------
// Auto-link URLs in text
// ----------------------------
function autoLink(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    return `<a href="${url}" target="_blank">${url}</a>`;
  });
}

// ----------------------------
// Highlight keywords in text
// ----------------------------
function highlightKeywords(text) {
  const keywords = ['Oracle', 'HCM', 'SCM', 'ERP', 'AI', 'RPA', 'Cloud', 'Digital', 'Analytics', 'Security'];
  let highlightedText = text;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<span style="background-color: #ffff99; font-weight: bold;">$1</span>');
  });
  
  return highlightedText;
}

// ----------------------------
// Create message element
// ----------------------------
function createMessageElement(text, sender, isHTML = false, messageId = null, isTranslated = false) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);
  
  // Assign messageId if not provided
  if (!messageId) {
    messageId = generateUUID();
  }
  
  // Set data attribute for message actions
  messageDiv.setAttribute('data-message-id', messageId);
  
  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add("avatar");
  avatarDiv.textContent = sender === "user" ? "U" : "AI";
  
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");
  
  const textDiv = document.createElement("div");
  textDiv.classList.add("message-text");
  
  if (sender === "bot" && !isHTML) {
    // Add typing effect for bot messages
    typeMessage(textDiv, text);
    
    // Speak the message (unless muted)
    if (!isMuted) {
      setTimeout(() => {
        speakMessage(text, messageId);
      }, 1000);
    }
  } else if (isHTML) {
    textDiv.innerHTML = text;
  } else {
    textDiv.innerText = text;
  }
  
  contentDiv.appendChild(textDiv);
  
  // Add translation info if applicable
  if (isTranslated && sender === "bot") {
    const translationInfo = document.createElement("div");
    translationInfo.classList.add("translation-info");
    translationInfo.textContent = `(Translated from English)`;
    contentDiv.appendChild(translationInfo);
  }
  
  // Add message actions for bot messages
  if (sender === "bot") {
    const actionsDiv = createMessageActions(messageId);
    contentDiv.appendChild(actionsDiv);
  }
  
  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);
  
  return messageDiv;
}

// ----------------------------
// Append message in chat window
// ----------------------------
function appendMessage(text, sender, isHTML = false, isTranslated = false) {
  // Remove welcome message if it exists
  if (welcomeMessage && welcomeMessage.parentNode) {
    welcomeMessage.remove();
  }
  
  // Generate message ID
  const messageId = generateUUID();
  
  const messageElement = createMessageElement(text, sender, isHTML, messageId, isTranslated);
  chatWindow.appendChild(messageElement);
  scrollToBottom();
  
  // Save to chat history
  saveToChatHistory(text, sender, messageId);
}

// ----------------------------
// Save chat to local storage
// ----------------------------
function saveToChatHistory(text, sender, messageId) {
  if (!window.chatHistory) {
    window.chatHistory = [];
  }
  
  window.chatHistory.push({
    id: messageId,
    text: text,
    sender: sender,
    timestamp: new Date().toISOString()
  });
  
  // Limit history to last 100 messages
  if (window.chatHistory.length > 100) {
    window.chatHistory.shift();
  }
  
  // Save current session
  saveCurrentSession();
}

// ----------------------------
// Type message with animation
// ----------------------------
function typeMessage(element, text) {
  let i = 0;
  element.innerText = "";
  
  function typeWriter() {
    if (i < text.length) {
      element.innerText += text.charAt(i);
      i++;
      
      // Variable typing speed for more natural effect
      const randomDelay = Math.floor(Math.random() * 30) + 10;
      setTimeout(typeWriter, randomDelay);
    }
  }
  
  typeWriter();
}

// ----------------------------
// Show Welcome interface
// ----------------------------
function showWelcome() {
  // Clear chat window but keep welcome message
  chatWindow.innerHTML = '';
  const welcomeClone = welcomeMessage.cloneNode(true);
  welcomeClone.id = 'welcome-message';
  chatWindow.appendChild(welcomeClone);
  
  // Check if we have previous conversation history
  if (window.chatHistory && window.chatHistory.length > 0) {
    // Restore chat history
    window.chatHistory.forEach(msg => {
      if (!msg.text.includes("Welcome to YVI Tech Assistant")) {
        const messageElement = createMessageElement(msg.text, msg.sender, msg.sender === "bot", msg.id);
        chatWindow.appendChild(messageElement);
      }
    });
    scrollToBottom();
  }
}

// ----------------------------
// Show loading indicator
// ----------------------------
function showLoadingIndicator() {
  const loadingId = 'loading-' + Date.now();
  
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", "bot");
  messageDiv.id = loadingId;
  
  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add("avatar");
  avatarDiv.textContent = "AI";
  
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");
  
  const loadingDiv = document.createElement("div");
  loadingDiv.classList.add("typing-indicator");
  loadingDiv.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  
  contentDiv.appendChild(loadingDiv);
  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);
  
  chatWindow.appendChild(messageDiv);
  scrollToBottom();
  
  return loadingId;
}

// ----------------------------
// Remove loading indicator
// ----------------------------
function removeLoadingIndicator(loadingId) {
  const loadingElement = document.getElementById(loadingId);
  if (loadingElement) {
    loadingElement.remove();
  }
}

// ----------------------------
// Scroll to bottom of chat
// ----------------------------
function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ----------------------------
// Send message to backend
// ----------------------------
async function sendToBackend(message, loadingId) {
  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message.toLowerCase() })
    });
    
    const data = await response.json();
    
    // Remove loading indicator
    removeLoadingIndicator(loadingId);
    
    // Display response
    appendMessage(`<strong>${data.title}:</strong>\n${data.answer}`, "bot", true);
  } catch (error) {
    // Remove loading indicator and show error
    removeLoadingIndicator(loadingId);
    appendMessage(`<strong>Error:</strong>\nSorry, I encountered an issue processing your request. Please try again.`, "bot", true);
  }
}

// ----------------------------
// Send typed message with translation
// ----------------------------
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Detect language
  const detectedLanguage = detectLanguage(message);
  
  // Translate to English if needed
  let englishMessage = message;
  if (detectedLanguage !== 'en') {
    englishMessage = await translateText(message, detectedLanguage, 'en');
  }

  appendMessage(message, "user");
  userInput.value = "";
  adjustTextareaHeight();

  // Handle greetings
  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
  if (greetings.includes(englishMessage.toLowerCase())) {
    const response = "Hello 👋 How can I help you today?";
    // Translate response back if needed
    let translatedResponse = response;
    if (currentLanguage !== 'en') {
      translatedResponse = await translateText(response, 'en', currentLanguage);
    }
    appendMessage(translatedResponse, "bot", false, currentLanguage !== 'en');
    return;
  }

  // Show loading indicator
  const loadingId = showLoadingIndicator();

  // Handle special cases
  const lowerMsg = englishMessage.toLowerCase();
  
  if (lowerMsg.includes("other core capabilities")) {
    removeLoadingIndicator(loadingId);
    const response = `<strong>Other Core Capabilities:</strong>
Oracle ERP provides a comprehensive suite of applications across multiple domains, including but not limited to HCM, SCM, and Financials.

Other Oracle solutions include:
- Oracle Risk Management Cloud
- Oracle Project Portfolio Management Cloud
- Oracle Enterprise Performance Management Cloud
- Oracle Marketing Cloud
- Oracle Sales Cloud
- Oracle Service Cloud

Together, these enable organizations to manage risk, projects, finance, customer engagement, and services in a unified cloud ecosystem.`;
    
    // Translate response back if needed
    let translatedResponse = response;
    if (currentLanguage !== 'en') {
      translatedResponse = await translateText(response, 'en', currentLanguage);
    }
    appendMessage(translatedResponse, "bot", true, currentLanguage !== 'en');
    return;
  }
  
  if (lowerMsg.includes("our services")) {
    removeLoadingIndicator(loadingId);
    const response = `<strong>Our Services (8):</strong>
1. IT Consulting
2. Software Development
3. Application Services
4. UX/UI Design
5. Testing & QA
6. Data Analytics
7. Infrastructure Services
8. Cybersecurity Services`;
    
    // Translate response back if needed
    let translatedResponse = response;
    if (currentLanguage !== 'en') {
      translatedResponse = await translateText(response, 'en', currentLanguage);
    }
    appendMessage(translatedResponse, "bot", true, currentLanguage !== 'en');
    return;
  }
  
  if (lowerMsg.includes("core capabilities")) {
    removeLoadingIndicator(loadingId);
    const response = `<strong>Core Capabilities (4):</strong>
1. Oracle HCM
2. Oracle SCM
3. Oracle Financials
4. Other Core Capabilities`;
    
    // Translate response back if needed
    let translatedResponse = response;
    if (currentLanguage !== 'en') {
      translatedResponse = await translateText(response, 'en', currentLanguage);
    }
    appendMessage(translatedResponse, "bot", true, currentLanguage !== 'en');
    return;
  }
  
  if (lowerMsg.includes("other capabilities")) {
    removeLoadingIndicator(loadingId);
    const response = `<strong>Other Capabilities (5):</strong>
1. Data & AI Solutions
2. RPA Services
3. Digital Marketing
4. Web Development
5. Mobile Development`;
    
    // Translate response back if needed
    let translatedResponse = response;
    if (currentLanguage !== 'en') {
      translatedResponse = await translateText(response, 'en', currentLanguage);
    }
    appendMessage(translatedResponse, "bot", true, currentLanguage !== 'en');
    return;
  }
  
  if (lowerMsg.includes("our process")) {
    removeLoadingIndicator(loadingId);
    const response = `<strong>Our Process (5):</strong>
1. Requirements & Consulting
2. Development
3. Testing
4. Release
5. Enhancement & Maintenance`;
    
    // Translate response back if needed
    let translatedResponse = response;
    if (currentLanguage !== 'en') {
      translatedResponse = await translateText(response, 'en', currentLanguage);
    }
    appendMessage(translatedResponse, "bot", true, currentLanguage !== 'en');
    return;
  }

  // Send to backend for normal processing
  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: englishMessage.toLowerCase() })
    });
    
    const data = await response.json();
    
    // Remove loading indicator
    removeLoadingIndicator(loadingId);
    
    // Translate response back if needed
    let translatedResponse = `<strong>${data.title}:</strong>\n${data.answer}`;
    let isTranslated = false;
    if (currentLanguage !== 'en') {
      const translatedTitle = await translateText(data.title, 'en', currentLanguage);
      const translatedAnswer = await translateText(data.answer, 'en', currentLanguage);
      translatedResponse = `<strong>${translatedTitle}:</strong>\n${translatedAnswer}`;
      isTranslated = true;
    }
    
    // Display response
    appendMessage(translatedResponse, "bot", true, isTranslated);
  } catch (error) {
    // Remove loading indicator and show error
    removeLoadingIndicator(loadingId);
    appendMessage(`<strong>Error:</strong>\nSorry, I encountered an issue processing your request. Please try again.`, "bot", true);
  }
}

// ----------------------------
// Send quick reply
// ----------------------------
function sendQuick(message) {
  // Add timestamp to track interactions
  window.interactionTimestamp = new Date().getTime();
  
  // Track quick button usage
  if (!window.quickButtonUsage) {
    window.quickButtonUsage = {};
  }
  
  if (!window.quickButtonUsage[message]) {
    window.quickButtonUsage[message] = 0;
  }
  
  window.quickButtonUsage[message]++;
  
  // Show user message
  appendMessage(message, "user");
  
  // Show loading indicator
  const loadingId = showLoadingIndicator();
  
  // Handle dynamic category exploration
  const categories = {
    "services": "our services",
    "capabilities": "core capabilities",
    "process": "our process",
    "other": "other capabilities"
  };
  
  const lowerMsg = message.toLowerCase();
  
  // Check for category exploration
  for (const [key, value] of Object.entries(categories)) {
    if (lowerMsg.includes(key) && !lowerMsg.includes(value)) {
      removeLoadingIndicator(loadingId);
      sendQuick(value);
      return;
    }
  }
  
  // Send to backend
  sendToBackend(message, loadingId);
}

// ----------------------------
// Adjust textarea height
// ----------------------------
function adjustTextareaHeight() {
  userInput.style.height = 'auto';
  userInput.style.height = (userInput.scrollHeight > 200 ? 200 : userInput.scrollHeight) + 'px';
}

// ----------------------------
// Toggle theme
// ----------------------------
function toggleTheme() {
  isLightTheme = !isLightTheme;
  if (isLightTheme) {
    document.body.classList.add('light-theme');
    muteHeaderToggle.textContent = isMuted ? '🔇' : '🔊';
    themeToggle.textContent = '☀️';
  } else {
    document.body.classList.remove('light-theme');
    muteHeaderToggle.textContent = isMuted ? '🔇' : '🔊';
    themeToggle.textContent = '🌓';
  }
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
}

// ----------------------------
// Clear chat
// ----------------------------
function clearChat() {
  if (window.chatHistory && window.chatHistory.length > 0) {
    if (!confirm("Are you sure you want to clear the chat history?")) {
      return;
    }
  }
  
  window.chatHistory = [];
  localStorage.removeItem('yviChatHistory');
  showWelcome();
}

// ----------------------------
// Load chat history from local storage
// ----------------------------
function loadChatHistory() {
  try {
    const savedHistory = localStorage.getItem('yviChatHistory');
    const savedTheme = localStorage.getItem('theme');
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    const savedCurrentSessionId = localStorage.getItem('currentSessionId');
    const savedFeedback = localStorage.getItem('messageFeedback');
    const savedMuteState = localStorage.getItem('muteVoice');
    const savedLanguage = localStorage.getItem('language');
    
    if (savedHistory) {
      window.chatHistory = JSON.parse(savedHistory);
    } else {
      window.chatHistory = [];
    }
    
    // Load feedback data
    if (savedFeedback) {
      messageFeedback = JSON.parse(savedFeedback);
    } else {
      messageFeedback = {};
    }
    
    // Load language preference
    if (savedLanguage && supportedLanguages[savedLanguage]) {
      currentLanguage = savedLanguage;
    } else {
      // Default to English
      currentLanguage = 'en';
    }
    
    // Load mute state
    if (savedMuteState === 'true') {
      isMuted = true;
      muteToggle.checked = true;
      muteHeaderToggle.textContent = '🔇';
      muteHeaderToggle.title = "Unmute Voice Output";
    } else {
      isMuted = false;
      muteToggle.checked = false;
      muteHeaderToggle.textContent = '🔊';
      muteHeaderToggle.title = "Mute Voice Output";
    }
    
    // Apply saved theme
    if (savedTheme === 'light') {
      isLightTheme = true;
      document.body.classList.add('light-theme');
      themeToggle.textContent = '☀️';
    }
    
    // Apply saved sidebar state
    if (savedSidebarState === 'true') {
      isSidebarOpen = true;
      sidebar.classList.add("open");
      sidebarOverlay.classList.remove("hidden");
      sidebarOverlay.classList.add("visible");
      if (window.innerWidth > 768) {
        document.querySelector(".chat-wrapper").classList.add("sidebar-open");
      }
    }
    
    // Load chat sessions
    loadChatSessions();
    
    // Set current session
    if (savedCurrentSessionId) {
      currentSessionId = savedCurrentSessionId;
    } else {
      // Create new session if none exists
      currentSessionId = generateUUID();
      localStorage.setItem('currentSessionId', currentSessionId);
    }
  } catch (e) {
    console.error('Failed to load chat history:', e);
    window.chatHistory = [];
    currentSessionId = generateUUID();
    localStorage.setItem('currentSessionId', currentSessionId);
  }
}

// ----------------------------
// Event Listeners
// ----------------------------
document.addEventListener("DOMContentLoaded", function () {
  // Load chat history
  loadChatHistory();
  
  // Update language selector
  updateLanguageSelector();
  
  // Show welcome message
  showWelcome();
  
  // Initialize voice functionality
  initializeVoice();
  
  // Event listeners
  sendBtn.addEventListener("click", sendMessage);
  micBtn.addEventListener("click", toggleMic);
  muteToggle.addEventListener("change", toggleMute);
  muteHeaderToggle.addEventListener("click", toggleMute);
  languageBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    languageDropdown.classList.toggle('hidden');
  });
  
  // Language option click handlers
  languageOptions.forEach(option => {
    option.addEventListener("click", function() {
      const langCode = this.getAttribute('data-lang');
      setLanguage(langCode);
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener("click", function(e) {
    if (!languageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
      languageDropdown.classList.add('hidden');
    }
  });
  
  userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
  
  userInput.addEventListener("input", adjustTextareaHeight);
  
  themeToggle.addEventListener("click", toggleTheme);
  
  // Sidebar event listeners
  sidebarToggle.addEventListener("click", toggleSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);
  
  newChatBtn.addEventListener("click", createNewChat);
  chatHistoryBtn.addEventListener("click", showChatHistory);
  clearAllBtn.addEventListener("click", clearAllChats);
  settingsBtn.addEventListener("click", function() {
    // Hide other panels
    chatHistoryList.classList.add("hidden");
    
    // Show settings panel
    settingsPanel.classList.remove("hidden");
  });
  
  // Allow Shift+Enter for new lines
  userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      this.value = this.value.substring(0, start) + "\n" + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 1;
      adjustTextareaHeight();
    }
  });
  
  // Close sidebar on escape key
  document.addEventListener("keydown", function (event) {
    // Ctrl + M for voice input toggle
    if (event.ctrlKey && event.key === "m") {
      event.preventDefault();
      toggleMic();
    }
    
    if (event.key === "Escape" && isSidebarOpen) {
      closeSidebar();
    }
  });
});

// Make functions available globally for inline event handlers
window.sendMessage = sendMessage;
window.sendQuick = sendQuick;
window.clearChat = clearChat;