import menu21 from "./menu-2-1.png";
import menu31 from "./menu-3-1.png";
import menu41 from "./menu-4-1.png";
import menu51 from "./menu-5-1.png";

const teamImages = [
  {
    src: menu21,
    alt: "Anggota tim laki-laki",
    className:
      "absolute top-[190.156px] left-[750px] w-[250px] h-[250px] object-cover shadow-lg",
    style: {
      transform: "rotate(-7.15916deg)",
      transformOrigin: "top left",
    },
  },
  {
    src: menu41,
    alt: "Anggota tim perempuan berhijab",
    className:
      "absolute top-[231px] left-[1094.14px] w-[250px] h-[250px] object-cover shadow-lg",
    style: {
      transform: "rotate(8.31157deg)",
      transformOrigin: "top left",
    },
  },
  {
    src: menu31,
    alt: "Anggota tim perempuan",
    className:
      "absolute top-[478px] left-[780.357px] w-[250px] h-[250px] object-cover shadow-lg",
    style: {
      transform: "rotate(8.59408deg)",
      transformOrigin: "top left",
    },
  },
  {
    src: menu51,
    alt: "Anggota tim perempuan",
    className:
      "absolute top-[609.029px] left-[1043px] w-[250px] h-[250px] object-cover shadow-lg",
    style: {
      transform: "rotate(-12.7159deg)",
      transformOrigin: "top left",
    },
  },
];

export const TentangKami = () => {
  return (
    <main
      id="tentang-kami"
      className="bg-white w-full min-w-[1440px] min-h-[1024px] relative"
    >
      <h1 className="absolute top-[180px] left-[70px] w-[627px] h-[202px] [font-family:'MonteCarlo-Regular',Helvetica] font-normal text-[#fe972f] text-[122.3px] tracking-[0] leading-[123.7px]">
        <span className="[font-family:'MonteCarlo-Regular',Helvetica] font-normal text-[#fe972f] text-[122.3px] tracking-[0] leading-[123.7px]">
          Tentang
        </span>
        <span className="[font-family:'Montserrat-Bold',Helvetica] font-bold">
          &nbsp;
        </span>
        <span className="[font-family:'MonteCarlo-Regular',Helvetica] font-normal text-[#fe972f] text-[122.3px] tracking-[0] leading-[123.7px]">
          kami
        </span>
      </h1>
      <p className="absolute top-[356px] left-[70px] w-[653px] h-[360px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#fe972f] text-[27px] tracking-[0] leading-10">
        <span className="[font-family:'Montserrat-Regular',Helvetica] font-normal text-[#fe972f] text-[27px] tracking-[0] leading-10">
          Kami mahasiswa program studi S-1 Statistika dari{" "}
        </span>
        <strong className="[font-family:'Montserrat-Bold',Helvetica] font-bold">
          Universitas Negeri Gorontalo{" "}
        </strong>
        <span className="[font-family:'Montserrat-Regular',Helvetica] font-normal text-[#fe972f] text-[27px] tracking-[0] leading-10">
          yang mengikuti Program{" "}
        </span>
        <strong className="[font-family:'Montserrat-Bold',Helvetica] font-bold">
          Kreativitas Mahasiswa Asosiasi MIPA LPTK Indonesia (PKM AMLI) 2026
        </strong>
        <span className="[font-family:'Montserrat-Regular',Helvetica] font-normal text-[#fe972f] text-[27px] tracking-[0] leading-10">
          . Fokus kami tertuju pada fenomena merebaknya{" "}
        </span>
        <strong className="[font-family:'Montserrat-Bold',Helvetica] font-bold">
          UMKM kopi jalanan di Provinsi Gorontalo
        </strong>
        <span className="[font-family:'Montserrat-Regular',Helvetica] font-normal text-[#fe972f] text-[27px] tracking-[0] leading-10">
          , berangkat dari hal tersebut kami berinisiatif untuk{" "}
        </span>
        <strong className="[font-family:'Montserrat-Bold',Helvetica] font-bold">
          meningkatkan produktivitas UMKM melalui sistem Niaga Digital.
        </strong>
      </p>
        {teamImages.map((image, index) => (
        <img
        key={index}
        src={image.src}
        alt={image.alt}
        className={image.className}
        style={image.style}
    />
    ))}
    </main>
  );
};
