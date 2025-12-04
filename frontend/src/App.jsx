import { useState, useEffect } from "react";
import "./App.css";
import { TextInput } from "./components/TextInput";
import { SummaryOutput } from "./components/SummaryOutput";
import { Controls } from "./components/Controls";
import { ErrorMessage } from "./components/ErrorMessage";
import { useTextStats } from "./hooks/useTextStats";
import { useCopyToClipboard } from "./hooks/useCopyToClipboard";
import { fetchSummary, handleApiError } from "./utils/api";
import { SAMPLE_TEXT } from "./constants";

function App() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [language, setLanguage] = useState("mr");
  const [sentences, setSentences] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [maxSentences, setMaxSentences] = useState(10);

  const stats = useTextStats(text);
  const { copied, copy } = useCopyToClipboard();

  // Sync max sentences with text stats
  useEffect(() => {
    const newMaxSentences = Math.max(1, stats.sentences);
    setMaxSentences(newMaxSentences);

    if (sentences > newMaxSentences && newMaxSentences > 0) {
      setSentences(newMaxSentences);
    }
  }, [stats.sentences, sentences]);

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    if (stats.sentences < 2) {
      setError("Please provide at least 2 sentences to generate a summary");
      return;
    }

    setLoading(true);
    setError(null);
    setSummary("");

    try {
      const summaryText = await fetchSummary(text, language, sentences);
      setSummary(summaryText);
    } catch (err) {
      console.error("Error:", err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSummarize();
    }
  };

  const handleCopy = () => copy(summary);

  const handleClear = () => {
    setText("");
    setSummary("");
    setError(null);
  };

  const handleUseSample = () => {
    setText(SAMPLE_TEXT);
    setSummary("");
    setError(null);
  };

  return (
    <div className="container">
      <h1>Multilingual Text Summarizer</h1>

      <div className="content-wrapper">
        <TextInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          stats={stats}
          onClear={handleClear}
          onUseSample={handleUseSample}
        />

        <SummaryOutput
          loading={loading}
          summary={summary}
          copied={copied}
          onCopy={handleCopy}
        />
      </div>

      <Controls
        language={language}
        setLanguage={setLanguage}
        sentences={sentences}
        setSentences={setSentences}
        maxSentences={maxSentences}
        onSummarize={handleSummarize}
        loading={loading}
        disabled={loading || !text.trim() || stats.sentences < 2}
      />

      <ErrorMessage error={error} />
    </div>
  );
}

export default App;
