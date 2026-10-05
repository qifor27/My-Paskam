// Upload satu foto dari browser (XHR untuk progress). Dipakai form & outbox.
export type PhotoModuleName = "LAPORAN_KERJA" | "ORDER_SPARE_PART";

export type UploadResult = { ok: true } | { ok: false; kind: "network" | "session" | "rejected"; message: string };

export const NETWORK_MESSAGE = "Foto belum terunggah karena koneksi terputus. Foto tetap tersimpan di HP.";

export function uploadPhoto(
  input: { id: string; width: number; height: number; blob: Blob },
  module: PhotoModuleName,
  recordId: string,
  onProgress?: (percent: number) => void,
) {
  return new Promise<UploadResult>((resolve) => {
    const body = new FormData();
    body.append("id", input.id);
    body.append("module", module);
    body.append("recordId", recordId);
    body.append("width", String(input.width));
    body.append("height", String(input.height));
    body.append("file", input.blob, `${input.id}.jpg`);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/foto");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) return resolve({ ok: true });
      if (xhr.status === 401) return resolve({ ok: false, kind: "session", message: "Sesi Anda telah berakhir. Login kembali; foto tetap tersimpan di HP." });
      let message = "Foto gagal diunggah. Coba lagi.";
      try {
        message = JSON.parse(xhr.responseText).error?.message ?? message;
      } catch {}
      // 5xx = gangguan sementara (boleh dicoba lagi otomatis); 4xx = ditolak.
      resolve({ ok: false, kind: xhr.status >= 500 ? "network" : "rejected", message });
    };
    xhr.onerror = () => resolve({ ok: false, kind: "network", message: NETWORK_MESSAGE });
    xhr.ontimeout = () => resolve({ ok: false, kind: "network", message: NETWORK_MESSAGE });
    xhr.timeout = 60_000;
    xhr.send(body);
  });
}
