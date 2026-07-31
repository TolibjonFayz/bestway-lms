# Jonli dars (Zoom kabi) — texnik qaror va reja

> Ustoz talabi (2026-07-30): *"menga bu saytdagi eng asosiy narsa — imkon bo'lsa Zoomga
> o'xshagan dars o'tadigan platforma kerak."*
> Aniqlashtiruv (2026-07-31): *"Zoomda hamma bir vaqtda ko'rishib gaplashadi."* — ya'ni
> **to'liq konferensiya**: barcha o'quvchilarning kamerasi/mikrofoni erkin, hech kim
> ustoz ruxsatiga muhtoj emas. Bir darsda maksimal **12 kishi**. Ustoz kompyuterdan
> o'tadi. Ingliz tilida qoida tushuntirishda foydali bo'lishi mumkin (2-band) va
> davomat oson bo'lsa yaxshi (3-band) — ikkalasi ham "shart emas, bo'lsa yaxshi".

## Talab nima

**To'liq ko'p tomonlama video konferensiya** — Zoom/Google Meet kabi. 12 tagacha
o'quvchi + 1 ustoz, hammaning kamerasi va mikrofoni **o'zi boshqaradigan**, istalgan
payt yoqib-o'chira oladi. Ustozda esa qo'shimcha **host huquqlari** bo'ladi: birortasini
ovozini o'chirish, darsdan chiqarish, hammani birdek ovozsiz qilish — chunki 12 bola
nazoratsiz bo'lsa, real darsda tartibsizlik chiqishi tabiiy.

Bu avvalgi rejadagi "broadcast" (faqat ustoz yuboradi) g'oyasidan farq qiladi — o'sha
yondashuv arzon va oddiy edi, lekin ustoz aniq boshqasini so'radi. Narx va murakkablik
oshadi, lekin bu ustozning bevosita talabi.

## Texnologiya tanlovi: LiveKit (o'zgarishsiz qoladi)

To'liq konferensiyaga o'tish texnologiya tanlovini o'zgartirmaydi — LiveKit aynan shu
turdagi ko'p tomonlama video uchun mo'ljallangan SFU (Selective Forwarding Unit), broadcast
ham, konferensiya ham bir xil infratuzilmada ishlaydi, farq faqat kimga "yuborish huquqi"
(`canPublish`) berilishida.

1. **Custom UI** — bizning gallery-grid ekranimiz Bw* dizayn tizimida bo'ladi, Jitsi yoki
   Zoom'ning tayyor (begona ko'rinishdagi) oynasi emas.
2. **Host huquqlari serverda beriladi** — "ustoz birovni ovozsiz qilishi/chiqarib
   yuborishi mumkin, oddiy o'quvchi qila olmaydi" — bu LiveKit'ning room-admin API'si
   orqali, token ichida, brauzerdan buzib bo'lmaydigan tarzda amalga oshadi.
3. **Ko'chib o'tish yo'li ochiq** — bugun bulutda bepul boshlaymiz, keyin xohlasak
   xuddi shu dasturni o'z serverimizga ko'chiramiz.

Ko'rib chiqilgan, lekin tanlanmagan: **Jitsi** — aynan shu (hammaning kamerasi ochiq)
stsenariy uchun qutidan chiqqan holda mos, lekin tayyor UI'si bizning Bw* dizaynimizga
mos kelmaydi va uni o'zimizniki qilib qayta qurish LiveKit ustiga o'z ekranimizni
qurishdan qiyinroq (Jitsi'ning butun web-klientini forklashga to'g'ri keladi).

## Narx — halol hisob (yangilangan, konferensiya uchun)

Broadcast'da faqat 1 kishi (ustoz) video yuboradi, qolgani qabul qiladi — server yuki
kam. **To'liq konferensiyada 13 kishining hammasi video yuboradi VA qabul qiladi** —
bu server orqali o'tadigan trafikni sezilarli oshiradi (har kim boshqa 12 kishining
oqimini oladi).

LiveKit Cloud bepul tier (**Build**): 5,000 WebRTC daqiqa + **50GB trafik**/oy.

- **Ishtirokchi-daqiqa** (kim nechchi daqiqa ulanib turdi) — bu deyarli o'zgarmaydi:
  13 kishi × 90 daqiqa = 1,170 daqiqa/dars, avvalgidek.
- **Trafik (GB)** — bu keskin oshadi. Kichik gallery-plitka sifatida (~200–300 kbps/oqim,
  Zoom galereya darajasida, HD emas) taxminiy hisob: har bir ishtirokchi qolgan 12
  kishining oqimini oladi → 90 daqiqalik darsda **bitta ishtirokchi uchun ~1.5–2.5 GB**,
  13 kishilik dars uchun jami **~20–30 GB bitta darsda**.

Ya'ni **bitta to'liq konferensiya darsi bepul tierning oylik 50GB chegarasining
yarmini yeb qo'yishi mumkin**. Haftada 3 dars — birinchi haftadayoq bepul tier tugaydi.

**Xulosa:** avvalgidek "avval bepulda sinaymiz" degan reja endi yetarli emas —
sinov darslaridan keyin tezroq pullik tarifga yoki o'z serverga o'tish kerak bo'ladi.
Buni ustozga oldindan aytib qo'yish kerak (server xarajati kim zimmasida — bu
narx-navo suhbatida allaqachon "markaz to'laydi" deb kelishilgan edi).

O'z serverga ko'chirish endi ancha muhimroq va tezroq kerak bo'ladi: Hetzner/Contabo
VPS'da trafik cheklovi deyarli yo'q (masalan Hetzner CX-turlarida 20TB/oy), faqat
serverning CPU quvvati muhim — 13 kishilik SFU routing o'rtacha VPS'da (4 CPU) bemalol
ishlaydi.

⚠️ Bir xil eslatma qoladi: **LiveKit media serveri Railway'da ishlamaydi** (UDP kerak).
O'z serverga ko'chganda alohida VPS kerak; Railway'dagi backend faqat token/moderatsiya
so'rovlarini beradi — bu oddiy HTTP, joyida qoladi.

## Amaliy ehtiyot choralari (kod darajasida, alohida qaror emas)

To'liq konferensiya qarori bilan birga keladigan texnik xavflar — bularni build
promptlarida hisobga olamiz, qayta so'ramaymiz:

- **Ustozning o'z interneti** — 12 kishining oqimini bir vaqtda qabul qilish talab
  qiladi. LiveKit'ning simulcast/adaptiv sifat funksiyasini yoqib, tarmoq sekin bo'lsa
  kichik plitkalar avtomatik pastroq sifatga tushishi kerak.
  "Faol so'zlovchi" katta, qolganlari kichik va past sifatli plitkalarda ko'rinadi —
  bu real Zoom ham shunday qiladi, tasodifiy emas.
- **Ovoz aralashishi** — 12 mikrofon ochiq bo'lsa, aks-sado/shovqin xavfi bor.
  Brauzerning o'ziga xos aks-sado bostirish (echo cancellation) buni katta qismini
  hal qiladi, lekin darsda o'quvchilarga quloqchin tavsiya qilish amaliy maslahat
  sifatida UI'da (masalan birinchi kirishda) ko'rsatilsa foydali.
- **Ustoz nazorati shart** — hatto "hamma erkin" desa ham, ustozda albatta birovni
  ovozsiz qilish/chiqarib yuborish tugmasi bo'ladi — bu Zoom'da ham standart va
  sinfda tartib uchun zarur.

## Bosqichlar (yangilangan)

### 9-bosqich — Ko'p tomonlama video MVP
Hamma (ustoz + 12 o'quvchigacha) bir xonada, kamera/mikrofon o'zi boshqaradi.
- Backend: `lesson_sessions` jadvali, LiveKit token endpoint — **hamma uchun**
  `canPublish: true`, ustoz uchun qo'shimcha `roomAdmin: true`
- Gallery-grid UI: har kim o'z plitkasida, faol so'zlovchi katталashadi
- Kamera/mikrofon yoqish-o'chirish tugmalari (har kim o'ziniki uchun)
- Ustoz: **ekran ulashish** (qoida tushuntirish uchun, ustoz "bo'lsa yaxshi" degan)
- Ustoz darsni boshlaydi/tugatadi; tugagach hamma chiqadi
- Ulanish uzilsa avtomatik qayta ulanish (adaptiv sifat bilan)

### 10-bosqich — Nazorat va interaktivlik
- Ustoz host paneli: birontasini ovozsiz qilish, hammani ovozsiz qilish, darsdan chiqarish
- Chat (matn orqali savol)
- **Avtomatik davomat** — kim qo'shildi, qancha turdi (mavjud `attendance` jadvaliga)
  — ustoz "bo'lsa yaxshi" degan, shart emas, lekin infratuzilma tayyor bo'lgani uchun
  qo'shish qiyin emas
- Dars eslatmasi (boshlanishiga 10 daqiqa qolganda bildirishnoma)

### 11-bosqich — Yozib olish (ixtiyoriy, keyinroq)
Ustoz "qiyin bo'lmasa yaxshi bo'lardi" degan — talab emas, xohish. Darsni yozib olib,
kelolmagan o'quvchi keyin ko'rishi mumkin bo'ladi. Bu **saqlash joyi** talab qiladi
(1.5 soatlik 12 kishilik dars, hammasi birga yozilsa ancha katta hajm bo'ladi — aniq
hajm yozib olish formatiga bog'liq), shuning uchun alohida narx-navo va qaror kerak.
Boshqa hamma narsa (9, 10-bosqich) ishlab, sinovdan o'tgach ko'rib chiqiladi.

## Ustoz javob bergan savollar (2026-07-31)

1. **Bir darsda nechta o'quvchi?** → Maksimal 12
2. **Ustoz ekran ulashishi kerakmi?** → "Bo'lsa yaxshi" — qoida tushuntirish uchun,
   ingliz tilida ham
3. **Darsni yozib olish kerakmi?** → "Qiyin bo'lmasa yaxshi bo'lardi" — xohish, shart emas
4. **Ustozlar qaysi qurilmadan dars o'tadi?** → Kompyuterdan

## Hali ochiq qolgan savollar

- **Doska (whiteboard) kerakmi?** — matematika darsida yozib tushuntirish uchun.
  Ustozdan so'ralmagan, keyinroq kerak bo'lsa alohida qo'shiladi.
- **O'quvchilarning interneti qanday?** — mobil internetda bo'lsa, past sifat rejimi
  muhim bo'ladi (yuqoridagi "amaliy ehtiyot choralari" qismida shu hisobga olingan).
