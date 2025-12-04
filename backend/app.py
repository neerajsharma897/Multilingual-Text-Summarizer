from flask import Flask, request, jsonify
from flask_cors import CORS
from nltk.tokenize import sent_tokenize, word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from googletrans import Translator
import nltk
import os

# Download required NLTK resources
# Define a local path for NLTK data to avoid permission issues on Render
nltk_data_path = os.path.join(os.getcwd(), "nltk_data")
if not os.path.exists(nltk_data_path):
    os.makedirs(nltk_data_path)

nltk.data.path.append(nltk_data_path)

# Download resources to the specified directory
try:
    nltk.download('punkt', download_dir=nltk_data_path)
    nltk.download('punkt_tab', download_dir=nltk_data_path)
    nltk.download('stopwords', download_dir=nltk_data_path)
except Exception as e:
    print(f"Error downloading NLTK data: {e}")

app = Flask(__name__)
CORS(app)

def extractive_summary(text: str, sentences_count: int = 3) -> str:
    try:
        sentences = sent_tokenize(text)
        if len(sentences) <= sentences_count:
            return text
            
        # 1. TF-IDF Transformation
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1,3), tokenizer=word_tokenize, token_pattern=None)
        tfidf_matrix = vectorizer.fit_transform(sentences)

        # 2. Compute document vector (mean of all sentence vectors)
        doc_vector = np.asarray(tfidf_matrix.mean(axis=0)).reshape(1, -1)
        
        # 3. Calculate word importance (sum of TF-IDF scores across document)
        word_scores = tfidf_matrix.sum(axis=0).A1
        vocab = vectorizer.get_feature_names_out()
        word_weights = dict(zip(vocab, word_scores))
        
        # 4. Score sentences with positional bias
        sent_scores = []
        for i, sentence in enumerate(sentences):
            # TF-IDF component
            words = word_tokenize(sentence.lower())
            content_score = sum(word_weights.get(word, 0) for word in words)
            
            # Cosine similarity to document
            sentence_vec = tfidf_matrix[i]
            similarity_score = cosine_similarity(sentence_vec, doc_vector).flatten()[0]

            # Positional bias (U-shaped: boost start/end sentences)
            pos = i / len(sentences)
            pos_weight = 0.5 + max(pos, 1 - pos)  # Ranges 0.5-1.5
            
            # Normalized score
            score = (content_score / len(words)**0.5) * pos_weight + similarity_score
            sent_scores.append((score, i))
        
        # 5. Top sentence selection 
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

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "online", "message": "Multilingual Summarizer Backend is running"})

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