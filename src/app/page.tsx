import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16 text-center">
      <div className="w-full max-w-md animate-fade-in">
        <Image
          src="/matchup_logo.png"
          alt="MatchUp"
          width={240}
          height={65}
          className="mx-auto mb-10"
          priority
        />

        <div className="card">
          <div className="flex items-center justify-center mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
              <i className="fa-solid fa-heart-crack text-xl" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            MatchUp Kapandı
          </h1>

          <p className="text-sm leading-relaxed text-gray-300 mb-4">
            MatchUp servisini kapattık. Bize bugüne kadar destek olan, kullanan ve burada vakit geçiren herkese teşekkür ederiz.
          </p>

          <p className="text-sm leading-relaxed text-gray-300 mb-6">
            Herhangi bir soru, istek veya ihtiyacın için Discord üzerinden{' '}
            <span className="font-semibold text-white">louchesaints</span>{' '}
            kullanıcı adıyla ulaşabilirsin.
          </p>

          <a
            href="https://discord.com/users/louchesaints"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center justify-center gap-2 w-auto px-6"
          >
            <i className="fa-brands fa-discord" />
            Discord&apos;dan Ulaş
          </a>
        </div>

        <div className="mt-10 space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Teşekkürler</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <a
              href="https://forum-tr.gta.world"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://forum-tr.gta.world/uploads/monthly_2025_02/logo.png.3fe10156c1213bdb8f59cd9bc9e15781.png"
                alt="GTA World TR"
                className="h-7 w-auto"
              />
              <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">GTA World</span>
            </a>
          </div>
          <p className="text-[11px] text-gray-600 mt-2">
            Yardımları ve destekleri için LFM ve GTA World ekibine teşekkür ederiz.
          </p>
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xs text-gray-300 font-semibold">alphamonsta</span>
              <span className="text-gray-700">&</span>
              <span className="text-xs text-gray-300 font-semibold">Happens</span>
              <span className="text-gray-700">&</span>
              <span className="text-xs text-gray-300 font-semibold">eira</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
