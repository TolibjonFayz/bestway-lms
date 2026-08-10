# Jonli dars — yakuniy qaror: Zoom Pro (ilova orqali)

> **Qaror qabul qilindi (2026-08-10).** Ustoz Zoom Pro'ga rozi bo'ldi va **"oxiriga
> qo'shsak maylimi"** dedi — ya'ni jonli dars integratsiyasi eng oxirgi bosqich,
> boshqa ishlar tugagach qilinadi. Bu oqilona: Zoom obunasi boshlanishi bilan har
> oy pul keta boshlaydi, shuning uchun platformaning qolgan qismi tayyor bo'lgach
> ulash to'g'ri.

## Yakuniy qaror

Ustoz **Zoom Pro** hisobi orqali dars o'tadi (~$13-17/oy, ustoz boshiga, FIKS narx —
nechta guruh yoki necha soat dars o'tsa ham o'zgarmaydi). LMS video konferensiyani
o'zi **qurmaydi** — faqat dars jadvalini yuritadi va "Darsga qo'shilish" tugmasi
orqali Zoom havolasiga yo'naltiradi.

Bu degani: **jonli dars uchun deyarli hech qanday murakkab kod yozilmaydi.** Bir
nechta jadval maydoni, bitta tugma, va vaqtga qarab uni yoqish/o'chirish mantiqi.

## Nima uchun shunday qaror qilindi (yo'l tarixi)

Bu qaror bir necha bosqichda o'zgarib, oxirida shu yerga keldi:

1. **Avval LiveKit** rejalashtirilgan edi (to'liq saytda o'z dizaynimizda video).
   Rad etildi: to'liq gallery-konferensiyada trafik (GB) alohida hisoblanadi va
   ~$77-143/oy chiqardi.
2. **Keyin Zoom Video SDK** (saytda, lekin Zoom infratuzilmasida). Rad etildi:
   1 guruh uchun ~$14/oy bo'lsa-da, guruh ko'paygani sari o'sib boradi ($112/3 guruh),
   va butun video UI'ni o'zimiz qurishimiz kerak edi.
3. **Jitsi / BigBlueButton** ko'rib chiqildi (ustoz "boshqa tekin servislar bor" degan).
   Rad etildi: dasturi bepul bo'lsa ham, **server o'zimizniki bo'ladi** ($16-44/oy VPS)
   va uning ishlab turishiga biz javobgar bo'lamiz — dars vaqtida yiqilsa, kutib
   turadigan qo'llab-quvvatlash yo'q. Bitta dasturchi uchun bu jiddiy xavf.
   `meet.jit.si` (bepul umumiy server) ham tekshirildi — shartnomasi tijorat
   ishlatishni taqiqlaydi, oyiga 25 ta faol ulanish bilan cheklaydi va Jitsi
   brendini majburiy ko'rsatishni talab qiladi. Bizga mos emas.
4. **Zoom Business** ko'rib chiqildi ("bitta akkaunt, ko'p ustoz" g'oyasi). Rad etildi:
   kamida **10 ta litsenziya** sotib olish majburiy ($183/oy) — 2-3 ustoz uchun
   behuda pul. Pro'da ham bitta kompaniya akkaunti ochib, kerakli ustozlarga
   litsenziya berish mumkin.
5. **Zoom Pro** — yakuniy tanlov. Tez ishga tushadi, ishonchli (Zoom javobgar),
   narxi FIKS va bashorat qilinadigan, murakkab server sozlash yo'q.

## Nimadan voz kechildi (halol tan olish)

- **Dars saytdan chiqib, Zoom ilovasida o'tadi** — ustoz aslida "shu saytda bo'lsin"
  degan edi. Tolibjon buni ustozga tushuntirdi va ustoz rozi bo'ldi.
- **Avtomatik davomat murakkabroq bo'ladi** — Zoom'ning hisobot API'si orqali kim
  qachon qo'shilganini tortib olish mumkin, lekin bu qo'shimcha integratsiya. Agar
  qilinmasa, ustoz davomatni qo'lda belgilaydi (Davomat sahifasi orqali).
- **Chat/qo'l ko'tarish LMS'da bo'lmaydi** — Zoom'ning o'zida bor, shuning uchun
  qayta qurish shart emas.

## Nima quriladi (13-bosqich, eng oxirida)

Juda kichik hajm:

1. **DB:** `groups` jadvaliga `zoom_join_url` (va ixtiyoriy `zoom_meeting_id`) maydoni.
   Ustoz Zoom'da bitta **takroriy uchrashuv** (recurring meeting) yaratadi — bitta
   havola butun guruh uchun, har darsda o'zgarmaydi.
2. **Admin panel:** guruhni tahrirlashda Zoom havolasini kiritish maydoni.
3. **O'quvchi tomoni:** dashboard'dagi "Keyingi dars" kartasidagi **"Darsga qo'shilish"**
   tugmasi — hozir u ishlamaydi (matn xolos). Dars boshlanishiga 10 daqiqa qolganda
   faollashadi va Zoom havolasini yangi oynada ochadi.
4. **O'qituvchi tomoni:** staff dashboard'da xuddi shunday tugma (ustoz host sifatida
   kiradi).
5. Havola qo'yilmagan guruhda tugma o'rniga tushunarli xabar ko'rsatiladi
   ("Dars havolasi hali qo'shilmagan").

## Boshlashdan oldin tekshirish kerak

⚠️ **Ustozning kartasi Zoom to'lovini qabul qiladimi** — o'zbek USD kartalari xalqaro
obunalarda ba'zan rad etiladi. Zoom Pro obunasini ochish **ustozning o'z zimmasida**
(bu markazning doimiy xarajati, avvalgi kelishuv bo'yicha server/xizmat xarajatlari
markaz hisobidan). 13-bosqichni boshlashdan oldin obuna ochilgan va havola tayyor
bo'lishi kerak.

## Ustoz javob bergan savollar

1. **Bir darsda nechta o'quvchi?** → Maksimal 12
2. **Ekran ulashish kerakmi?** → "Bo'lsa yaxshi" — Zoom'da tayyor bor
3. **Yozib olish kerakmi?** → "Qiyin bo'lmasa yaxshi" — Zoom Pro'da bulutli yozib
   olish bor (5GB), qo'shimcha ish talab qilmaydi
4. **Qaysi qurilmadan dars o'tadi?** → Kompyuterdan
5. **Doska (whiteboard)?** → So'ralmagan, lekin Zoom'da tayyor bor
