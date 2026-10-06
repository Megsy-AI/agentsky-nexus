import { useEffect, useState } from "react";
import { useUserLang } from "@/lib/authI18n";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, X } from "lucide-react";
import { isOctoberOfferActive, OCTOBER_OFFER_END } from "@/lib/octoberOffer";
import artwork from "@/assets/october-celebration.png.asset.json";
import { getAuthState, subscribeAuthState } from "@/lib/authStore";

const dismissalKey = "megsy-october-6-2026-auth-sheet-seen";

export default function OctoberOfferDialog() {
  const ar = useUserLang() === "ar-eg";
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    const unsubscribe = subscribeAuthState((state) => setAuthenticated(state.resolved && state.authenticated));
    const state = getAuthState();
    setAuthenticated(state.resolved && state.authenticated);
    return () => { unsubscribe(); };
  }, []);
  useEffect(() => {
    setOpen(false);
    if (!authenticated) return;
    if (!isOctoberOfferActive()) return;
    try { if (!localStorage.getItem(dismissalKey)) setOpen(true); } catch { setOpen(true); }
    const timer = setTimeout(() => setOpen(false), Math.max(0, OCTOBER_OFFER_END - Date.now()));
    return () => clearTimeout(timer);
  }, [authenticated]);
  const close = () => { setOpen(false); try { localStorage.setItem(dismissalKey, "1"); } catch {} };
  return <Sheet open={authenticated && open} onOpenChange={(v) => { if (!v) close(); }}>
    <SheetContent side="bottom" className="megsy-october-sheet" dir={ar ? "rtl" : "ltr"} data-no-translate>
      <div className="october-sheet-handle" aria-hidden="true" />
      <div className="october-sheet-inner">
        <img src={artwork.url} alt={ar ? "تصميم ذكرى ٦ أكتوبر: أنور السادات وعبد الفتاح السيسي وعلم مصر والقاهرة" : "October 6 commemorative artwork with Anwar Sadat, Abdel Fattah el-Sisi, Egypt’s flag and Cairo"} width={1365} height={768} className="october-sheet-artwork" />
        <div className="october-sheet-copy">
          <div className="october-sheet-eyebrow"><span>{ar ? "٦ أكتوبر · يوم العبور" : "OCTOBER 6 · A DAY TO CELEBRATE"}</span><Button variant="ghost" size="icon-sm" onClick={close} aria-label={ar ? "إغلاق الإعلان" : "Dismiss announcement"}><X size={18} /></Button></div>
          <SheetTitle className="october-sheet-title">{ar ? "يوم نفتخر بيه. وهدية ليك." : "A day of pride. A gift for you."}</SheetTitle>
          <SheetDescription className="october-sheet-description">{ar ? "بنحتفل بذكرى نصر أكتوبر معاك: ٢٤ ساعة من الشات والبحث والكتابة والكود والوكلاء مجانًا للجميع، بدون حدود استخدام من ميغسي." : "Celebrate Egypt’s October victory with 24 hours of free chat, research, writing, coding and non-media agents for everyone. No Megsy usage quota."}</SheetDescription>
          <p className="october-sheet-exclusion">{ar ? "الصور والفيديوهات خارج العرض، بشروطها وأسعارها المعتادة." : "Images and videos keep their usual prices and access rules."}</p>
          <div className="october-sheet-footer"><p>{ar ? "حتى ٧ أكتوبر، ٣:٥٢ صباحًا بتوقيت القاهرة. تسجيل الدخول وتوفر خدمات المزود مطلوبان." : "Until October 7, 3:52 a.m. Cairo time. Sign-in and provider availability apply."}</p><Button variant="neutral" onClick={close}>{ar ? "يلا نبدأ" : "Let’s begin"}<ArrowUpRight size={16} /></Button></div>
        </div>
      </div>
    </SheetContent>
  </Sheet>;
}