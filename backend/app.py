import os
import shutil
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file, render_template_string
from flask_cors import CORS
import google.generativeai as genai
from PyPDF2 import PdfReader
import fitz  # PyMuPDF
from PIL import Image
import io
import pytesseract

from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import ConversationalRetrievalChain

load_dotenv()

# Config 
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
CHROMA_DIR = os.getenv("CHROMA_DIR", "chroma_db")
PORT = int(os.getenv("FLASK_PORT", "5001"))
MAX_PDF_SIZE = 10 * 1024 * 1024  # 10MB
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
os.environ["CHROMA_TELEMETRY"]="0"

assert GOOGLE_API_KEY, "GOOGLE_API_KEY is missing in .env"
genai.configure(api_key=GOOGLE_API_KEY)
print([m.name for m in genai.list_models() if "generateContent" in getattr(m, "supported_generation_methods", [])])

MODEL_NAME = "models/gemini-2.5-flash"
EMBEDDINGS_MODEL = "models/embedding-001"

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
# CORS(app)  # allow frontend http://localhost:5173 
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:5173"]}},  # Vite dev
    supports_credentials=False,  # cookie/giriş taşımıyorsan False bırak
    expose_headers=["Content-Type"],
)

# Bootstrap dirs fresh on start dev-friendly
def reset_storage():
    if os.path.exists(UPLOAD_FOLDER):
        shutil.rmtree(UPLOAD_FOLDER)
    if os.path.exists(CHROMA_DIR):
        shutil.rmtree(CHROMA_DIR)
    os.makedirs(UPLOAD_FOLDER)
    os.makedirs(CHROMA_DIR)

reset_storage()

def extract_text_pymupdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    parts = []
    for page in doc:
        # 1) doğrudan metin
        txt = page.get_text("text") or ""
        if txt.strip():
            parts.append(txt)
            continue
        # 2) metin yoksa (muhtemelen görsel) OCR dene
        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        ocr_txt = pytesseract.image_to_string(img, lang="tur+eng")
        if ocr_txt.strip():
            parts.append(ocr_txt)
    return "\n\n".join(parts)

def process_pdf(pdf_path: str):
    # Metni çıkar 
    text = extract_text_pymupdf(pdf_path)
    print("extract length:", len(text))
    print("first 200:", (text or "").replace("\n", " "))
    if not text.strip():
        # Kullanıcıya anlamlı cevap ver, vektör DB kurma
        raise ValueError("Bu PDF'den metin çıkarılamadı (gömülü form/görsel olabilir). \
        Lütfen metin içeren bir PDF yükleyin veya farklı bir dosya deneyin.")

    # Chunkla 
    file_size = os.path.getsize(pdf_path)
    chunk_size = 1000 if file_size > 5 * 1024 * 1024 else 1500
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=300,
        separators=["\n\n", "\n", " ", ""],
    )
    chunks = splitter.split_text(text)
    print("num chunks:", len(chunks))

    if not chunks:
        raise ValueError("PDF metni çıkarıldı ama parçalara ayrılamadı.")

    # Embedding + Chroma 

    # Not: rate limit problemi var
    # embeddings = GoogleGenerativeAIEmbeddings(
    #     model=EMBEDDINGS_MODEL, google_api_key=GOOGLE_API_KEY
    # )

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )
    
    # Basit kullanım: sadece metinler
    vectorstore = Chroma.from_texts(
        texts=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR
    )
    return vectorstore

# note: poliçe gibi içinde table metin karışık pdf'lerde PyPDF2 çalışmıyor
# --- Build / update vector DB from a PDF ---
# def process_pdf(pdf_path: str):
#     # Extract text (PyPDF2 is basic; for complex PDFs consider pdfminer.six)
#     # reader = PdfReader(pdf_path)
#     # text = ""
#     # for p in reader.pages:
#     #     extracted = p.extract_text() or ""
#     #     text += extracted + "\n"
#     pdf_reader = PdfReader(pdf_path)
#     text = ""
#     for page in pdf_reader.pages:
#         text += page.extract_text()
    
#     text = extract_text_pymupdf(pdf_path)
#     print("extract length:", len(text))
#     print("first 200:", (text[:200] or "").replace("\n", " "))
#     if not text.strip():
#         # Kullanıcıya anlamlı cevap ver, vektör DB kurma
#         raise ValueError("Bu PDF'den metin çıkarılamadı (gömülü form/görsel olabilir). \
#         Lütfen metin içeren bir PDF yükleyin veya farklı bir dosya deneyin.")

#     print("extract length:", len(text))
#     print("first 200:", (text[:200] or "").replace("\n", " "))
    
#     # Split into chunks
#     file_size = os.path.getsize(pdf_path)
#     chunk_size = 1000 if file_size > 5 * 1024 * 1024 else 1500

#     splitter = RecursiveCharacterTextSplitter(
#         chunk_size=chunk_size, chunk_overlap=300,
#         separators=["\n\n", "\n", " ", ""],
#     )
#     chunks = splitter.split_text(text)

#     print("num chunks:", len(chunks))
#     if not chunks:
#         raise ValueError("PDF metni çıkarıldı ama parçalara ayrılamadı.")
    
#     # Embeddings + Chroma
#     embeddings = GoogleGenerativeAIEmbeddings(
#         model=EMBEDDINGS_MODEL, google_api_key=GOOGLE_API_KEY
#     )
#     vectorstore = Chroma.from_texts(
#         texts=chunks, embedding=embeddings, persist_directory=CHROMA_DIR
#     )
#     return vectorstore


#  Routes
@app.route("/health", methods=["GET"])
def health():
    return {"ok": True}

@app.route("/upload", methods=["POST"])
def upload():
    # form-data: file=<pdf> bekler
    if "file" not in request.files:
        return jsonify({"error": "file field required"}), 400
    file = request.files["file"]
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only .pdf allowed"}), 400

    # pdf boyut kontrolü
    if request.content_length and request.content_length > MAX_PDF_SIZE:
        return jsonify({"error": "File too large"}), 400

    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)
    print("path===",path)
    # rebuild vector DB from this file (simple approach: 1 active doc)
    _ = process_pdf(path)

    return jsonify({"ok": True, "filename": file.filename})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("question") or "").strip()
    lang = data.get("lang", "tr")

    if not question:
        return jsonify({"error": "question is required"}), 400

    # embeddings = GoogleGenerativeAIEmbeddings(
    #     model=EMBEDDINGS_MODEL, google_api_key=GOOGLE_API_KEY
    # )

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )
    vectorstore = Chroma(
        persist_directory=CHROMA_DIR, embedding_function=embeddings
    )

    # system prompt specialized for insurance policy Q&A
    system_prompt_tr = (
        "Sen bir sigorta poliçesi uzmanı asistansın. Yalnızca vektör dizinindeki "
        "poliçe içeriğine dayanarak cevap ver. Belgede olmayan bilgi için tahmin yürütme; "
        "bunu açıkça belirt. Kullanıcıya mümkün olduğunca net ve kısa madde madde yanıt ver."        
    )
    system_prompt_en = (
        "You are an insurance policy expert assistant. Answer strictly based on the "
        "vector index (policy content). If the answer is not in the document, say so clearly; "
        "do not speculate. Respond concisely with bullet points where useful."
    )
    system_prompt = system_prompt_tr if lang == "tr" else system_prompt_en

    llm = ChatGoogleGenerativeAI(
        model=MODEL_NAME,
        google_api_key=GOOGLE_API_KEY,
        system_prompt=system_prompt,
        temperature=0.1,
    )

    # Daha iyi sonuç almak için
    retriever = vectorstore.as_retriever(
        search_type="mmr",  # çeşitliliği artırır
        search_kwargs={
            "k": 8,         # döndürülecek doküman sayısı
            "fetch_k": 40,  # kandideler
            "lambda_mult": 0.2,  # MMR çeşitlilik katsayısı
        },
    )

    # qa = ConversationalRetrievalChain.from_llm(
    #     llm=llm,
    #     retriever=vectorstore.as_retriever(search_kwargs={"k": 4}),
    #     return_source_documents=True,
    # )

    qa = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        return_source_documents=True,
    )

    result = qa.invoke({"question": question, "chat_history": []})
    answer = result.get("answer", "").strip()

    # include source page snippets
    sources = []
    for doc in result.get("source_documents", [])[:3]:
        sources.append({"page_content": doc.page_content[:500]})

    return jsonify({"answer": answer, "sources": sources})

if __name__ == "__main__":
    # For dev only
    app.run(host="0.0.0.0", port=PORT, debug=True)
