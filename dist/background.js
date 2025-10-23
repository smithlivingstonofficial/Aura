// Listens for messages from the React app
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background script:", request);

  // In the future, this is where we'll handle browser actions
  if (request.message === "hello from react") {
    sendResponse({ response: "Hello from background script!" });
  }
  return true; // Indicates an asynchronous response
});