import { useState } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentences, setSentences] = useState(3);

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setLoading(true);
    setError("");
    setSummary("");

    try {
      console.log("Sending request:", { text, language, sentences });
      const response = await axios.post("http://localhost:5000/summarize", {
        text,
        language,
        sentences,
      });
      console.log("Response:", response.data);

      if (response.data.status === "success") {
        setSummary(response.data.summary);
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error("Full error:", error);
      setError(error.response?.data?.error || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-5">
        <h1 className="text-4xl font-bold text-center mb-10">
          Multilingual Text Summarizer
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="flex flex-col h-[250px] md:h-[400px]">
            <h2 className="text-xl font-semibold mb-4">Input Text</h2>
            <div className="flex-1 bg-[#1a1a1a] rounded-lg overflow-hidden">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to summarize..."
                className="w-full h-full p-4 bg-transparent border-none text-white text-base resize-none focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col h-[250px] md:h-[400px]">
            <h2 className="text-xl font-semibold mb-4">Output</h2>
            <div className="flex-1 bg-[#172e45] rounded-lg p-4 overflow-y-auto">
              {summary && (
                <>
                  <h3 className="text-lg font-medium mb-2">
                    {language === "hi" ? "सारांश:" : 
                     language === "mr" ? "सारांश:" : 
                     "Summary:"}
                  </h3>
                  <div className="text-white leading-relaxed">{summary}</div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-center mt-5">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-[100px] sm:w-auto px-3 py-2 border border-[#333] rounded bg-[#1a1a1a] text-white"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
          </select>

          <div className="flex items-center gap-2">
            <label className="text-white whitespace-nowrap">Number of Sentences:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={sentences}
              onChange={(e) => setSentences(Number(e.target.value))}
              className="w-16 px-3 py-2 border border-[#333] rounded bg-[#1a1a1a] text-white"
            />
          </div>

          <button
            onClick={handleSummarize}
            disabled={loading || !text.trim()}
            className="px-4 py-2 bg-[#0066cc] rounded text-white disabled:bg-[#333] disabled:cursor-not-allowed"
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>

        {error && <div className="text-[#ff4444] text-center mt-4">{error}</div>}
      </div>
    </div>
  );
}

export default App;