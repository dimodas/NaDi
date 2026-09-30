import { type FormEvent, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import desainTanpaJudul212 from "./desain-tanpa-judul-21-2.svg";
import image from "./image.svg";
import image8 from "./image-8.svg";
import KONTEN141 from "./KONTEN-1-4-1.svg";
import rectangle39 from "./rectangle-39.svg";
import rectangle40 from "./rectangle-40.svg";
import vector from "./vector.svg";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsLoading(false);

    if (error) {
      setErrorMessage("Login gagal: email atau password salah.");
      return;
    }

    setSuccessMessage(`Selamat datang, ${data.user?.email}! Login berhasil.`);
  };

  const handleAboutClick = () => {
    document.getElementById("tentang-kami")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main
      id="login-page"
      className="bg-white w-full min-w-[1440px] min-h-[1024px] relative overflow-hidden"
    >
      <img
        className="absolute top-0 left-[596px] w-[844px] h-[1024px] aspect-[0.56] object-cover"
        alt=""
        aria-hidden="true"
        src={KONTEN141}
      />
      <img
        className="absolute top-[138px] left-[720px] w-[720px] h-[886px] aspect-[0.81]"
        alt="Suasana pasar UMKM"
        src={desainTanpaJudul212}
      />
      <img
        className="absolute top-0 left-0 w-[753px] h-[1024px]"
        alt=""
        aria-hidden="true"
        src={rectangle39}
      />
      <section
        id="about-niaga-digital"
        className="absolute top-0 left-0 w-[753px] h-[1024px]"
        aria-label="Tentang Niaga Digital"
      >
        <img
          className="absolute top-[234px] left-[181px] w-[377px] h-[362px] aspect-[1.04] object-cover"
          alt="Logo Niaga Digital"
          src={image8}
        />
        <h1 className="absolute top-[634px] left-[107px] w-[525px] h-[51px] flex items-center justify-center [font-family:'Montserrat-Regular',Helvetica] font-normal text-white text-[60.2px] text-center tracking-[0] leading-[normal] whitespace-nowrap">
          Niaga Digital
        </h1>
        <img
          className="absolute top-[715px] left-[146px] w-[449px] h-[102px]"
          alt=""
          aria-hidden="true"
          src={rectangle40}
        />
        <button
          type="button"
          onClick={handleAboutClick}
          className="absolute top-[727px] left-[143px] w-[453px] h-[69px] flex items-center justify-center [font-family:'Montserrat-Bold',Helvetica] font-bold text-[#fe972f] text-[48.2px] text-center tracking-[0] leading-[normal] cursor-pointer"
          aria-label="Tentang kami"
        >
          Tentang kami
        </button>
      </section>
      <section
        className="absolute top-[111px] left-[835px] w-[531px] h-[796px]"
        aria-labelledby="login-heading"
      >
        <h2
          id="login-heading"
          className="absolute top-0 left-[30px] w-[467px] h-[55px] flex items-center justify-center [text-shadow:0px_4px_10px_#0000004c] [font-family:'Montserrat-Bold',Helvetica] font-bold text-white text-[46px] text-center tracking-[0] leading-[normal] whitespace-nowrap"
        >
          Halo mitra UMKM!
        </h2>
        <form onSubmit={handleSubmit} className="contents">
          <div
            className="absolute top-[95px] left-0 w-[531px] h-[701px] bg-[#d9d9d933] rounded-[20px] border-2 border-solid border-white backdrop-blur-[4.0px] backdrop-brightness-[100.0%] backdrop-saturate-[90.5%] backdrop-hue-rotate-[10.0deg] [-webkit-backdrop-filter:blur(4.0px)_brightness(100.0%)_saturate(90.5%)_hue-rotate(10.0deg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_2px_rgba(0,0,0,0.05),inset_-1px_0_2px_rgba(0,0,0,0.04)]"
            aria-hidden="true"
          />
          <h3 className="absolute top-[151px] left-[46px] w-[467px] h-[55px] flex items-center [text-shadow:0px_4px_10px_#0000004c] [font-family:'Montserrat-Bold',Helvetica] font-bold text-white text-[46px] tracking-[0] leading-[normal] whitespace-nowrap">
            Masuk
          </h3>
          <label className="absolute top-[226px] left-[46px] w-[439px] h-[76px] bg-[#ffffff4c] rounded-[10px] border border-solid border-white backdrop-blur-[50.0px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(50.0px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_33px_rgba(0,0,0,0.20),inset_-1px_0_33px_rgba(0,0,0,0.16)]">
            <span className="sr-only">Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="Email"
              className="w-full h-full pl-4 pr-14 [text-shadow:0px_4px_10px_#00000080] [font-family:'Montserrat-Regular',Helvetica] font-normal text-white text-[31px] tracking-[0] leading-[normal] placeholder:text-white placeholder:opacity-100"
              required
            />
            <img
              src={vector}
              alt=""
              aria-hidden="true"
              className="absolute right-[24px] top-1/2 -translate-y-1/2 w-[26px] h-[29px] opacity-90 pointer-events-none"
            />
          </label>
          <label className="absolute top-[334px] left-[46px] w-[439px] h-[76px] bg-[#ffffff4c] rounded-[10px] border border-solid border-white backdrop-blur-[50.0px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(50.0px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_33px_rgba(0,0,0,0.20),inset_-1px_0_33px_rgba(0,0,0,0.16)]">
            <span className="sr-only">Password</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Password"
              className="w-full h-full pl-4 pr-14 [text-shadow:0px_4px_10px_#00000080] [font-family:'Montserrat-Regular',Helvetica] font-normal text-white text-[31px] tracking-[0] leading-[normal] placeholder:text-white placeholder:opacity-100"
              required
            />
            <img
              src={image}
              alt=""
              aria-hidden="true"
              className="absolute right-[24px] top-1/2 -translate-y-1/2 w-[25px] h-[26px] opacity-90 pointer-events-none"
            />
          </label>
          <label className="absolute top-[423px] left-[46px] h-[29px] flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="w-[34px] h-[29px] bg-[#ffffff4c] rounded-[5px] border border-solid border-white backdrop-blur-[50.0px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(50.0px)_brightness(100.0%)_saturate(100.0%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_33px_rgba(0,0,0,0.20),inset_-1px_0_33px_rgba(0,0,0,0.16)] checked:bg-white checked:after:content-['✓'] checked:after:flex checked:after:h-full checked:after:items-center checked:after:justify-center checked:after:text-[#fe972f] checked:after:text-[24px]"
            />
            <span className="ml-[5px] w-[203px] h-[55px] flex items-center [text-shadow:0px_4px_10px_#00000080] [font-family:'Montserrat-Regular',Helvetica] font-normal text-white text-[23px] tracking-[0] leading-[normal]">
              Remember me
            </span>
          </label>
          {errorMessage && (
            <p
              role="alert"
              className="absolute top-[458px] left-[46px] w-[439px] text-center [font-family:'Montserrat-Regular',Helvetica] text-[16px] text-red-100 bg-red-600/80 rounded-[8px] px-3 py-2"
            >
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p
              role="status"
              className="absolute top-[458px] left-[46px] w-[439px] text-center [font-family:'Montserrat-Regular',Helvetica] text-[16px] text-white bg-green-600/80 rounded-[8px] px-3 py-2"
            >
              {successMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="absolute top-[498px] left-[46px] w-[439px] h-[76px] bg-white rounded-[10px] border border-solid shadow-[0px_4px_4px_#00000040,inset_0_1px_0_rgba(255,255,255,0.40),inset_1px_0_0_rgba(255,255,255,0.32),inset_0_-1px_16px_rgba(0,0,0,0.20),inset_-1px_0_16px_rgba(0,0,0,0.16)] backdrop-blur-[25.0px] backdrop-brightness-[100.0%] backdrop-saturate-[100.0%] [-webkit-backdrop-filter:blur(25.0px)_brightness(100.0%)_saturate(100.0%)] flex items-center justify-center [text-shadow:0px_4px_10px_#0000004c] [font-family:'Montserrat-Regular',Helvetica] font-normal text-black text-[37px] text-center tracking-[0] leading-[normal] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Memproses..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
};
