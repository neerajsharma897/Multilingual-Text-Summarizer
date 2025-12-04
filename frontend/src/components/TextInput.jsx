import { InputIcon, ClearIcon, SampleIcon } from "./Icons";

export const TextInput = ({
  value,
  onChange,
  onKeyDown,
  stats,
  onClear,
  onUseSample,
}) => {
  return (
    <div className="input-section">
      <h2>
        <InputIcon />
        Input Text
      </h2>
      <div className="text-area">
        <textarea
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Enter text to summarize..."
          aria-label="Text to summarize"
        />
      </div>
      <div className="text-stats">
        <span>
          {stats.chars} characters • {stats.words} words • {stats.sentences}{" "}
          sentences
        </span>
      </div>
      <div className="input-actions">
        <button onClick={onClear} className="secondary-button">
          <ClearIcon />
          Clear
        </button>
        <button onClick={onUseSample} className="secondary-button">
          <SampleIcon />
          Sample Text
        </button>
      </div>
    </div>
  );
};
