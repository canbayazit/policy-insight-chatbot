import { useState, type ChangeEvent } from "react";
import { api } from "../../global/lib/axios";
import { useNavigate } from "react-router-dom";
import type { IUpload } from "../../global/interfaces/Upload";
import moment from "moment";

type UploadStatus = "idle" | "uploading" | "success" | "error";

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const navigate = useNavigate();

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    console.log("files", e.target.files);
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  }

  async function handleFileUpload() {
    if (!file || status === "uploading") return;
    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post<IUpload>("/upload", formData);
      console.log("uploaded", data);
      setStatus("success");
      const createdIso = moment(
        data.created_at,
        "DD.MM.YYYY HH:mm"
      ).toISOString();
      const raw = localStorage.getItem("recentAnalyses");
      const policyList = raw ? (JSON.parse(raw) as IUpload[]) : [];
      const newPolicyList: IUpload[] = [
        { ...data, created_at: createdIso },
        ...policyList.filter((x) => x.policy_id !== data.policy_id),
      ].slice(0, 20);
      localStorage.setItem("recentAnalyses", JSON.stringify(newPolicyList));
      navigate(`/chat/${data.policy_id}`);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="h-full min-h-0 px-4 md:px-8 py-6 md:py-8">
      <div className="mx-auto max-w-3xl text-center mb-4 md:mb-6">
        <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-[oklch(85%_0.02_255)]/30">
          <span className="material-symbols-outlined text-accent icon-2xl">
            waving_hand
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">
          Merhaba, Ben Senin Poliçe Asistanınım
        </h2>
        <p className="mt-2 text-muted">
          Poliçenizi analiz etmeye hazırım. Başlamak için PDF dosyanızı
          yükleyin.
        </p>
      </div>
      <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-bg shadow-card p-8">
        <label
          className="
          relative block rounded-xl border-2 border-dashed
          border-border bg-bg-alt dark:[--color-bg-alt:var(--color-bg-alt)]
          p-5
        "
        >
          <div className=" flex max-w-3xl flex-col items-center text-center gap-5">
            <span className="material-symbols-outlined md-48 text-4xl text-accent icon-6xl">
              cloud_upload
            </span>
            <p className="text-lg md:text-xl font-semibold">
              Poliçe PDF'inizi buraya sürükleyip bırakın
            </p>
            <p className="text-base text-muted">
              veya dosya seçmek için tıklayın
            </p>

            <input
              type="file"
              className="absolute inset-0 h-full w-full opacity-0"
              onChange={handleFileChange}
            />

            {file && (
              <div className="mt-2 text-sm">
                <p className="truncate">Ad: {file.name}</p>
                <p>Boyut: {(file.size / 1024).toFixed(2)} KB</p>
                <p>Tür: {file.type || "—"}</p>
              </div>
            )}
          </div>
        </label>

        <div className="mt-6 md:mt-8 flex items-center justify-center">
          <button
            onClick={handleFileUpload}
            disabled={!file || status === "uploading"}
            className={`
            inline-flex items-center gap-2 md:gap-3 rounded-full
            px-6 md:px-7 py-3 md:py-3.5
            font-semibold tracking-tight
            transition-colors
            ${
              !file || status === "uploading"
                ? "bg-[color-mix(in_oklab,var(--color-accent)_70%,white)] text-white/80 cursor-not-allowed"
                : "bg-accent text-white hover:bg-[color-mix(in_oklab,var(--color-accent)_85%,black)]"
            }
          `}
            title={file ? "Yükle" : "Önce bir dosya seçin"}
          >
            {status === "uploading" ? (
              <svg
                className="size-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                  fill="currentColor"
                  className="opacity-75"
                />
              </svg>
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                upload
              </span>
            )}
            <span>{status === "uploading" ? "Yükleniyor" : "Yükle"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
