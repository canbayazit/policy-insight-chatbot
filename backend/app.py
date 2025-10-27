# app.py
from datetime import datetime
import os
import re
import uuid
from typing import List, Dict, Any

from dotenv import load_dotenv
from flask import Flask, request, jsonify, session
from flask_cors import CORS

import fitz  # PyMuPDF

# ---- LangChain & Models ----
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_google_genai import GoogleGenerativeAIEmbeddings  # alternatif
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import EmbeddingsFilter
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores.utils import filter_complex_metadata
import google.generativeai as genai

# -------------------- Config & Setup --------------------
load_dotenv()

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
CHROMA_DIR = os.getenv("CHROMA_DIR", "chroma_db")
# deploy için /data/uploads gibi bir varsayılan yol vermen gerekir NOT: render için ücretli
# UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "/data/uploads") 
# CHROMA_DIR = os.getenv("CHROMA_DIR", "/data/chroma_db")

PORT = int(os.getenv("FLASK_PORT", "5001"))
MAX_PDF_SIZE = 10 * 1024 * 1024  # 10MB
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")
EMBEDDINGS_MODEL = "models/text-embedding-004"
#EMBEDDINGS_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
# Önce canlı URL'yi bir değişkene alın
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

assert GOOGLE_API_KEY, "GOOGLE_API_KEY is missing in .env"
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)
app.config.update(
    UPLOAD_FOLDER=UPLOAD_FOLDER,
    SECRET_KEY=os.environ.get("FLASK_SECRET_KEY", os.urandom(24)),
)

CORS(
    app,
    resources={r"/*": {"origins": [FRONTEND_URL]}}, # Sadece canlıda
    supports_credentials=True,
    expose_headers=["Content-Type"],
)

# klasörleri temiz başlat
def reset_storage():
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(CHROMA_DIR, exist_ok=True)
reset_storage()
# -------------------- Utilities --------------------
def extract_text_pymupdf(pdf_path: str) -> str:
    # sayfadan metin al
    doc = fitz.open(pdf_path)
    parts: List[str] = []
    for i, page in enumerate(doc, start=1):
        txt = page.get_text("text") or ""
        # DEBUG önce gelsin, yoksa continue yüzünden çalışmaz
        DEBUG = True
        if DEBUG:
            one_line = (txt or "").replace("\n", " ")
            preview = one_line
            print(f"[PAGE {i:02d}] chars={len(txt)} preview: {preview}")
        if txt.strip():
            #parts.append(txt)
            parts.append(f"\n\n=== PAGE {i} START ===\n{txt}\n=== PAGE {i} END ===\n")
            continue
    return "\n\n".join(parts)

def chunk_text(text: str, file_size: int) -> List[str]:
    # Boyuta göre chunk_size ayarla ve parçala
    chunk_size = 1000 if file_size > 5 * 1024 * 1024 else 1500
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=300,
        separators=["\n\n", "\n", " ", ""],
    )
    return splitter.split_text(text)

def get_embedding_model():
    # rate limit problemi var
    return GoogleGenerativeAIEmbeddings(model=EMBEDDINGS_MODEL, google_api_key=GOOGLE_API_KEY)
    #return HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL,encode_kwargs={"normalize_embeddings": True})

def create_vector_store(chunks: List[str],policy_id, collection_name: str, metadatas: List[Dict[str, Any]] | None = None):
    # Chunks'ı belirtilen koleksiyona yazar yoksa oluşturur
    embeddings = get_embedding_model()
    metadatas = []    
    for ch in chunks:
        m = re.search(r"=== PAGE (\d+) START ===", ch)
        md = {"policy_id": str(policy_id)}
        if m:
            md["page"] = int(m.group(1))     
        metadatas.append(md)
    Chroma.from_texts(
        texts=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR,
        collection_name=collection_name,
        metadatas=metadatas,
    )

def load_vector_store(collection_name: str) -> Chroma:
    # Var olan koleksiyona bağlanır
    embeddings = get_embedding_model()
    return Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings,
        collection_name=collection_name,
    )

def build_llm():
    return ChatGoogleGenerativeAI(
        model=MODEL_NAME,
        google_api_key=GOOGLE_API_KEY,
        temperature=0.57,
    )

def build_retriever(vector_store: Chroma, policy_id: str | None):
    # MMR tabanlı retriever + policy_id filtresi
    search_kwargs = {"k": 10, "fetch_k": 40, "lambda_mult": 0.2}
    if policy_id:
        search_kwargs["filter"] = {"policy_id": policy_id}
    vec = vector_store.as_retriever(search_type="mmr", search_kwargs=search_kwargs)
    # search_kwargs = {
    #     "k": 12,             
    #     "score_threshold": 0.35 # 0.20–0.35 arası deneyerek ayarla
    # }
    # if policy_id:
    #     search_kwargs["filter"] = {"policy_id": policy_id}

    # return vector_store.as_retriever(
    #     search_type="similarity_score_threshold",
    #     search_kwargs=search_kwargs,
    # )

    #BM25 (key=value değerler için idealdir)
    # Chroma içeriğini çekip BM25 oluşturuyoruz sadece mevcut koleksiyon için
    all_docs = vector_store.get(where={"policy_id": policy_id}) if policy_id else vector_store.get()
    texts = all_docs["documents"]
    metadatas = all_docs["metadatas"]
    bm25 = BM25Retriever.from_texts(texts=texts, metadatas=metadatas)
    bm25.k = 8

    # vektör %60, BM25 %40
    return EnsembleRetriever(retrievers=[vec, bm25], weights=[0.6, 0.4])

#RAG zinciri
#history-aware retriever + stuff documents chain + retrieval chain  
def build_rag_chain(system_prompt: str, retriever): 

    llm = build_llm()

    # 1) Sohbet geçmişine göre soruyu sadeleştir (contextualize)
    contextualize_q_system = (
        "Given the chat history and the latest user question, rewrite the question so "
        "that it can be understood without the chat history. Do NOT answer it."
    )
    contextualize_q_prompt = ChatPromptTemplate.from_messages([
        ("system", contextualize_q_system),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, contextualize_q_prompt
    )

    # 2) Belge birleştirme + nihai cevap
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system",
         system_prompt
         + "\n\nAşağıdaki bağlamı kullanarak soruyu yanıtla. "
           "Eğer ilgili bilgi bağlamda yer almıyorsa, bunu kurumsal bir dille açıkça belirt "
           "(örneğin 'Bu bilgi sağlanan dokümanlarda yer almıyor.').\n\n"
           "{context}"),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    
    question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)

    # 3) Retrieval chain
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)
    return rag_chain

def get_system_prompt(lang: str) -> str:
    if lang == "tr":
        return (
            "Sen bir sigorta poliçesi uzmanı asistansın. Yalnızca vektör dizinindeki "
            "poliçe içeriğine dayanarak cevap ver. Belgede olmayan bilgi için tahmin yürütme; "
            "bunu açıkça belirt. Mümkün olduğunca kısa ve net yanıt ver; gerektiğinde madde madde."
        )
    return (
        "You are an insurance policy expert assistant. Answer strictly based on the "
        "vector index content. If the answer is not in the docs, say so clearly; "
        "do not speculate. Be concise and use bullet points when helpful."
    )

def debug_scores(vs, query="yangın", k=12):
    try:
        pairs = vs.similarity_search_with_relevance_scores(query, k=k)
        print(f"[DEBUG] '{query}' -> {len(pairs)} sonuç")
        for doc, score in pairs[:8]:
            print(round(score,3), (doc.page_content or "").replace("\n"," ")[:140])
    except Exception as e:
        print("[DEBUG] score debug error:", e)


# -------------------- Routes --------------------
@app.route("/health", methods=["GET"])
def health():
    return {"ok": True}

@app.route("/upload", methods=["POST"])
def upload():
    # 1) dosya al
    if "file" not in request.files:
        return jsonify({"error": "file field required"}), 400
    file = request.files["file"]
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only .pdf allowed"}), 400

    # 2) boyut kontrol
    if request.content_length and request.content_length > MAX_PDF_SIZE:
        return jsonify({"error": "File too large"}), 400

    # 3) kaydet
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    # 4) metin çıkar
    text = extract_text_pymupdf(path)
    if not text.strip():
        return jsonify({"error": "PDF’den metin çıkarılamadı."}), 400

    # 5) chunkla
    file_size = os.path.getsize(path)
    chunks = chunk_text(text, file_size)
    if not chunks:
        return jsonify({"error": "Metin parçalara ayrılamadı."}), 400

    # 6) metadata ve collection
    policy_id = str(uuid.uuid4())
    collection_name = f"policy_{policy_id}"
    #metadatas = [{"policy_id": policy_id}] * len(chunks)

    # 7) vektör veritabanına yaz
    create_vector_store(chunks, policy_id, collection_name)

    # 8) SESSION’A bağla → /chat bunları otomatik kullanacak
    if "session_id" not in session:
        session["session_id"] = str(uuid.uuid4())
    session["policy_id"] = policy_id
    session["collection_name"] = collection_name
    session.setdefault("chat_history", [])

    return jsonify({
        "ok": True, 
        "filename": file.filename, 
        "policy_id": policy_id, 
        "collection_name": collection_name,
        "created_at": datetime.now().strftime('%d.%m.%Y %H:%M')
        })

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("question") or "").strip()
    lang = data.get("lang", "tr")

    if not question:
        return jsonify({"error": "question is required"}), 400

    # Session’dan koleksiyon ve policy al
    collection_name = data.get("collection_name") or session.get("collection_name")
    policy_id = data.get("policy_id") or session.get("policy_id")
    if not collection_name:
        return jsonify({"error": "No collection. Please upload a PDF first."}), 400

    # Sohbet geçmişini session’dan veya fe'den çek
    chat_history: List[Dict[str, str]] = data.get("chat_history") or session.get("chat_history", [])
    print("chat history =====", chat_history)
    
    # Vectorstore’a bağlan + retriever kur
    vectorstore = load_vector_store(collection_name)
    debug_scores(vectorstore, question or "yangın", k=12)
    retriever = build_retriever(vectorstore, policy_id)
    
    # RAG zinciri + system prompt
    system_prompt = get_system_prompt(lang)
    rag_chain = build_rag_chain(system_prompt, retriever)

    # Çalıştır
    result = rag_chain.invoke({"input": question, "chat_history": chat_history})    

    # Output anahtarı: çoğu sürümde "answer", bazen "output_text"
    answer = (result.get("answer") or result.get("output_text") or "").strip()

    # create_retrieval_chain çıktısında kaynak belgeler genelde "context" altında
    docs = result.get("context", []) or []
    sources = []
    for doc in docs[:3]:
        snippet = (getattr(doc, "page_content", "") or "")[:500]
        meta = getattr(doc, "metadata", {}) or {}
        sources.append({"page_content": snippet, "metadata": meta})
    
    # DEBUG
    print(f"[RAG] Retrieved docs: {len(docs)}")
    if docs:
        first_preview = getattr(docs[0], "page_content", "")
        first_preview = (first_preview or "").replace("\n", " ")
        print("[RAG] First doc preview:", first_preview)

    # Not: production’da büyük geçmişi session’da tutmak yerine DB/redis kullan.
    chat_history.append({"role": "human", "content": question})
    chat_history.append({"role": "ai", "content": answer})
    session["chat_history"] = chat_history

    return jsonify({"answer": answer, "sources": sources})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
