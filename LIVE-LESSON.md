# Jonli dars (Zoom kabi) — texnik qaror va reja

> Ustoz talabi (2026-07-30): *"menga bu saytdagi eng asosiy narsa — imkon bo'lsa Zoomga
> o'xshagan dars o'tadigan platforma kerak."*
> Aniqlashtiruv (2026-07-31): *"Zoomda hamma bir vaqtda ko'rishib gaplashadi."* — ya'ni
> **to'liq konferensiya**: barcha o'quvchilarning kamerasi/mikrofoni erkin, hech kim
> ustoz ruxsatiga muhtoj emas. Bir darsda maksimal **12 kishi**. Ustoz kompyuterdan
> o'tadi. Ingliz tilida qoida tushuntirishda foydali bo'lishi mumkin (2-band) va
> davomat oson bo'lsa yaxshi (3-band) — ikkalasi ham "shart emas, bo'lsa yaxshi".
> Texnologiya qarori (2026-07-31): Tolibjon "Zoom'ni o'zini integratsiya qilsak
> bo'ladimi" deb so'radi → tekshirilib, **Zoom Video SDK** tanlandi (pastda sabab).

## Talab nima

**To'liq ko'p tomonlama video konferensiya** — Zoom/Google Meet kabi. 12 tagacha
o'quvchi + 1 ustoz, hammaning kamerasi va mikrofoni **o'zi boshqaradigan**, istalgan
payt yoqib-o'chira oladi. Ustozda esa qo'shimcha **host huquqlari** bo'ladi: birortasini
ovozini o'chirish, darsdan chiqarish, hammani birdek ovozsiz qilish — chunki 12 bola
nazoratsiz bo'lsa, real darsda tartibsizlik chiqishi tabiiy.

## Texnologiya tanlovi: Zoom Video SDK

Ikki xil "Zoom" bor, farqini aniq ajratish kerak:

| | **Zoom Meeting SDK** | **Zoom Video SDK** (tanlangan) |
|---|---|---|
| Nima beradi | Tayyor Zoom oynasini o'z saytga o'rnatadi | Xom video/audio infratuzilma, UI'ni o'zimiz quramiz |
| Ko'rinish | Zoom'ning o'z brendi, logotipi | To'liq bizning Bw* dizaynimiz |
| Bizga mosmi | Yo'q — begona ko'rinadi | Ha — LiveKit bilan bir xil toifada |

**Qaror: Zoom Video SDK**, LiveKit'dan almashtirildi. Sabablari:

1. **Dizayn erkinligi bir xil** — Video SDK ham "xom" SDK, LiveKit kabi o'z UI'imizni
   quramiz. Bu jihatdan ikkisi teng, avvalgi "Zoom begona ko'rinadi" degan xulosa
   noto'g'ri edi (u Meeting SDK'ga tegishli edi, Video SDK'ga emas).
2. **Narx — bu asosiy sabab.** To'liq gallery-konferensiyada (12 kishi bir vaqtda video
   yuboradi) LiveKit trafikni (GB) alohida hisoblaydi va bu tez o'sib ketadi. Zoom Video
   SDK faqat ishtirokchi-daqiqa bo'yicha hisoblaydi, trafik uchun qo'shimcha to'lov yo'q —
   quyidagi hisobga qarang.
3. Kamchiligi ham bor va bilib turish kerak — pastdagi "Nimadan voz kechyapmiz" bo'limida.

## Narx — halol hisob (Zoom Video SDK vs LiveKit)

To'liq konferensiyada 13 kishining (12 o'quvchi + ustoz) hammasi video yuboradi VA
qabul qiladi — bu LiveKit'da alohida hisoblanadigan trafikni (GB) keskin oshiradi,
Zoom'da esa yo'q.

**Zoom Video SDK:** 10,000 daqiqa/oy bepul, undan keyin **$0.0035/daqiqa** (daqiqa =
ishtirokchi × daqiqa, ya'ni 13 kishi 10 daqiqa = 130 daqiqa). Trafik alohida
hisoblanmaydi.

**LiveKit Cloud** (avvalgi tanlov, taqqoslash uchun): 5,000 daqiqa + 50GB/oy bepul,
undan keyin daqiqa arzon ($0.0004-0.0005), lekin **trafik $0.10-0.12/GB** — va
to'liq gallery darsida trafik tez o'sadi (~20-30GB/dars, 13 kishi, 90 daqiqa).

Real hisob (1 guruh, haftada 3 dars, 90 daqiqa, 12 dars/oy):

| | Ishtirokchi-daqiqa/oy | Bepul limit | Pullik qism/oy (taxminiy) |
|---|---|---|---|
| **Zoom Video SDK** | ~14,000 | 10,000 daqiqa | ~4,000 daq × $0.0035 ≈ **$14** |
| **LiveKit Cloud** | ~14,000 | 5,000 daq + 50GB | daqiqa arzon, lekin ~300GB trafik × $0.11 ≈ **$80-150+** |

**Xulosa: to'liq gallery-konferensiya uchun Zoom Video SDK ancha arzon** — Zoom
trafikni alohida hisoblamagani uchun. Markaz kattalashib bir necha guruh bo'lsa ham,
narx chiziqli o'sadi (masalan 3 guruh ≈ $110-120/oy), kutilmagan sakrash bo'lmaydi.

## Nimadan voz kechyapmiz (halol tan olish)

**LiveKit ochiq kodli — o'z serverimizga ko'chirib, doimiy to'lovdan butunlay
qutulish mumkin edi.** Zoom Video SDK — Zoom'ning yopiq bulut xizmati, **hech qachon
o'z serverga ko'chirib bo'lmaydi**. Markaz qancha katta bo'lmasin (10, 20 guruh),
har doim Zoom'ga daqiqasiga to'lab turiladi — narx chiqib ketish yo'li yo'q.

Bu amaliy qaror: **hozirgi va yaqin kelajakdagi hajm uchun** (1-3 guruh) Zoom sezilarli
arzon va oddiyroq, shuning uchun tanlandi. Agar markaz kelajakda juda kattalashib
(10+ guruh bir vaqtda) oylik xarajat sezilarli bo'lib qolsa, LiveKit'ga (yoki o'z
serverga) qaytib o'tish alohida muhokama mavzusi bo'ladi — bu hozir qaror qilinmaydi.

## Aniqlashtirish kerak — to'lov

⚠️ Zoom Video SDK **Zoom Build Platform** orqali ishlaydi — kredit tizimi ($100/100
kredit), USD kartasi bilan to'lanadi. **Bu hali tekshirilmagan:** o'zbek bank
kartalari (UzCard/Humo asosidagi Visa/Mastercard) bunday xalqaro USD to'lovni qabul
qiladimi — bu Railway/Vercel/LiveKit uchun ham bir xil masala, agar ulardan biri
uchun kartangiz ishlagan bo'lsa, ehtimol bu yerda ham ishlaydi. Lekin build boshlashdan
oldin Zoom Marketplace'da hisob ochib, kichik summa bilan sinab ko'rish tavsiya
etiladi — 9-bosqichni boshlashdan oldin.

## Amaliy ehtiyot choralari (kod darajasida, alohida qaror emas)

- **Ustozning o'z interneti** — 12 kishining oqimini bir vaqtda qabul qilish talab
  qiladi. Zoom Video SDK'ning avtomatik sifat moslashuvi (simulcast) yoqilishi kerak —
  tarmoq sekin bo'lsa kichik plitkalar avtomatik pastroq sifatga tushadi.
- **Ovoz aralashishi** — 12 mikrofon ochiq bo'lsa aks-sado xavfi bor. Brauzerning aks-sado
  bostirishi buni katta qismini hal qiladi; o'quvchilarga quloqchin tavsiya qilish
  UI'da ko'rsatilsa foydali.
- **Ustoz nazorati shart** — "hamma erkin" bo'lsa ham, ustozda birovni ovozsiz qilish/
  chiqarib yuborish tugmasi bo'lishi shart — sinfda tartib uchun.

## Bosqichlar

### 9-bosqich — Ko'p tomonlama video MVP
Hamma (ustoz + 12 o'quvchigacha) bir xonada, kamera/mikrofon o'zi boshqaradi.
- Backend: `lesson_sessions` jadvali, Zoom Video SDK JWT endpoint — ustoz uchun
  `role_type: 1` (host), o'quvchi uchun `role_type: 0`
- Gallery-grid UI: har kim o'z plitkasida, faol so'zlovchi katталashadi
- Kamera/mikrofon yoqish-o'chirish tugmalari (har kim o'ziniki uchun)
- Ustoz: **ekran ulashish** (qoida tushuntirish uchun, ustoz "bo'lsa yaxshi" degan)
- Ustoz darsni boshlaydi/tugatadi; tugagach hamma chiqadi
- Ulanish uzilsa avtomatik qayta ulanish

### 10-bosqich — Nazorat va interaktivlik
- Ustoz host paneli: birontasini ovozsiz qilish, hammani ovozsiz qilish, darsdan chiqarish
- Chat (matn orqali savol)
- **Avtomatik davomat** — kim qo'shildi, qancha turdi (mavjud `attendance` jadvaliga)
  — ustoz "bo'lsa yaxshi" degan, shart emas, lekin infratuzilma tayyor bo'lgani uchun
  qo'shish qiyin emas
- Dars eslatmasi (boshlanishiga 10 daqiqa qolganda bildirishnoma)

### 11-bosqich — Yozib olish (ixtiyoriy, keyinroq)
Ustoz "qiyin bo'lmasa yaxshi bo'lardi" degan — talab emas, xohish. Zoom Video SDK'da
**cloud recording** xizmati bor ($4/1,000 daqiqa qo'shimcha), o'z serverga saqlashdan
ko'ra soddaroq bo'lishi mumkin. Boshqa hamma narsa (9, 10-bosqich) ishlab, sinovdan
o'tgach ko'rib chiqiladi.

## Ustoz javob bergan savollar (2026-07-31)

1. **Bir darsda nechta o'quvchi?** → Maksimal 12
2. **Ustoz ekran ulashishi kerakmi?** → "Bo'lsa yaxshi" — qoida tushuntirish uchun,
   ingliz tilida ham
3. **Darsni yozib olish kerakmi?** → "Qiyin bo'lmasa yaxshi bo'lardi" — xohish, shart emas
4. **Ustozlar qaysi qurilmadan dars o'tadi?** → Kompyuterdan

## Hali ochiq qolgan savollar

- **Zoom hisobiga USD karta bilan to'lov o'tadimi?** — 9-bosqichdan oldin kichik
  summa bilan sinab ko'rish kerak (yuqoridagi "Aniqlashtirish kerak — to'lov" bo'limi).
- **Doska (whiteboard) kerakmi?** — matematika darsida yozib tushuntirish uchun.
  Ustozdan so'ralmagan, keyinroq kerak bo'lsa alohida qo'shiladi.
- **O'quvchilarning interneti qanday?** — mobil internetda bo'lsa, past sifat rejimi
  muhim bo'ladi (yuqoridagi "amaliy ehtiyot choralari" qismida shu hisobga olingan).
