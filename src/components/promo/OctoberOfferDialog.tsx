import { useEffect, useState } from "react";
import { useUserLang } from "@/lib/authI18n";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isOctoberOfferActive, OCTOBER_OFFER_END } from "@/lib/octoberOffer";
import egypt from "@/assets/egypt-october.jpg";

export default function OctoberOfferDialog() {
  const ar = useUserLang() === "ar-eg";
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const key = "megsy-october-6-2026-seen";
    if (!isOctoberOfferActive()) return;
    try { if (!localStorage.getItem(key)) setOpen(true); } catch { setOpen(true); }
    const timer = setTimeout(() => setOpen(false), Math.max(0, OCTOBER_OFFER_END - Date.now()));
    return () => clearTimeout(timer);
  }, []);
  const close = () => { setOpen(false); try { localStorage.setItem("megsy-october-6-2026-seen", "1"); } catch {} };
  return <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}><DialogContent className="megsy-october-dialog max-w-lg overflow-hidden p-0" dir={ar ? "rtl" : "ltr"} data-no-translate>
    <img src={egypt} alt={ar ? "علم مصر فوق القاهرة والنيل — تصميم احتفالي" : "Egyptian flag over Cairo and the Nile — celebratory artwork"} width={1536} height={1024} className="aspect-[16/9] w-full object-cover" />
    <div className="p-6"><p className="mb-2 text-xs font-medium text-muted-foreground">{ar ? "من مصر، لكل العالم · ٦ أكتوبر" : "From Egypt, to everyone · October 6"}</p><DialogTitle className="text-2xl">{ar ? "يوم نصرنا… ويومك مع ميغسي" : "A day of pride. A day on us."}</DialogTitle><DialogDescription className="mt-4 text-sm leading-relaxed">{ar ? "في ذكرى نصر أكتوبر، بنحتفل بروح مصر اللي عرفت تعبر وتحقق حلمها. ومن قلب القاهرة، ميغسي بيهدي الجميع ٢٤ ساعة من الشات والبحث والكتابة والكود واستخدام الوكلاء مجانًا، من غير حدود استخدام من ميغسي." : "Celebrating Egypt’s October victory, Megsy is opening chat, research, writing, coding and non-media agents to everyone for 24 hours, with no Megsy usage quota."}</DialogDescription><p className="mt-3 text-sm font-medium">{ar ? "الصور والفيديوهات مش ضمن العرض، وبتفضل بشروطها وأسعارها العادية." : "Images and videos are excluded; their normal prices and access rules still apply."}</p><p className="mt-3 text-xs text-muted-foreground">{ar ? "العرض ينتهي ٧ أكتوبر ٢٠٢٦، الساعة ٣:٥٢ صباحًا بتوقيت القاهرة. تسجيل الدخول مطلوب؛ توفر الخدمات عند المزود يظل ساريًا." : "Ends October 7, 2026 at 3:52 a.m. Cairo time. Sign-in required; provider availability still applies."}</p><Button variant="neutral" className="mt-5 w-full" onClick={close}>{ar ? "يلا نبدأ" : "Let’s get started"}</Button></div>
  </DialogContent></Dialog>;
}