# RO-TEA Hermes — plan provedbe obveza o cijenama i cjenicima

Datum provjere: 1. listopada 2026. Plan obuhvaća dokument `NN 101-2026 Odluke.pdf`, službene naknadne izmjene i pregled relevantnog koda na grani `codex/checkout-and-home-fixes` (HEAD `2f6c846`). Ovo je plan; aplikacija, baza i produkcija nisu izmijenjene ovom analizom. Popunjenost produkcijskih podataka nije provjerena.

## 1. Važeći rok i opseg

**Obje nove odluke stupaju na snagu 17. studenoga 2026., a ne 1. listopada kako piše u dostavljenom PDF-u.** Izmjene NN 110/2026, br. 1309 i 1310, stupile su na snagu 30. rujna i pomaknule samo datum početka važenja. Referentni datum cijene ostaje 10. rujna 2026.

Relevantne su odluke br. 1212 (dodatna cijena, PDF str. 1 / NN str. 8) i 1213 (cjenici, PDF str. 1–2 / NN str. 8–9). Dijelovi o socijalnim uslugama i braniteljskim primanjima na istim stranicama nisu obveze webshopa. Dokument ne uvodi fiskalizaciju ili ograničenje najviše cijene.

Plan polazi od RO-TEA kao trgovca koji prodaje robu krajnjim potrošačima u Hrvatskoj i ima webshop. Novi režim nije ograničen na velike trgovine. Ako postoji fizička trgovina ili zasebna ponuda usluga, uključiti i taj kanal. Ranije obveze za obuhvaćene kategorije prema NN 75/2025 treba provjeriti odmah; odgoda novih odluka ne ukida postojeće obveze.

## 2. Obveze i postojeće stanje

| Zahtjev | Pravna osnova | Nalaz u Hermesu | Potrebna provedba |
| --- | --- | --- | --- |
| Jasno prikazati dodatnu redovnu cijenu primjenjivu 10. 9. 2026. uz aktualnu maloprodajnu cijenu, uključujući web oglašavanje | 1212, II.–III. | `Product` i `ProductVariant` nemaju izdvojenu povijesnu referentnu cijenu | Potvrđeni uvoz po artiklu/varijanti, datum i zajednički prikaz cijene |
| Zadržati 2. 5. 2025. za ranije obuhvaćene proizvode hrane, pića, kozmetike, čišćenja, toaletnih potrepština i kućanstva | 1212, IV. | Nema evidencije pripadajućeg režima | Klasificirati stvarni asortiman; ne primijeniti jedan datum automatski na sve |
| Javno objaviti CSV **ili** XML cjenik | 1213, II., V.–VI. | Postoji JSON katalog; nije pronađena provedba javnog CSV/XML cjenika | Uvesti CSV i javnu stranicu s preuzimanjem |
| Podaci: naziv, šifra, marka, jedinica mjere i njezina cijena gdje primjenjivo, maloprodajna cijena, poseban oblik prodaje i njegov naziv, sidrena cijena, barkod, dostupnost | 1213, III. | Dio podataka postoji; nema zasebnih polja za sidro, barkod, prodajnu mjernu jedinicu i naziv posebnog oblika prodaje. SKU, marka i zaliha mogu biti prazni | Dopuniti podatke i validaciju; provjeriti mogu li se postojeći atributi/specifikacije sigurno preuzeti |
| Ažuriranje proizvoda za tekući radni dan do 8:00; javna dostupnost objavljenih verzija 30 dana | 1213, II. | Nije pronađen raspored objave ni arhiva | Automatska objava, trajna pohrana, arhiva, upozorenje na neuspjeh |
| Naziv datoteke s vrstom i adresom objekta, oznakom, brojem pohrane i datumom/vremenom slanja; jednaka struktura za mrežu objekata | 1213, VI. | Nema modela objave po prodajnom objektu | Postavke objekata i verzioniranje datoteka |
| Dopustiti automatizirano dohvaćanje cijena | 1213, VII. | `robots.ts` zabranjuje `/api/`; katalog je paginirani JSON | Javni CSV URL-ovi bez prijave/CAPTCHA i dopušteni putovi za robote |
| Ako RO-TEA izravno nudi usluge: pripadajući cjenik i ažuriranje pri promjeni | 1213, II., IV. | Nije potvrđena takva poslovna ponuda; postoje postavke dostave | Vlasnik potvrđuje usluge i tretman naknada za dostavu; ne zaključivati samo iz naziva tablice |

Službena pojašnjenja Ministarstva od 24. rujna razjašnjavaju: webshop je obuhvaćen; sidro se prikazuje i kada je jednako aktualnoj cijeni; akcija na referentni dan ne postaje sidro; novi artikli nakon tog dana dobivaju početnu cijenu i stvarni datum uvrštenja; promjena šifre ne stvara novi proizvod. Predviđena je zasebna datoteka za webshop i svaki fizički objekt, a dostupnost se veže uz stvarnu zalihu objekta. Barkod se navodi gdje je primjenjiv. Objavljeni CSV/XML zadovoljava strojni pristup; dodatni API nije nužan. Za trgovce se ne zahtijeva nova dnevna datoteka zbog svake promjene unutar dana. Pojašnjenja prethode odgodi: njihov stari datum početka treba čitati uz NN 110/2026. Sidro ne zamjenjuje najnižu cijenu prije akcije u prethodnih 30 dana.

## 3. Redoslijed implementacije

### Faza A — potvrda podataka i poslovnog opsega (odmah, okvirno 1–2 radna dana)

Vlasnik RO-TEA potvrđuje prodajne objekte, njihove adrese i oznake, ponudu usluga, kategorije s postojećim sidrom iz 2025. i odgovornu osobu za cjenike. Posebno provjeriti proizvode za kućanstvo i čišćenje; glavni asortiman alata nije dokaz da takvih artikala nema.

Prikupiti dokumentirane redovne bruto cijene na referentni datum iz ERP-a, prethodnog webshopa, sigurnosne kopije ili potvrđenog povijesnog cjenika. Za varijante trebaju podaci za svaki stvarno prodajni artikl. Današnja `price`/`regularPrice` i račun iz akcijske prodaje sami ne dokazuju tadašnju redovnu cijenu. Datum migracije u Hermes nije datum prvog ulaska u ponudu RO-TEA.

Pripremiti uvoznu tablicu: identitet artikla/varijante, SKU, sidrena cijena, datum, režim, dokaz/izvor, barkod ili razlog neprimjenjivosti, prodajna jedinica, količina pakiranja, marka i raspoloživost po objektu. Nepoznate cijene označiti za provjeru, bez izmišljene vrijednosti, nule ili automatskog kopiranja aktualne cijene.

**Rezultat:** potvrđen opseg i izvori, popis iznimaka s odgovornom osobom. Nedostatak povijesnih podataka zaseban je poslovni problem koji programska izmjena ne rješava.

### Faza B — model podataka i siguran uvoz (okvirno 2–3 dana)

Predložiti dodatne zapise za referentnu cijenu po prodajnom artiklu i objektu, s iznosom, valutom EUR, datumom, režimom, dokazom, autorom i statusom potvrde. Novac u novim evidencijama čuvati kao decimalni iznos ili cijele cente. Referentnu cijenu ne mijenjati pri redovnoj promjeni prodajne cijene; ispravak dopustiti samo uz trag prethodne vrijednosti i razlog.

Dodati strukturirane podatke za barkod, prodajnu mjernu jedinicu/količinu i vrstu posebnog oblika prodaje. `weight` za dostavu nije pouzdana zamjena za neto količinu proizvoda. Omogućiti odgovarajuću evidenciju objekata i zaliha; `UNKNOWN`, `null` i naručivanje od dobavljača ne pretvarati automatski u „dostupno”.

Adminu dodati provjeru potpunosti, pregled uvoza prije primjene, izvještaj nepridruženih/duplih redaka i ponovljivo učitavanje bez dupliranja. Migraciju prvo provesti na testnoj bazi uz sigurnosnu kopiju. Kod nepotpunih podataka admin mora jasno navesti što nedostaje; cjenik se ne smije označiti potpunim ako izostavlja prodajne artikle.

### Faza C — jedinstven prikaz i računanje cijena (okvirno 2–3 dana)

Uvesti zajednički izračun aktualne prodajne cijene za kartice, detalje, košaricu, checkout i izvoz. Već postoji razlika: `product-mapper.ts`/`pricing.ts` provjeravaju valjanost akcijske cijene, dok detalj proizvoda uzima svaku vrijednost `salePrice` koja nije `null`. To treba uskladiti prije cjenika kako web, narudžba i datoteka ne bi prikazivali različite iznose.

Prikaz: **Aktualna cijena: 12,00 €**; ispod **Cijena na 10. 9. 2026.: 11,00 €** (primjer, ne stvarni podaci). Koristiti čitljiv tekst uz cijenu, bez skrivenog tooltipa i bez precrtavanja koje bi povijesnu cijenu predstavljalo kao popust.

Obuhvatiti kartice kataloga/kategorija/brandova, početnu, detalj proizvoda, odabranu varijantu, povezane i nedavno gledane proizvode te mobilni prikaz cijene. U košarici prikaz vezati uz pojedinačnu stavku, ne označavati ukupni iznos kao sidro. Svaki raspon cijena provjeriti kroz stvarne varijante; izbjegavati usporedbu najjeftinije aktualne varijante s drugim povijesnim artiklom.

Za akcije napraviti zasebnu povijest prodajnih cijena i provjeren izračun najniže cijene prije početka akcije u prethodnih 30 dana. Postojeći `oldPrice` nije dokaz tog minimuma. Bulk evidencija pokriva samo dio izmjena. Povijest treba zapisivati kroz pojedinačno uređivanje, varijante, skupne izmjene, rollback i uvoz. Postojeće akcije traže dokumentirano početno stanje; 30 dana početi prikupljati odmah, ne tek u studenome. Ovo je povezani postojeći zahtjev za akcije, zaseban od dviju novih odluka.

### Faza D — CSV, javna arhiva i objava (okvirno 2–3 dana)

Predloženi javni putovi: `/cjenici` za pregled i `/cjenici/datoteke/<naziv>.csv` za trajne verzije, uz poveznicu u footeru. CSV je dovoljan prvi format; XML nije potreban za početnu provedbu.

Dogovoriti stabilnu shemu, UTF-8, pravila razdjelnika i decimalnog zapisa. Uz obvezna polja dodati ID artikla/varijante, datum sidra, oznaku objekta i vrijeme objave radi nedvosmislenog čitanja. Jedan redak predstavlja jedan prodajni artikl/varijantu. Objaviti i nedostupne artikle koji ostaju u asortimanu; ne izvoziti nacrte, interne podatke ni narudžbe. Testirati CSV citiranje i vrijednosti koje bi se u tabličnom programu mogle protumačiti kao formule.

Primjer obrasca naziva (sve vrijednosti zamijeniti potvrđenim podacima): `webshop_<adresa>_WEB-01_000001_2026-11-17_07-00-00.csv`. Datum/vrijeme u nazivu mora biti vrijeme stvarne objave, ne planiranog pokretanja. Adresu za webshop potvrditi prije konfiguriranja.

Trajno pohraniti sadržaj verzije i zapis objave: objekt, slijedni broj, vrijeme, broj redaka, kontrolni zbroj i lokacija datoteke. Za početni opseg razmotriti PostgreSQL sadržaj + javni download handler; za veće datoteke objektna pohrana. Vercelov privremeni filesystem nije arhiva. Objavu sadržaja i indeksa provesti tako da korisnik nikad ne dobije napola objavljenu verziju. Stare verzije ostaju nepromjenjive i javne barem 30 punih dana; čišćenje ne smije ukloniti trenutačno važeći cjenik.

Dnevna arhivska datoteka i aktualni webshop imaju različitu svrhu. Ako uvedemo dodatni endpoint „trenutno.csv”, on čita važeće podatke bez dugog cachea; ne zamjenjuje spremljene verzije. To je tehnička mogućnost, ne dodatna zakonska obveza zasebnog API-ja.

### Faza E — raspored i operativna odgovornost (okvirno 1–2 dana)

Korisnik je zatražio objavu **svako jutro u 07:30 po `Europe/Zagreb`**. Implementiran je GitHub Actions raspored koji prati ljetno/zimsko vrijeme, uz ponovne provjere i oporavak u 07:40/07:50. Vercel Hobby ne osigurava potrebnu preciznost termina. Aktivacija, secret, migracija i operativni prihvat opisani su u `LEGAL_PRICE_LIST_RUNBOOK.md`; sam PR ne aktivira objavu.

Autentificirani posao, zaključavanje po objektu/danu, sigurno ponavljanje, ručno ponovno pokretanje i evidencija uspjeha su implementirani. Automatski posao provjerava javni današnji manifest i SHA-256 preuzete datoteke, a pogreška ruši GitHub workflow. Operativni prag: provjera do 07:50 i ručni oporavak prije 08:00. Stari cjenik ne prikazuje se kao današnji. Neovisni alarm za izostanak svih poziva i stvarni rad rasporeda ostaju za operativni prihvat.

Javno preuzimanje mora raditi bez admin prijave, CAPTCHA ili zaštite preview okruženja. `robots.ts` omogućiti pristup novim javnim putovima, uz zadržavanje zaštite admina. Provjeriti Vercel Firewall/CDN kako automatizirani pristup ne bi bio blokiran. Za fizičke objekte vlasnik organizira etikete i cjenike, a za oglase s cijenama ažurira predloške i već aktivne materijale.

### Faza F — provjera i puštanje (okvirno 2 dana + rezerva)

Preporučeni interni cilj: završiti implementaciju i podatke do 6. studenoga, završnu provjeru do 10. studenoga te produkcijsku objavu do 13. studenoga. Zakonski početak je 17. studenoga. Ukupna tehnička procjena: približno 10–15 radnih dana nakon potvrde opsega i dostupnosti podataka; nije jamstvo dok ne znamo broj objekata/varijanti i kvalitetu povijesnog izvora.

Preview trenutno nema konfiguriran `DATABASE_URL`, prema prethodnoj provjeri; to treba riješiti testnom bazom prije integracijskih provjera. Stvarno stanje postavki ponovno provjeriti pri početku implementacije. Koristiti podatke i naplatu za testiranje bez stvarnih narudžbi. Zakonodavnu objavu odvojiti u vlastitu granu/PR radi jasnog pregleda migracije; uzeti u obzir postojeći draft PR s popravcima checkouta. Produkcijska objava slijedi zasebnu provjeru i odobrenje korisnika.

## 4. Kriteriji prihvata

1. Svaki prodajni artikl i varijanta imaju potvrđenu referentnu cijenu/datum ili dokumentirano riješenu iznimku; izvještaj nema neriješene obvezne podatke.
2. Cijena na webu, u checkoutu i aktualnom izvozu jednaka je za isti artikl; sidro ostaje stabilno nakon izmjene cijene, SKU-a i naziva.
3. Čitljiv prikaz na računalu i mobitelu pokriva jednostavne proizvode, varijante, jednake aktualne/povijesne cijene i akcije. Najniža cijena za akciju računa se iz potvrđene povijesti.
4. Anonimni HTTP klijent preuzima cijeli CSV svakog objekta bez prijave; parser dobiva sva obvezna polja, ispravne znakove i sve artikle u asortimanu.
5. Arhiva ostaje dostupna najmanje 30 dana, uključujući promjene i brisanje proizvoda; prethodne datoteke ne regeneriraju se iz današnjeg kataloga.
6. Raspored prolazi test granice 08:00, promjene vremenske zone, dvostrukog pokretanja, pada baze/pohrane i ponavljanja bez duplikata.
7. Na produkciji provjeriti prvi cjenik, vrijeme objave i dohvat automatiziranim klijentom. Za svakodnevni posao postoji imenovana odgovorna osoba i postupak ručnog oporavka.

## 5. Relevantna mjesta u kodu

- `prisma/schema.prisma`: Product, ProductVariant, Brand, ProductBulkOperation/Item; proširenje modela i migracije.
- `src/components/admin/ProductForm.tsx`, `src/lib/validations.ts`, `src/app/api/admin/products/**`: administracija, uvoz, cijene/varijante i skupne izmjene.
- `src/lib/product-mapper.ts`, `src/lib/pricing.ts`, `src/app/api/catalog/products/route.ts`: jedinstvena cijena i podaci za prikaz/izvoz.
- `src/components/products/ProductCard.tsx`, `src/app/proizvodi/[slug]/page.tsx`, `src/components/product/VariableProductOptions.tsx`: glavni prikazi cijena; dodatno pregledati povezane/nedavno gledane proizvode i košaricu.
- `src/components/layout/Footer.tsx`, `src/app/robots.ts`, `src/proxy.ts`: dostupnost cjenika i javni pristup.
- Novi modul za cjenike, javne rute i raspored: nazive i storage odabrati nakon potvrde opsega. Prije pisanja Next.js koda pročitati odgovarajuću dokumentaciju instaliranog Next.js 16.2.9 u `node_modules/next/dist/docs/`.

## 6. Potvrde potrebne prije provedbe

Od vlasnika: izvor povijesnih cijena, lista prodajnih objekata/adrese, asortiman pod režimom 2025., eventualne usluge, stvarni izvor zaliha i osoba odgovorna za podatke. Kod nejasne klasifikacije proizvoda, adrese webshop objekta, posebnog cjenika dostave ili nedostatka dokaza tražiti konkretno tumačenje od pravnog/računovodstvenog partnera ili Ministarstva. Tehnički dio može napredovati dok se ti podaci prikupljaju.

## Službeni izvori

- [NN 101/2026, br. 1212 — isticanje dodatne cijene](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_09_101_1212.html).
- [NN 101/2026, br. 1213 — objava cjenika](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_09_101_1213.html).
- [NN 110/2026, br. 1309 — odgoda prve odluke](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_09_110_1309.html).
- [NN 110/2026, br. 1310 — odgoda druge odluke](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_09_110_1310.html).
- [Ministarstvo gospodarstva — pojašnjenja od 24. rujna 2026.](https://mingo.gov.hr/UserDocsImages//slike//MINGO_Poja%C5%A1njenja_dodatna%20cijena_objava%20cjenika.pdf) — stariji datum početka uskladiti s kasnijim izmjenama.
- [NN 75/2025, br. 979 — prethodni režim](https://narodne-novine.nn.hr/clanci/sluzbeni/2025_05_75_979.html).

Pravne obveze gore su odvojene od predloženih tehničkih rješenja i internih rokova. Prije produkcijske objave ponovno provjeriti eventualne nove izmjene i službena pojašnjenja.
