import { useEffect, useRef, useState } from "react";
import iconQr from "./icon-qr.svg";
import iconMenu from "./icon-menu.svg";
import iconOrderan from "./icon-orderan.svg";
import iconDashboard from "./icon-dashboard.svg";
import iconPembukuan from "./icon-pembukuan.svg";
import iconAnalitik from "./icon-analitik.svg";

const programCards = [
  {
    id: "qr-code",
    title: "QR Code",
    cardClass:
      "absolute top-[286px] left-32 w-[318px] h-[328px] rounded-[20px] shadow-[0px_4px_10px_#00000080] bg-[linear-gradient(180deg,rgba(237,141,18,1)_0%,rgba(230,99,7,1)_100%)]",
    labelClass:
      "absolute top-[536px] left-[130px] w-[315px] [font-family:'Montserrat-Bold',Helvetica] font-bold text-white text-[41.6px] text-center tracking-[0] leading-[normal] whitespace-nowrap",
    label: "QR Code",
    iconSrc: iconQr,
    iconClass: "absolute w-[140px] h-[140px] top-[50px] left-[89px] pointer-events-none",
  },
  {
    id: "menu-digital",
    title: "Menu Digital",
    cardClass:
      "absolute top-[286px] left-[567px] w-[319px] h-[328px] rounded-[20px] shadow-[0px_4px_10px_#00000080] bg-[linear-gradient(180deg,rgba(237,141,18,1)_0%,rgba(230,99,7,1)_100%)]",
    labelClass:
      "absolute top-[539px] left-[calc(50.00%_-_128px)] w-[283px] [font-family:'Montserrat-Bold',Helvetica] font-bold text-white text-[40px] text-center tracking-[0] leading-[normal] whitespace-nowrap",
    label: "Menu Digital",
    iconSrc: iconMenu,
    iconClass: "absolute w-[141px] h-[140px] top-[50px] left-[89px] pointer-events-none",
  },
  {
    id: "orderan",
    title: "Orderan",
    cardClass:
      "absolute top-[296px] left-[1005px] w-[318px] h-[328px] rounded-[20px] shadow-[0px_4px_10px_#00000080] bg-[linear-gradient(180deg,rgba(237,141,18,1)_0%,rgba(230,99,7,1)_100%)]",
    labelClass:
      "absolute top-[537px] left-[calc(50.00%_+_303px)] w-[283px] [font-family:'Montserrat-Bold',Helvetica] font-bold text-white text-[40px] text-center tracking-[0] leading-[normal] whitespace-nowrap",
    label: "Orderan",
    iconSrc: iconOrderan,
    iconClass: "absolute w-[140px] h-[140px] top-[50px] left-[89px] pointer-events-none",
  },
  {
    id: "dashboard-operasional",
    title: "Dashboard Operasional",
    cardClass:
      "absolute top-[633px] left-[129px] w-[318px] h-[328px] rounded-[20px] shadow-[0px_4px_10px_#00000080] bg-[linear-gradient(180deg,rgba(237,141,18,1)_0%,rgba(230,99,7,1)_100%)]",
    labelClass:
      "absolute top-[872px] left-[129px] w-[315px] [font-family:'Montserrat-Bold',Helvetica] font-bold text-white text-3xl text-center tracking-[0] leading-[normal]",
    label: "Dashboard Operasional",
    iconSrc: iconDashboard,
    iconClass: "absolute w-[148px] h-[140px] top-[50px] left-[85px] pointer-events-none",
  },
  {
    id: "pembukuan-digital",
    title: "Pembukuan Digital",
    cardClass:
      "absolute top-[633px] left-[567px] w-[319px] h-[328px] rounded-[20px] shadow-[0px_4px_10px_#00000080] bg-[linear-gradient(180deg,rgba(237,141,18,1)_0%,rgba(230,99,7,1)_100%)]",
    labelClass:
      "absolute top-[872px] left-[562px] w-[315px] [font-family:'Montserrat-Bold',Helvetica] font-bold text-white text-3xl text-center tracking-[0] leading-[normal]",
    label: "Pembukuan Digital",
    iconSrc: iconPembukuan,
    iconClass: "absolute w-[199px] h-[140px] top-[55px] left-[60px] pointer-events-none",
  },
  {
    id: "analitik-usaha",
    title: "Analitik Usaha",
    cardClass:
      "absolute top-[643px] left-[1006px] w-[318px] h-[328px] rounded-[20px] shadow-[0px_4px_10px_#00000080] bg-[linear-gradient(180deg,rgba(237,141,18,1)_0%,rgba(230,99,7,1)_100%)]",
    labelClass:
      "absolute top-[872px] left-[1007px] w-[315px] [font-family:'Montserrat-Bold',Helvetica] font-bold text-white text-3xl text-center tracking-[0] leading-[normal]",
    label: "Analitik Usaha",
    iconSrc: iconAnalitik,
    iconClass: "absolute w-[145px] h-[140px] top-[50px] left-[87px] pointer-events-none",
  },
];

export const ProgramPage = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleProgramSelect = (programId: string) => {
    window.location.hash = programId;
  };

  return (
    <div className="bg-white w-full min-w-[1440px] h-[1024px] relative overflow-hidden">
      <main id="program">
        <h1 className="absolute top-52 left-[calc(50.00%_-_471px)] w-[942px] h-[37px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#fe972f] text-[45px] text-center tracking-[0] leading-[normal] whitespace-nowrap">
          <span className="[font-family:'Montserrat-Regular',Helvetica] font-normal text-[#fe972f] text-[45px] tracking-[0]">
            NaDi{" "}
          </span>
          <strong className="[font-family:'Montserrat-Bold',Helvetica] font-bold">
            membantu
          </strong>
          <span className="[font-family:'Montserrat-Regular',Helvetica] font-normal text-[#fe972f] text-[45px] tracking-[0]">
            {" "}
            melalui{" "}
          </span>
          <strong className="[font-family:'Montserrat-Bold',Helvetica] font-bold">
            sistem digital
          </strong>
        </h1>
        <section aria-label="Program digital NaDi" ref={sectionRef}>
          {programCards.map((card) => (
            <button
              key={card.id}
              type="button"
              className={`${card.cardClass} transition-transform duration-700 ease-out ${
                isVisible ? "scale-100" : "scale-125"
              } cursor-pointer focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#fe972f] focus-visible:outline-offset-4`}
              onClick={() => handleProgramSelect(card.id)}
              aria-label={`Buka program ${card.title}`}
            >
              <img
                src={card.iconSrc}
                alt=""
                aria-hidden="true"
                className={card.iconClass}
              />
            </button>
          ))}

          {programCards.map((card) => (
            <div
              key={`${card.id}-label`}
              className={`${card.labelClass} pointer-events-none`}
              aria-hidden="true"
            >
              {card.label === "Pembukuan Digital" ? (
                <>
                  Pembukuan
                  <br />
                  Digital
                </>
              ) : card.label === "Analitik Usaha" ? (
                <>
                  Analitik
                  <br />
                  Usaha
                </>
              ) : (
                card.label
              )}
            </div>
          ))}
        </section>
        <section id="mitra" className="sr-only" aria-label="Mitra">
          Mitra NaDi
        </section>
      </main>
      {loginOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 min-w-[1440px]"
          role="presentation"
          onMouseDown={() => setLoginOpen(false)}
        >
          <section
            className="w-[420px] rounded-[20px] bg-white p-8 shadow-[0px_4px_20px_#00000080]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2
              id="login-dialog-title"
              className="[font-family:'Montserrat-Bold',Helvetica] text-2xl font-bold text-[#e66307]"
            >
              Daftar atau Masuk
            </h2>
            <p className="mt-3 [font-family:'Montserrat-Regular',Helvetica] text-base text-[#e66307]">
              Silakan masuk atau daftar untuk melanjutkan.
            </p>
            <button
              className="mt-6 rounded-[20px] bg-[#fe972f] px-6 py-3 [font-family:'Montserrat-Bold',Helvetica] font-bold text-white"
              type="button"
              onClick={() => setLoginOpen(false)}
            >
              Tutup
            </button>
          </section>
        </div>
      )}
    </div>
  );
};