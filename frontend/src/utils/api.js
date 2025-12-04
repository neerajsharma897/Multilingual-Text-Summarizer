import { API_URL, REQUEST_TIMEOUT } from "../constants";

export const fetchSummary = async (text, language, sentences) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text.trim(),
      language,
      sentences: parseInt(sentences),
    }),
    timeout: REQUEST_TIMEOUT,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate summary");
  }

  const data = await response.json();
  return data.summary;
};

export const handleApiError = (err) => {
  if (err.name === "AbortError" || err.message.includes("timeout")) {
    return "Request timed out. The server took too long to respond.";
  } else if (
    err.message.includes("Failed to fetch") ||
    err.message.includes("NetworkError")
  ) {
    return "Network error. Please check your connection and ensure the server is running.";
  } else {
    return err.message || "Failed to generate summary";
  }
};
