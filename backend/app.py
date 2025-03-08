from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from string import punctuation
from collections import defaultdict
from heapq import nlargest
from googletrans import Translator
from typing import Dict, Any

# Download required NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

def extractive_summary(text: str, sentences_count: int = 3) -> str:
    try:
        # Tokenize the text into sentences and words
        sentences = sent_tokenize(text)
        words = word_tokenize(text.lower())
        
        # Get stopwords and add punctuation to it
        stop_words = set(stopwords.words('english') + list(punctuation))
        
        # Calculate word frequencies
        word_freq = defaultdict(int)
        for word in words:
            if word not in stop_words:
                word_freq[word] += 1
                
        # Normalize word frequencies
        max_freq = max(word_freq.values())
        for word in word_freq:
            word_freq[word] = word_freq[word] / max_freq
            
        # Calculate sentence scores
        sent_scores = defaultdict(float)
        for i, sentence in enumerate(sentences):
            for word in word_tokenize(sentence.lower()):
                if word in word_freq:
                    sent_scores[i] += word_freq[word]
            sent_scores[i] = sent_scores[i] / len(sentence.split())
        
        # Get top N sentences while maintaining order
        selected_sent_indices = nlargest(sentences_count, sent_scores, key=sent_scores.get)
        selected_sent_indices.sort()
        
        summary = ' '.join([sentences[i] for i in selected_sent_indices])
        return summary
    except Exception as e:
        raise Exception(f"Summarization error: {str(e)}")

def translate_text(text: str, target_lang: str) -> str:
    try:
        translator = Translator()
        max_retries = 3
        for _ in range(max_retries):
            try:
                return translator.translate(text, dest=target_lang).text
            except Exception:
                continue
        raise Exception("Translation failed after maximum retries")
    except Exception as e:
        raise Exception(f"Translation error: {str(e)}")

@app.route('/summarize', methods=['POST'])
def summarize() -> Dict[str, Any]:
    try:
        data = request.json
        text = data.get("text", "").strip()
        lang = data.get("language", "en")
        sentences_count = data.get("sentences", 3)

        if not text:
            return jsonify({"error": "No text provided"}), 400

        summary = extractive_summary(text, sentences_count)
        if lang in ["hi", "mr"]:
            summary = translate_text(summary, lang)

        return jsonify({
            "summary": summary,
            "status": "success"
        })

    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

if __name__ == "__main__":
    app.run(debug=True)