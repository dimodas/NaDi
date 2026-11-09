import { useEffect, useState } from "react";
import image7 from "./image-7.png";
import KONTEN131 from "./KONTEN-1-3-1.svg";

export const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(180deg,rgba(237,142,18,1)_0%,rgba(197,80,15,1)_100%)]">
      {/* --- HEADER NAVBAR --- */}
      <header
        aria-label="Navigasi utama"
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ease-in-out ${
          scrolled
            ? "bg-[linear-gradient(180deg,rgba(237,142,18,1)_0%,rgba(197,80,15,1)_100%)] shadow-md py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="/" aria-label="NaDi beranda" className="flex items-center">
            <img
              className="h-12 w-auto md:h-16 object-contain"
              alt="Logo NaDi"
              src={image7}
            />
          </a>

          {/* Desktop Nav Items */}
          <nav aria-label="Menu utama" className="hidden md:flex items-center gap-8 lg:gap-12">
            <a
              href="#program"
              className="font-bold text-lg lg:text-2xl text-white hover:opacity-80 transition-opacity [font-family:'Montserrat-Bold',Helvetica]"
            >
              Program
            </a>
            <a
              href="#tentang-kami"
              className="font-bold text-lg lg:text-2xl text-white hover:opacity-80 transition-opacity [font-family:'Montserrat-Bold',Helvetica]"
            >
              Tentang Kami
            </a>
            <a
              href="#kontak"
              className="font-bold text-lg lg:text-2xl text-white hover:opacity-80 transition-opacity [font-family:'Montserrat-Bold',Helvetica]"
            >
              Kontak
            </a>
          </nav>

          {/* Desktop Tombol Masuk */}
          <a
            href="?login=1"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center justify-center px-7 py-2 rounded-[20px] bg-white font-bold text-xl lg:text-2xl text-[#fe972f] hover:bg-orange-50 transition-all shadow-md [font-family:'Montserrat-Bold',Helvetica]"
          >
            Masuk
          </a>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white focus:outline-none p-2"
            aria-label="Buka Menu"
          >
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              {menuOpen ? (
                <path fillRule="evenodd" clipRule="evenodd" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              ) : (
                <path fillRule="evenodd" clipRule="evenodd" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#c5500f] border-t border-orange-400 px-6 py-4 flex flex-col gap-4 text-center">
            <a
              href="#program"
              onClick={() => setMenuOpen(false)}
              className="font-bold text-xl text-white py-2"
            >
              Program
            </a>
            <a
              href="#tentang-kami"
              onClick={() => setMenuOpen(false)}
              className="font-bold text-xl text-white py-2"
            >
              Tentang Kami
            </a>
            <a
              href="#kontak"
              onClick={() => setMenuOpen(false)}
              className="font-bold text-xl text-white py-2"
            >
              Kontak
            </a>
            <a
              href="?login=1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-[16px] bg-white font-bold text-xl text-[#fe972f] text-center"
            >
              Masuk
            </a>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <section aria-labelledby="hero-title" className="pt-28 md:pt-36 pb-20 px-6 max-w-[1240px] mx-auto">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Teks Kiri */}
          <div className="w-full md:w-7/12 flex flex-col items-center md:items-start text-center md:text-left">
            <h1
              id="hero-title"
              className="font-bold text-4xl sm:text-6xl lg:text-7xl text-white [font-family:'Montserrat-Bold',Helvetica] leading-tight mb-4"
            >
              Niaga Digital
            </h1>

            <p className="font-normal text-base sm:text-lg lg:text-xl text-white/90 [font-family:'Montserrat-Regular',Helvetica] leading-relaxed mb-8">
              NaDi hadir sebagai solusi digital untuk membantu UMKM kopi jalanan di Kota Gorontalo dalam mengelola kegiatan operasional usaha dengan lebih mudah, praktis, dan terorganisasi. Melalui satu sistem terpadu, NaDi mengintegrasikan pengelolaan pesanan, produk, transaksi pembayaran, hingga pencatatan dan laporan keuangan. Dengan mengoptimalkan pemanfaatan teknologi digital, NaDi membantu pelaku UMKM mengurangi ketergantungan pada proses pencatatan manual, meminimalkan kesalahan operasional, serta memudahkan pemantauan aktivitas usaha. Kini, pengelolaan usaha dapat dilakukan secara lebih efisien sehingga pelaku UMKM dapat lebih fokus memberikan pelayanan terbaik kepada pelanggan dan mengembangkan bisnisnya.
            </p>

            <a
              href="#program"
              className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 rounded-[20px] bg-white shadow-lg hover:scale-105 transition-transform duration-300 group"
            >
              <span className="font-semibold text-lg sm:text-2xl text-[#fe972f] [font-family:'Montserrat-SemiBold',Helvetica]">
                Kenal lebih jauh program NaDi
              </span>
            </a>
          </div>

          {/* Gambar Kanan */}
          <div className="w-full md:w-5/12 flex justify-center">
            <img
              className="w-[280px] sm:w-[380px] md:w-[450px] lg:w-[520px] aspect-square object-contain rotate-[6deg] drop-shadow-[0_0_35px_rgba(254,151,47,0.8)] drop-shadow-[0_15px_15px_rgba(0,0,0,0.35)]"
              alt="Ilustrasi minuman kopi"
              src={KONTEN131}
            />
          </div>
        </div>
      </section>

      {/* --- LENGKUNGAN BOTTOM (DEKORASI SEAMLESS) --- */}
      <div
        aria-hidden="true"
        className="w-[120%] -ml-[10%] h-16 md:h-28 bg-white rounded-t-[50%] mt-auto"
      />
    </main>
  );
};