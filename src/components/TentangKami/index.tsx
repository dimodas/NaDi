import menu21 from "./menu-2-1.png";
import menu31 from "./menu-3-1.png";
import menu41 from "./menu-4-1.png";
import menu51 from "./menu-5-1.png";

const teamImages = [
  {
    src: menu21,
    alt: "Anggota tim laki-laki",
    rotation: "-rotate-6 md:-rotate-[7.15deg]",
  },
  {
    src: menu41,
    alt: "Anggota tim perempuan berhijab",
    rotation: "rotate-6 md:rotate-[8.31deg]",
  },
  {
    src: menu31,
    alt: "Anggota tim perempuan",
    rotation: "rotate-3 md:rotate-[8.59deg]",
  },
  {
    src: menu51,
    alt: "Anggota tim perempuan",
    rotation: "-rotate-6 md:-rotate-[12.71deg]",
  },
];

export const TentangKami = () => {
  return (
    <section
      id="tentang-kami"
      className="bg-white w-full py-16 md:py-24 px-6 overflow-hidden"
    >
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Kolom Teks (Kiri di Desktop, Atas di Mobile) */}
        <div className="w-full md:w-1/2 flex flex-col text-left">
          <h2 className="[font-family:'MonteCarlo-Regular',Helvetica] font-normal text-[#fe972f] text-6xl sm:text-7xl md:text-[100px] leading-tight mb-6">
            Tentang kami
          </h2>
          <p className="[font-family:'Montserrat-Regular',Helvetica] font-normal text-[#fe972f] text-lg sm:text-xl md:text-[24px] leading-relaxed">
            Kami mahasiswa program studi S-1 Statistika dari{" "}
            <strong className="[font-family:'Montserrat-Bold',Helvetica] font-bold">
              Universitas Negeri Gorontalo
            </strong>{" "}
            yang mengikuti Program{" "}
            <strong className="[font-family:'Montserrat-Bold',Helvetica] font-bold">
              Kreativitas Mahasiswa Asosiasi MIPA LPTK Indonesia (PKM AMLI) 2026
            </strong>
            . Fokus kami tertuju pada fenomena merebaknya{" "}
            <strong className="[font-family:'Montserrat-Bold',Helvetica] font-bold">
              UMKM kopi jalanan di Provinsi Gorontalo
            </strong>
            , berangkat dari hal tersebut kami berinisiatif untuk{" "}
            <strong className="[font-family:'Montserrat-Bold',Helvetica] font-bold">
              meningkatkan produktivitas UMKM melalui sistem Niaga Digital.
            </strong>
          </p>
        </div>

        {/* Kolom Foto Tim (Kanan di Desktop / Menurun Grid di Mobile) */}
        <div className="w-full md:w-1/2 relative min-h-[350px] md:min-h-[550px] flex justify-center items-center">
          {/* Grid Layout untuk Mobile */}
          <div className="grid grid-cols-2 gap-4 md:hidden w-full max-w-[360px]">
            {teamImages.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={image.alt}
                className={`w-full aspect-square object-cover rounded-xl shadow-lg border-2 border-white ${image.rotation}`}
              />
            ))}
          </div>

          {/* Absolute Layout untuk Desktop (md ke atas) */}
          <div className="hidden md:block relative w-full h-[550px]">
            <img
              src={menu21}
              alt="Anggota tim 1"
              className="absolute top-[20px] left-[40px] w-[210px] h-[210px] object-cover shadow-lg rounded-lg -rotate-[7deg]"
            />
            <img
              src={menu41}
              alt="Anggota tim 2"
              className="absolute top-[40px] left-[270px] w-[210px] h-[210px] object-cover shadow-lg rounded-lg rotate-[8deg]"
            />
            <img
              src={menu31}
              alt="Anggota tim 3"
              className="absolute top-[260px] left-[80px] w-[210px] h-[210px] object-cover shadow-lg rounded-lg rotate-[8deg]"
            />
            <img
              src={menu51}
              alt="Anggota tim 4"
              className="absolute top-[290px] left-[250px] w-[210px] h-[210px] object-cover shadow-lg rounded-lg -rotate-[12deg]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};