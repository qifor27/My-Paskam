"use client";

// Jaring pengaman terakhir jika root layout gagal. Tanpa dependency komponen
// lain karena CSS/komponen aplikasi mungkin ikut gagal dimuat.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24, color: "#0f172a", background: "#f4f6fa" }}>
        <h1 style={{ fontSize: 20 }}>Aplikasi gagal dimuat</h1>
        <p>Terjadi masalah saat memproses permintaan. Data yang belum tersimpan tidak akan dihapus.</p>
        {error.digest ? <p style={{ fontSize: 12 }}>Kode laporan: {error.digest}</p> : null}
        <button
          onClick={reset}
          style={{ marginTop: 12, height: 48, padding: "0 20px", background: "#c2410c", color: "#fff", border: 0, borderRadius: 8, fontWeight: 600 }}
        >
          COBA LAGI
        </button>
      </body>
    </html>
  );
}
