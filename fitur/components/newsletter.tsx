export function Newsletter() {
    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
            id="newsletter"
        >
            <div className="rounded-xl border border-[#cbc4d2]/60 bg-white p-6 shadow-lg shadow-[#0f172a]/5 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
                <div>
                    <h2 className="font-heading text-2xl font-semibold">
                        Dapatkan rekomendasi halal terbaru
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#494551]">
                        Newsletter mingguan berisi destinasi baru, promo
                        lokal, dan panduan fasilitas muslim-friendly.
                    </p>
                </div>
                <form
                    action="#newsletter"
                    className="mt-5 flex gap-2 md:mt-0 md:min-w-[420px]"
                >
                    <input
                        aria-label="Email newsletter"
                        className="h-12 min-w-0 flex-1 rounded-lg border border-[#cbc4d2] bg-[#fdf7ff] px-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#e1d4fd]"
                        placeholder="Email Anda"
                        type="email"
                    />
                    <button
                        className="h-12 rounded-lg bg-[#4f378a] px-5 text-sm font-bold text-white"
                        type="submit"
                    >
                        Daftar
                    </button>
                </form>
            </div>
        </section>
    );
}
