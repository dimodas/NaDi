import { type FormEvent, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import image8 from "./image-8.svg";
import vector from "./vector.svg";
import image from "./image.svg";

export const MobileLoginPage = () => {
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

  return (
    <main
      id="login-page"
      className="flex min-h-screen flex-col items-center justify-center bg-[#fff8f1] px-5 py-10"
    >
      <img src={image8} alt="Logo Niaga Digital" className="mb-4 h-20 w-20" />
      <h1 className="mb-1 text-xl font-bold text-[#e66307] [font-family:'Montserrat-Bold',Helvetica]">
        Halo mitra UMKM!
      </h1>
      <p className="mb-6 text-sm text-[#9a8a78]">Masuk untuk kelola usahamu</p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[#f0d9bd] bg-white p-5 shadow-sm"
      >
        <label className="mb-3 block text-sm text-[#5c5245]">
          Email
          <div className="relative mt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="nama@nadi.id"
              className="w-full rounded-lg border border-[#e7d3ba] py-2.5 pl-3 pr-11 text-sm outline-none focus:border-[#fe972f]"
              required
            />
            <img
              src={vector}
              alt=""
              aria-hidden="true"
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60"
            />
          </div>
        </label>

        <label className="mb-3 block text-sm text-[#5c5245]">
          Password
          <div className="relative mt-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Password"
              className="w-full rounded-lg border border-[#e7d3ba] py-2.5 pl-3 pr-11 text-sm outline-none focus:border-[#fe972f]"
              required
            />
            <img
              src={image}
              alt=""
              aria-hidden="true"
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60"
            />
          </div>
        </label>

        <label className="mb-4 flex items-center gap-2 text-sm text-[#5c5245]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Ingat saya
        </label>

        {errorMessage && (
          <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p role="status" className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-[#fe972f] py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {isLoading ? "Memproses..." : "Login"}
        </button>
      </form>
    </main>
  );
};
