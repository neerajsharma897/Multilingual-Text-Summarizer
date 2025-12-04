import { LANGUAGES } from "../constants";
import { SummarizeIcon, ChevronUpIcon, ChevronDownIcon } from "./Icons";

export const Controls = ({
  language,
  setLanguage,
  sentences,
  setSentences,
  maxSentences,
  onSummarize,
  loading,
  disabled,
}) => {
  const handleIncrement = () => {
    if (sentences < maxSentences) {
      setSentences(sentences + 1);
    }
  };

  const handleDecrement = () => {
    if (sentences > 1) {
      setSentences(sentences - 1);
    }
  };

  return (
    <div className="controls">
      <div className="control-group language-control">
        <label htmlFor="language-select">Language:</label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Select output language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group sentence-control">
        <label htmlFor="sentences-input">Sentences:</label>
        <div className="number-input-wrapper">
          <button
            type="button"
            className="number-spinner-btn"
            onClick={handleIncrement}
            disabled={sentences >= maxSentences}
            aria-label="Increase sentences"
          >
            <ChevronUpIcon />
          </button>
          <input
            id="sentences-input"
            type="number"
            min="1"
            max={maxSentences}
            value={sentences}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1 && value <= maxSentences) {
                setSentences(value);
              }
            }}
            aria-label={`Number of sentences in summary (max ${maxSentences})`}
          />
          <button
            type="button"
            className="number-spinner-btn"
            onClick={handleDecrement}
            disabled={sentences <= 1}
            aria-label="Decrease sentences"
          >
            <ChevronDownIcon />
          </button>
        </div>
        <span className="input-help">(max: {maxSentences})</span>
      </div>

      <button
        onClick={onSummarize}
        disabled={disabled}
        className="primary-button"
      >
        <SummarizeIcon />
        {loading ? "Summarizing..." : "Summarize"}
      </button>
    </div>
  );
};
