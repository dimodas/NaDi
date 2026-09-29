import { useEffect, useState } from "react";
import image7 from "./image-7.png";
import KONTEN111 from "./KONTEN-1-1-1.png";
import KONTEN131 from "./KONTEN-1-3-1.png";

export const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 600);

      const loginSection = document.getElementById("login-page");
      if (loginSection) {
        const loginTop = loginSection.offsetTop;
        setHideNavbar(window.scrollY + 80 >= loginTop);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-[1024px] min-w-[1440px] w-full overflow-hidden bg-[linear-gradient(180deg,rgba(237,142,18,1)_0%,rgba(197,80,15,1)_100%)]">
      <header
        aria-label="Navigasi utama"
        className={`fixed top-0 left-0 z-50 h-[152px] w-full transition-all duration-300 ease-in-out ${
          hideNavbar ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        } ${
          scrolled
            ? "bg-[linear-gradient(180deg,rgba(237,142,18,1)_0%,rgba(197,80,15,1)_100%)] shadow-[0px_4px_10px_#00000040]"
            : "bg-transparent"
        }`}
      >
        <div className="relative h-[152px] w-[1440px]">
          <a
            href="/"
            aria-label="NaDi beranda"
            className="absolute left-[59px] top-[37px] block h-[66px] w-[69px]"
          >
            <img
              className="h-[66px] w-[69px] aspect-[1.04] object-cover"
              alt="Logo NaDi"
              src={image7}
            />
          </a>
          <nav aria-label="Menu utama">
            <a
              href="#program"
              className="absolute left-[631px] top-[51px] w-[177px] text-center font-bold text-3xl leading-[normal] tracking-[0] text-white [font-family:'Montserrat-Bold',Helvetica] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#e68b13]"
            >
              Program
            </a>
            <a
              href="mailto:kontak@nadi.id"
              className="absolute left-[886px] top-[51px] w-36 text-center font-bold text-3xl leading-[normal] tracking-[0] text-white [font-family:'Montserrat-Bold',Helvetica] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#e68b13]"
            >
              Kontak
            </a>
            <a
              href="#login-page"
              className="absolute left-[1115px] top-12 flex h-11 w-[230px] items-center justify-center rounded-[20px] bg-white font-bold text-[28px] leading-[normal] tracking-[0] text-[#fe972f] [font-family:'Montserrat-Bold',Helvetica] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#e68b13]"
            >
              Daftar/Masuk
            </a>
          </nav>
        </div>
      </header>
      <section aria-labelledby="hero-title">
        <div className="absolute left-[59px] top-[307px] flex h-[102px] w-[660px] items-center font-bold text-[84.8px] leading-[normal] tracking-[0] text-white [font-family:'Montserrat-Bold',Helvetica]">
          <h1 id="hero-title" className="m-0 font-inherit">
            Niaga Digital
          </h1>
        </div>
        <p className="absolute left-[59px] top-[430px] flex h-[193px] w-[767px] items-center font-normal text-[46.1px] leading-[normal] tracking-[0] text-white [font-family:'Montserrat-Regular',Helvetica]">
          Bantu UMKM kopi jalanan di Kota Gorontalo dalam mengelola operasional
          manual menjadi digital melalui sistem terpadu.
        </p>
        <a
          href="#program"
          className="absolute left-[59px] top-[657px] flex h-11 w-[479px] items-center rounded-[20px] bg-white pl-[19px] shadow-[0px_4px_10px_#00000080] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#c5500f]"
        >
          <span className="flex h-[37px] w-[480px] items-center font-semibold text-[28px] leading-[normal] tracking-[0] text-[#fe972f] [font-family:'Montserrat-SemiBold',Helvetica]">
            Kenal lebih jauh program NaDi
          </span>
        </a>
        <img
          className="absolute left-[579px] top-[219px] h-[736px] w-[754px] aspect-[1] object-cover"
          alt="Ilustrasi produk kopi NaDi"
          src={KONTEN111}
        />
        <img
          className="absolute left-[729px] top-[239px] h-[734px] w-[711px] aspect-[1] object-cover"
          alt="Ilustrasi minuman kopi"
          src={KONTEN131}
        />
      </section>
      <div
        aria-hidden="true"
        className="absolute left-[calc(50.00%_-_800px)] top-[923px] h-[146px] w-[1600px] rounded-[769.5px/73px] bg-white"
      />
    </main>
  );
};
