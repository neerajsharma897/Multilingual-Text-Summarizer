from flask import Flask, request, jsonify
from flask_cors import CORS
from nltk.tokenize import sent_tokenize, word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from googletrans import Translator
import nltk

# Download required NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

def extractive_summary(text: str, sentences_count: int = 3) -> str:
    try:
        sentences = sent_tokenize(text)
        if len(sentences) <= sentences_count:
            return text
            
        # 1. TF-IDF Transformation
        vectorizer = TfidfVectorizer(stop_words='english', tokenizer=word_tokenize, token_pattern=None)
        tfidf_matrix = vectorizer.fit_transform(sentences)
        
        # 2. Calculate word importance (sum of TF-IDF scores across document)
        word_scores = np.asarray(tfidf_matrix.sum(axis=0)).flatten()
        vocab = vectorizer.get_feature_names_out()
        word_weights = dict(zip(vocab, word_scores))
        
        # 3. Score sentences with positional bias
        sent_scores = []
        for i, sentence in enumerate(sentences):
            # TF-IDF component
            words = word_tokenize(sentence.lower())
            content_score = sum(word_weights.get(word, 0) for word in words)
            
            # Positional bias (U-shaped: boost start/end sentences)
            pos = i / len(sentences)
            pos_weight = 0.5 + max(pos, 1 - pos)  # Ranges 0.5-1.5
            
            # Normalized score
            score = (content_score / len(words)**0.5) * pos_weight
            sent_scores.append((score, i))
        
        # 4. Pythonic sentence selection (optimized version)
        selected_indices = sorted(
            range(len(sentences)),
            key=lambda i: sent_scores[i],
            reverse=True
        )[:sentences_count]
        selected_indices.sort()
        
        return ' '.join([sentences[i] for i in selected_indices])
        
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
        raise Exception("Translation fialed after maximum retries")
    except Exception as e:
        raise Exception(f"Translation error: {str(e)}")

@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.json
        text = data.get("text", "").strip()
        lang = data.get("language", "en")
        sentences_count = data.get("sentences", 3)
        
        if not text:
            return jsonify({"error": "No text provided"}), 400

        summary = extractive_summary(text, sentences_count)
        if lang != "en":
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