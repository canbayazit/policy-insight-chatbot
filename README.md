# 🕵️ Insurance Policy Chatbot Assistant

A web application developed with RAG (Retrieval-Augmented Generation) architecture that reads insurance policies from PDF and answers questions to extract critical details—coverage, deductibles/excess, premiums, and more.

## 🌐 Deploy Link

Application Demo: [Click to See Application](https://policy-insight-chatbot.onrender.com/)

## ⚡ Tech Stack
- Backend: Flask - Python
- Frontend: React - JavaScript - TypeScript
- RAG: LangChain, Chroma
- LLM: Google Gemini (`gemini-2.5-flash`)
- Embeddings: Google `models/text-embedding-004`
- Data: PDF Processing

## 🧩 Solution Architecture

#### 🎯 The Problem

Insurance policies are notoriously long, filled with technical jargon, and vary wildly in format. Users struggle to quickly and reliably find critical information such as coverage details, deductibles/excess, premium amounts, end dates, and exclusions.

#### 🏁 The Goal
To answer a user's natural-language questions **strictly based on the policy content**. The assistant must return concise, bullet-point responses with clear traceability (source references) to the original document.


#### ⛓️ RAG Pipeline Flow
##### 1. Document Ingestion & Preprocessing
-  A user uploads a PDF via the `/upload` endpoint.
-  **PyMuPDF** extracts text page by page.
-  If no machine-readable text is found (e.g., a scanned PDF)
-  The extracted raw text is split into optimized `chunks` (e.g., 1000-1500 characters with 300-character overlap).
-  Each `chunk` is enriched with metadata, such as `{ policy_id, page_number }`.
##### 2. Vectorization & Indexing
-  All text `chunks` are converted into vector embeddings (numerical representations) using Google's `text-embedding-004` model.
-  These vectors are stored in a persistent **ChromaDB** collection, uniquely named (e.g., `policy_{policy_id}`).
##### 3. Retrieval
- **Vector Search (Dense):** We use **MMR** (Maximum Marginal Relevance) to find chunks that are not only relevant but also diverse. This prevents redundant information and provides a broader context.
-  **(Optional) Keyword Search (Sparse):** Algorithms like BM25 can be added to improve precision for keyword-heavy queries (like a specific policy number).
-  **(Optional) Hybrid Search (Ensemble):** The scores from dense and sparse search can be combined (RRF) for the most accurate retrieval.
##### 4. Generation
-  The retrieved `context` are stuffed into a prompt that will be sent to the LLM.
-  A precise **System Instruction** is given to the LLM    
-  The LLM (Gemini) generates an answer based *only* on the provided context and the user's question.
-  The final response is shown to the user, ideally including page references for verification.


## 🚀 Local Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/enesmanan/paper-bold.git
   cd paper-bold
   ```

2. Create and activate a virtual environment:
   ```bash
    python -m venv venv
    source venv/bin/activate  # Linux/Mac
    venv\Scripts\activate     # Windows
   ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file and add your Google API key:
   ```
   GOOGLE_API_KEY=your_api_key
   ```

5. Run the application:
   ```bash
   python app.py
   ```

6. Go to `http://localhost:5001` in your browser
