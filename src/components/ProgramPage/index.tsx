import React, { useEffect, useRef, useState } from "react";
import iconQr from "./icon-qr.svg";
import iconMenu from "./icon-menu.svg";
import iconOrderan from "./icon-orderan.svg";
import iconDashboard from "./icon-dashboard.svg";
import iconPembukuan from "./icon-pembukuan.svg";
import iconAnalitik from "./icon-analitik.svg";

interface ProgramItem {
  id: string;
  title: string;
  iconSrc: string;
  description: string;
}

const programData: ProgramItem[] = [
  { id: "qr-code", title: "QR Code", iconSrc: iconQr, description: "Memudahkan pelanggan mengakses menu secara langsung melalui pemindaian QR Code di meja atau area pemesanan tanpa perlu antre." },
  { id: "menu-digital", title: "Menu Digital", iconSrc: iconMenu, description: "Katalog produk interaktif yang dapat diperbarui secara real-time, lengkap dengan varian rasa, harga, dan status ketersediaan stok." },
  { id: "orderan", title: "Orderan", iconSrc: iconOrderan, description: "Sistem penerimaan pesanan masuk otomatis yang meminimalkan risiko kesalahan pencatatan pesanan dari pelanggan." },
  { id: "dashboard-operasional", title: "Dashboard Operasional", iconSrc: iconDashboard, description: "Pantau seluruh aktivitas transaksi harian, status pesanan aktif, dan performa jam sibuk usaha kopi Anda dalam satu tampilan." },
  { id: "pembukuan-digital", title: "Pembukuan Digital", iconSrc: iconPembukuan, description: "Pencatatan otomatis arus kas masuk dan keluar yang terintegrasi, menggantikan buku kas manual dengan aman dan rapi." },
  { id: "analitik-usaha", title: "Analitik Usaha", iconSrc: iconAnalitik, description: "Laporan statistik penjualan harian hingga bulanan untuk membantu Anda menentukan strategi bisnis dan produk terlaris." },
];

export function ProgramPage() {
  const [activeCardId, setActiveCardId] = useState<string | null>("qr-code");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Perbaikan TS7006: parameter 'id' diberi tipe string
  const handleCardClick = (id: string) => {
    setActiveCardId((prev) => (prev === id ? null : id));
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const activeCard = programData.find((item) => item.id === activeCardId);

  return (
    <div className="bg-white w-full py-10 overflow-hidden">
      <main id="program" className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-center text-3xl sm:text-4xl text-[#fe972f] font-normal mb-8 [font-family:'Montserrat-Regular',Helvetica]">
          NaDi <strong className="font-bold">membantu</strong> melalui <strong className="font-bold">sistem digital</strong>
        </h2>

        {/* Carousel Container Futuristik */}
        <div className="relative group my-4">
          {/* Tombol Scroll Kiri */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-orange-200 text-[#e66307] flex items-center justify-center font-bold text-xl hover:scale-110 active:scale-95 transition-all"
            aria-label="Scroll Kiri"
          >
            ‹
          </button>

          {/* Track Horizontal Scroll */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-6 overflow-x-auto py-6 px-4 scrollbar-none scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {programData.map((card) => {
              const isActive = activeCardId === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`snap-center shrink-0 group/card relative flex flex-col items-center justify-center w-[210px] h-[210px] p-4 rounded-[24px] transition-all duration-500 ease-out cursor-pointer ${
                    isActive
                      ? "bg-[linear-gradient(135deg,#ed8e12_0%,#c5500f_100%)] shadow-[0_12px_30px_rgba(197,80,15,0.45)] scale-105 ring-4 ring-[#fe972f]/40 -translate-y-2"
                      : "bg-gradient-to-b from-[#ffb469] to-[#e66307] opacity-80 hover:opacity-100 hover:scale-100 hover:shadow-lg"
                  }`}
                >
                  <div className="w-20 h-20 flex items-center justify-center transition-transform duration-500 group-hover/card:scale-110">
                    <img src={card.iconSrc} alt={card.title} className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-md" />
                  </div>
                  <span className="mt-3 font-bold text-lg text-white text-center [font-family:'Montserrat-Bold',Helvetica] leading-tight">
                    {card.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tombol Scroll Kanan */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-orange-200 text-[#e66307] flex items-center justify-center font-bold text-xl hover:scale-110 active:scale-95 transition-all"
            aria-label="Scroll Kanan"
          >
            ›
          </button>
        </div>

        {/* Dynamic Futuristic Detail Panel */}
        {activeCard && (
          <div className="mt-4 p-6 rounded-[24px] bg-gradient-to-r from-orange-50/80 via-white to-orange-50/80 border border-orange-200/60 shadow-[0_8px_25px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2.5 h-7 bg-[#c5500f] rounded-full"></span>
              <h3 className="text-2xl font-bold text-[#c5500f] [font-family:'Montserrat-Bold',Helvetica]">
                {activeCard.title}
              </h3>
            </div>
            <p className="text-gray-700 text-base leading-relaxed pl-5 [font-family:'Montserrat-Regular',Helvetica]">
              {activeCard.description}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}