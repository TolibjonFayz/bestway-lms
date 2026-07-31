# Jonli dars (Zoom kabi) — texnik qaror va reja

> Ustoz talabi (2026-07-30): *"menga bu saytdagi eng asosiy narsa — imkon bo'lsa Zoomga
> o'xshagan dars o'tadigan platforma kerak. Ustoz dars o'tadi, boshqa bolalar esa
> ustozni kuzatib turadi."*

## Talab nima aslida

Bu **to'liq konferensiya emas** — bu **broadcast** (bir kishi gapiradi, ko'pchilik ko'radi).
Bu farq muhim, chunki broadcast ancha arzon va barqaror ishlaydi:

| | Konferensiya (Zoom meeting) | Broadcast (bizga kerak) |
|---|---|---|
| Kim video yuboradi | Hamma | Faqat ustoz |
| Server yuki | Yuqori | Past |
| Internet talabi (o'quvchi) | Yuqori (yuklash+yuborish) | Past (faqat yuklash) |
| Narx | Qimmat | Arzon |

O'quvchi kamerasi kerak emas — u faqat **ko'radi va eshitadi**, savolni **chat** orqali
yoki **qo'l ko'tarib** (ustoz ruxsat bersa mikrofon ochiladi) beradi.

## Texnologiya tanlovi: LiveKit

**Qaror: LiveKit.** Sabablari:

1. **Custom UI** — LiveKit tayyor oyna bermaydi, SDK beradi. Ya'ni jonli dars ekrani
   bizning dizaynimizda bo'ladi (yashil Bw* komponentlar), Zoom logotipi yoki begona
   iframe emas. Jitsi'ning tayyor oynasini embed qilsak, u butunlay boshqa ko'rinishda
   bo'lardi.
2. **Rol tizimi tug'ma** — "ustoz yuboradi, o'quvchi faqat oladi" cheklovi server
   tomonda token orqali beriladi. O'quvchi brauzer konsolidan turib kamerasini yoqa
   olmaydi. Bu bizning mavjud rol tizimimizga (`teacher` / `student`) tabiiy tushadi.
3. **Ko'chib o'tish yo'li ochiq** — LiveKit Cloud'dagi bir xil dasturni keyinchalik
   o'z serverimizga o'rnatib olsa bo'ladi. Kod o'zgarmaydi, faqat manzil o'zgaradi.
   Ya'ni bugun bepul boshlaymiz, kerak bo'lsa keyin arzonlashtiramiz — qulflanib
   qolmaymiz.

Ko'rib chiqilgan, lekin tanlanmagan:
- **Jitsi (iframe embed)** — eng tez ishga tushadi, lekin dizayn butunlay begona
  ko'rinadi va o'quvchi huquqlarini cheklash ishonchsiz.
- **Zoom SDK** — litsenziya puli, o'zbek kartalari bilan to'lov muammosi.
- **YouTube Live / Telegram efir** — 10-30 soniya kechikish, savol-javob amaliy emas.

## Narx — halol hisob

LiveKit Cloud bepul tier (**Build**): 5,000 WebRTC daqiqa + 50GB trafik/oy, karta talab
qilinmaydi. WebRTC daqiqa = **ishtirokchi × daqiqa**, ya'ni 13 kishilik 90 daqiqalik
dars = 1,170 daqiqa.

Real hisob (12 o'quvchi + 1 ustoz, 90 daqiqalik dars):

| Stsenariy | Oyiga daqiqa | Bepul tierga sig'adimi |
|---|---|---|
| 1 guruh, haftada 3 dars | ~15,000 | ❌ yo'q (5,000 chegara) |
| Dev/test paytida | ~2,000 | ✅ ha, bemalol |

Ya'ni **ishlab chiqish va sinov uchun bepul tier to'liq yetarli**, lekin markaz haqiqiy
darslarni boshlagach yetmaydi.

Shu sababli reja: **avval Cloud'da bepul quramiz va sinaymiz → ishlagach o'z serverimizga
ko'chiramiz.** O'z serverida (Hetzner VPS ~€8/oy, 20TB trafik) daqiqa cheklovi umuman
bo'lmaydi — faqat serverning o'zi to'lanadi. Broadcast rejimida 13 kishilik dars serverga
deyarli yuk bermaydi (server videoni qayta ishlamaydi, faqat uzatadi).

⚠️ Muhim: **jonli dars serveri Railway'da ishlamaydi** — LiveKit UDP portlarni talab
qiladi, Railway esa faqat HTTP beradi. Shuning uchun o'z serveriga ko'chganda alohida
VPS kerak bo'ladi (Hetzner, Contabo yoki shunga o'xshash). Railway'dagi backend o'z
o'rnida qoladi — u faqat token beradi, bu oddiy HTTP.

## Bosqichlar

### 9-bosqich — Jonli dars MVP
Ustoz dars boshlaydi, o'quvchilar qo'shilib ko'radi. Eng kam, lekin ishlaydigan holat.
- Backend: `lesson_sessions` jadvali, LiveKit token endpoint (rolga qarab huquq beradi)
- Ustoz: kamera, mikrofon, **ekran ulashish** (IELTS darsida slayd ko'rsatish uchun shart)
- O'quvchi: ko'radi/eshitadi, kamerasi yo'q
- Ustoz darsni boshlaydi va tugatadi; tugagach hamma chiqadi
- Ulanish uzilsa avtomatik qayta ulanish
- Ishtirokchilar ro'yxati (kim onlayn)

### 10-bosqich — Interaktivlik va nazorat
- Chat (savol berish)
- "Qo'l ko'tarish" → ustoz ruxsat bersa o'quvchi mikrofoni ochiladi
- Ustoz moderatsiyasi: mikrofonni o'chirish, darsdan chiqarish
- **Avtomatik davomat** — kim qo'shildi, qancha turdi (mavjud `attendance` jadvaliga yoziladi)
- Dars eslatmasi (dars boshlanishiga 10 daqiqa qolganda bildirishnoma)

### 11-bosqich — Yozib olish (ixtiyoriy, keyinroq)
Darsni yozib olib, kelolmagan o'quvchi keyin ko'rishi. Bu **saqlash joyi** talab qiladi
(1.5 soatlik dars ~700MB–1GB), shuning uchun alohida qaror va byudjet kerak.
Ustoz bu haqda so'ramaguncha qilmaymiz.

## Ustozdan aniqlashtirish kerak bo'lgan savollar

Bularni bilmasdan turib ham 9-bosqichni boshlash mumkin, lekin javoblar rejani aniqlashtiradi:

1. **Bir darsda nechta o'quvchi bo'ladi?** (12 tami, 30 tami — narx va server tanloviga ta'sir qiladi)
2. **Ustoz ekran ulashishi kerakmi?** (slayd, kitob sahifasi ko'rsatish — deyarli aniq "ha")
3. **O'quvchi gapira olishi kerakmi?** (Speaking mashqi uchun — "qo'l ko'tarish" orqali)
4. **Darsni yozib olish kerakmi?** (kelolmaganlar keyin ko'rishi uchun)
5. **Doska (whiteboard) kerakmi?** (matematika darsida yozib tushuntirish uchun)
6. **Ustozlar qaysi qurilmadan dars o'tadi?** (kompyuter/noutbukmi — telefondan ekran ulashish qiyin)
7. **O'quvchilarning interneti qanday?** (mobil internetda video sifatini pasaytirish kerak bo'ladi)
