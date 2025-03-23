import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [summary, setSummary] = useState('')
  const [language, setLanguage] = useState('mr')
  const [sentences, setSentences] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({ chars: 0, words: 0, sentences: 0 })
  const [copied, setCopied] = useState(false)
  const [maxSentences, setMaxSentences] = useState(10)

  const sampleText = `Artificial Intelligence (AI) has transformed various industries, from healthcare to finance, by automating tasks and improving efficiency. In healthcare, AI-powered algorithms assist doctors in diagnosing diseases like cancer with greater accuracy. In finance, AI-driven systems help detect fraudulent transactions, ensuring security in digital payments. Additionally, AI is widely used in customer service through chatbots that provide instant support to users. Despite these advantages, AI also raises ethical concerns, such as job displacement and privacy issues. Many experts argue that while AI increases productivity, it should be regulated to prevent misuse. Governments and organizations are now focusing on creating policies to ensure AI is used responsibly. Furthermore, advancements in AI, such as natural language processing and machine learning, continue to improve human-computer interaction. As AI evolves, it is crucial to balance innovation with ethical considerations to create a future where technology benefits everyone.`

  useEffect(() => {
    // Count words and characters
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const chars = text.length
    
    // Count sentences
    const sentenceCount = text.trim() ? text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length : 0
    
    // Update max sentences
    const newMaxSentences = Math.max(1, sentenceCount)
    setMaxSentences(newMaxSentences)
    
    // Make sure current sentence selection doesn't exceed the max
    if (sentences > newMaxSentences && newMaxSentences > 0) {
      setSentences(newMaxSentences)
    }
    
    setStats({ chars, words, sentences: sentenceCount })
  }, [text])

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('Please enter some text to summarize')
      return
    }

    if (stats.sentences < 2) {
      setError('Please provide at least 2 sentences to generate a summary')
      return
    }

    setLoading(true)
    setError(null)
    setSummary('')
    setCopied(false)

    try {
      const response = await fetch('http://127.0.0.1:5000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          language,
          sentences: parseInt(sentences)
        }),
        timeout: 15000
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate summary')
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (err) {
      console.error('Error:', err)
      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        setError('Request timed out. The server took too long to respond.')
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Network error. Please check your connection and ensure the server is running.')
      } else {
        setError(err.message || 'Failed to generate summary')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSummarize()
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleClear = () => {
    setText('')
    setSummary('')
    setError(null)
    setCopied(false)
  }

  const handleUseSample = () => {
    setText(sampleText)
    setSummary('')
    setError(null)
    setCopied(false)
  }

  return (
    <div className="container">
      <h1>Multilingual Text Summarizer</h1>
      
      <div className="content-wrapper">
        <div className="input-section">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 7L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Input Text
          </h2>
          <div className="text-area">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter text to summarize..."
              aria-label="Text to summarize"
            ></textarea>
          </div>
          <div className="text-stats">
            <span>{stats.chars} characters</span>
            <span>{stats.words} words</span>
            <span>{stats.sentences} sentences</span>
          </div>
          <div className="input-actions">
            <button onClick={handleClear} className="secondary-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Clear
            </button>
            <button onClick={handleUseSample} className="secondary-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sample Text
            </button>
          </div>
        </div>

        <div className="output-section">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9H15M9 13H15M9 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
              <div className="placeholder-text">
                Your summary will appear here
              </div>
            )}
          </div>
          <div className="output-actions">
            {summary && (
              <button onClick={handleCopy} className="secondary-button">
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17M8 5C8 6.10457 8.89543 7 10 7H12C13.1046 7 14 6.10457 14 5M8 5C8 3.89543 8.89543 3 10 3H12C13.1046 3 14 3.89543 14 5M14 5H16C17.1046 5 18 5.89543 18 7V10M20 14V16.5L22 14.5M20 14V11.5L18 13.5M20 14H17.5M20 14H22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="controls">
        <div className="control-group language-control">
          <label htmlFor="language-select">Language:</label>
          <select 
            id="language-select"
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Select output language"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
          </select>
        </div>

        <div className="control-group sentence-control">
          <label htmlFor="sentences-input">Sentences:</label>
          <input
            id="sentences-input"
            type="number"
            min="1"
            max={maxSentences}
            value={sentences}
            onChange={(e) => setSentences(Math.max(1, Math.min(maxSentences, parseInt(e.target.value) || 1)))}
            aria-label={`Number of sentences in summary (max ${maxSentences})`}
          />
          <span className="input-help">(max: {maxSentences})</span>
        </div>

        <button 
          onClick={handleSummarize} 
          disabled={loading || !text.trim() || stats.sentences < 2}
          className="primary-button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>
      </div>

      {error && (
        <div className="error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}

export default App