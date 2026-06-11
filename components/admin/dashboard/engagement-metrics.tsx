"use client";

import { useEffect, useState } from "react";
import { Bookmark, MessageCircle, Navigation, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BookmarkedDestination {
  id: string;
  name: string;
  city: string;
  slug: string;
  bookmarkCount: number;
}

interface WhatsappClickedUmkm {
  id: string;
  name: string;
  address: string;
  slug: string;
  whatsappClickCount: number;
}

interface CtaSummary {
  totalRouteClicks: number;
  totalWhatsappClicks: number;
  totalBookmarks: number;
  uniqueBookmarkUsers: number;
}

export default function EngagementMetrics() {
  const [bookmarked, setBookmarked] = useState<BookmarkedDestination[]>([]);
  const [whatsappUmkms, setWhatsappUmkms] = useState<WhatsappClickedUmkm[]>([]);
  const [summary, setSummary] = useState<CtaSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setBookmarked(json.data.topBookmarkedDestinations || []);
          setWhatsappUmkms(json.data.topWhatsappClickedUmkms || []);
          setSummary(json.data.ctaSummary || null);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section className="space-y-5">
      <Card className="rounded-xl border-[#d7e5dc] bg-white shadow-none">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#d7e5dc] px-5 py-4">
          <div>
            <CardTitle className="font-heading text-xl font-semibold">
              Engagement Metrics
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-[#494551]">
              User behavior tracking — bookmarks &amp; CTA conversions.
            </CardDescription>
          </div>
          <TrendingUp className="h-4.5 w-4.5 text-[#047857]" />
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-4 xl:grid-cols-2">
            {/* Top Bookmarked Destinations */}
            <div className="rounded-lg border border-[#dbe7df] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-stone-700">
                <Bookmark className="h-4 w-4 text-[#047857]" />
                Destinasi Paling Banyak Disimpan
              </h3>
              {bookmarked.length === 0 ? (
                <p className="text-xs text-stone-400">Belum ada data bookmark.</p>
              ) : (
                <div className="space-y-3">
                  {bookmarked.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-500">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-stone-800">
                            {item.name}
                          </p>
                          <p className="truncate text-xs text-stone-500">
                            {item.city}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-[#047857]">
                        {item.bookmarkCount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top WhatsApp Clicked UMKMs */}
            <div className="rounded-lg border border-[#dbe7df] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-stone-700">
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                UMKM Populer (Klik WhatsApp Tertinggi)
              </h3>
              {whatsappUmkms.length === 0 ? (
                <p className="text-xs text-stone-400">Belum ada data WhatsApp.</p>
              ) : (
                <div className="space-y-3">
                  {whatsappUmkms.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-500">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-stone-800">
                            {item.name}
                          </p>
                          <p className="truncate text-xs text-stone-500">
                            {item.address}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-emerald-600">
                        {item.whatsappClickCount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA Summary Bar */}
          {summary && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border border-[#dbe7df] p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Route Maps
                  </p>
                  <p className="text-lg font-bold text-stone-800">
                    {summary.totalRouteClicks.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[#dbe7df] p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-700">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    WhatsApp
                  </p>
                  <p className="text-lg font-bold text-stone-800">
                    {summary.totalWhatsappClicks.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[#dbe7df] p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                  <Bookmark className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Total Bookmark
                  </p>
                  <p className="text-lg font-bold text-stone-800">
                    {summary.totalBookmarks.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
