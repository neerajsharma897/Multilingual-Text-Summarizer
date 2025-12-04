import { OutputIcon, CheckIcon, CopyIcon } from "./Icons";

export const SummaryOutput = ({ loading, summary, copied, onCopy }) => {
  return (
    <div className="output-section">
      <h2>
        <OutputIcon />
        Summary
      </h2>
      <div className="summary-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Generating summary...</p>
          </div>
        ) : summary ? (
          <div className="summary-text">{summary}</div>
        ) : (
          <div className="placeholder-text">Your summary will appear here</div>
        )}
      </div>
      <div className="output-actions">
        {summary && (
          <button onClick={onCopy} className="secondary-button">
            {copied ? (
              <>
                <CheckIcon />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon />
                Copy to Clipboard
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
