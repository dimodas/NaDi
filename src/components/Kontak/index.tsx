const WhatsAppIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" />
  </svg>
);

const MailIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LocationIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const Kontak = () => {
  return (
    <main
      id="kontak"
      className="relative w-full min-w-[1440px] overflow-hidden bg-[linear-gradient(180deg,rgba(197,80,15,1)_0%,rgba(237,142,18,1)_100%)] py-20"
    >
      <div className="mx-auto max-w-[760px] px-10 text-center text-white">
        <h2 className="mb-12 text-5xl font-bold [font-family:'Montserrat-Bold',Helvetica]">
          Hubungi Kami
        </h2>

        <div className="flex flex-col items-center gap-6 [font-family:'Montserrat-Regular',Helvetica] text-xl">
          <a
            href="https://wa.me/6281380157727"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <WhatsAppIcon />
            (+62) 813-8015-7727
          </a>

          <a
            href="https://instagram.com/pkmpi.nadigital"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <InstagramIcon />
            @pkmpi.nadigital
          </a>

          <a
            href="mailto:nadiigital@gmail.com"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <MailIcon />
            nadiigital@gmail.com
          </a>

          <p className="flex max-w-[520px] items-start gap-3 text-center">
            <span className="mt-0.5 shrink-0">
              <LocationIcon />
            </span>
            Jl. Nani Wartabone (eks Panjaitan), Kota Gorontalo, Provinsi Gorontalo
          </p>
        </div>

        <p className="mt-16 text-sm opacity-80">
          &copy; {new Date().getFullYear()} Niaga Digital. Semua hak dilindungi.
        </p>
      </div>
    </main>
  );
};
