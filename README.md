# **Multilingual Text Summarizer**

The Multilingual Text Summarizer is a web application that extracts key points from long texts while supporting multiple languages. It leverages modern web technologies and natural language processing to provide efficient summarization.


##  **Tech Stack**

### **Frontend:**
- **React** – Component-based UI with hooks for state management
- **Tailwind CSS** – Utility-first CSS framework with dark mode support
- **Vite** – Next-generation frontend tooling (ESBuild powered)
- **Axios** – Promise-based HTTP client with interceptors

### **Backend:**
- **Flask** – Micro web framework with REST API endpoints
- **NLTK** – Natural language processing
- **googletrans** – Free Google Translate API for multilingual support
- **flask-cors** – Secure cross-origin resource sharing middleware
- **scikit-learn** - TF-IDF vectorization for extractive summarization
- **numpy** - Efficient numerical operations for scoring algorithms


## **Features**
- Extractive text summarization using TF-IDF with positional bias scoring
- Multi-language support (English, Hindi, Marathi)
- Adjustable summary length
- Responsive and dark-themed UI with Tailwind CSS
- API-based communication between frontend and backend
- Sentence scoring algorithm combining:
    - Term frequency-inverse document frequency (TF-IDF)
    - Positional weighting (boost first/last sentences)
    - Length normalization (square root scaling)



## **How to Use**
### **1. Setup Backend**
```bash
    cd backend
    python -m venv venv
    venv\Scripts\activate  # On Windows
    source venv/bin/activate  # On macOS/Linux
    pip install -r requirements.txt
    python app.py
```
### **2. Setup Frontend**
```bash
cd frontend\react
npm install
npm run dev
```
