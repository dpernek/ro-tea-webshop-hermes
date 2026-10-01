# Aktivacija sidrenih cijena i cjenika

Implementacija pretpostavlja jedan webshop. Vlasnik je 1. 10. 2026. potvrdio da se redovne cijene nisu mijenjale. Ta izjava dopušta pripremu prijedloga iz sadašnjih redovnih cijena; pojedinačna sidra postaju potvrđena tek nakon administratorskog pregleda. Plan i službeni izvori: `LEGAL_IMPLEMENTATION_PLAN.md`. Početak novih obveza prema NN 110/2026 je **17. 11. 2026.**

## Prvo testno okruženje

1. Pripremiti izoliranu PostgreSQL bazu s kopijom kataloga, bez stvarnih kupaca i narudžbi. Preview mora koristiti tu bazu. Ne dijeliti produkcijsku bazu jer preview koristi novu shemu.
2. Spremiti backup prije migracije. Pokrenuti `npx prisma migrate deploy` nad testnom bazom i potvrditi da su stare migracije već ispravno evidentirane. Ne koristiti `db push` kao zamjenu za migraciju sa zaštitnim triggerima.
3. U `/admin/cjenici` provjeriti broj artikala i varijanti, predložene redovne cijene te odgovarajuće datume. Opći datum je 10. 9. 2026.; ranije obuhvaćene kategorije zadržavaju 2. 5. 2025.; noviji artikli trebaju stvarnu prvu cijenu i datum uvrštenja. Ne koristiti datum migracije kao datum uvrštenja.
4. Dopuniti barkod ili stvarnu neprimjenjivost, marku, jedinicu i količinu pakiranja po varijanti, stvarnu raspoloživost te naziv posebne prodaje gdje postoji. Prazna zaliha nije nula. Nepoznati podaci blokiraju cjenik.
5. Dopuniti izvor potvrde: izjava vlasnika, datum i lokacija dostupnog povijesnog izvoza/računa/backup-a. Pregledati prijedlog, zatim potvrditi. Serverski zapis čuva administratora, vrijeme, razlog, stare i potvrđene podatke. Izjava se ne predstavlja kao neovisni povijesni dokaz.
6. Provjeriti prikaz jednake i različite sidrene cijene na kartici, detalju, mobilnom prikazu, odabranoj varijanti, košarici i novoj stavci liste želja. Stare stavke spremljene u pregledniku mogu prethoditi novim podacima; za prihvat koristiti svježu košaricu/listu.
7. Unijeti adresu webshopa i oznaku `WEB-01`. Gumb „Preuzmi CSV za pregled” daje stvarni CSV spremljenog kataloga bez javne objave i bez povećanja broja pohrane; nepotpuni podaci blokiraju i taj pregled. Provjeriti zasebne retke varijanti, aktualne i sidrene iznose, jedinice, PDV i naziv datoteke. Zatim uključiti objavu u testnoj bazi i ručno objaviti. `/cjenici`, `/cjenici/manifest.json` i CSV download moraju raditi bez prijave. Ponovljena objava istog dana vraća postojeću datoteku.

## Produkcija nakon provjere

Migracija i aktivacija produkcije još nisu izvršene. Nakon prihvata testnog rezultata napraviti backup produkcije, primijeniti migraciju, objaviti aplikaciju i ponoviti pregled podataka na produkcijskom katalogu. Sidra i objavljene datoteke ne prepisuju se redovnim administratorskim postupkom; pogrešna potvrda treba zaseban pregled i dokumentiranu korekciju.

Raspored u `.github/workflows/daily-price-list.yml` je **svakog dana u 07:30 po `Europe/Zagreb`**, s dodatnim provjerama i oporavkom u **07:40 i 07:50**. Izvorni Vercel cron u 04:00 UTC uklonjen je kako ne bi objavio datoteku prije zadanog termina. Hrvatska vremenska zona automatski prati zimsko i ljetno vrijeme; UTC vrijeme nije ručno fiksirano. Svakodnevni raspored pokriva i sve radne dane webshopa.

Postaviti isti zaseban `CRON_SECRET` u produkcijskom Vercel okruženju i GitHub Actions repository secrets. Tajnu ne spremati u Git ili ispisivati u logove. U provjeri 1. 10. 2026. GitHub secrets bili su prazni, pa automatska objava **još nije aktivna**. Workflow mora biti na zadanoj grani `main`; PR sam ne uključuje raspored. Endpoint ostaje zaštićen Bearer tajnom. Nakon deploymenta ručno pokrenuti workflow i potvrditi uspjeh. Ručni prihvat može biti nakon 08:00; raspored smatra objavu od 08:00 nadalje zakašnjelom.

`scripts/publish-price-list.mjs` ponavlja privremeni neuspjeh do tri puta, provjerava današnji zagrebački datum, javni manifest, preuzimanje CSV-a bez autorizacije, broj artikala i SHA-256 izvornih bajtova. `DISABLED`, HTTP greška, stari datum, nedostupan CSV ili neispravan hash ruše workflow. Naknadne provjere istog dana ne prepisuju prvu datoteku. Nema novih narudžbi ili obavijesti kupcima.

Arhiva čuva izvorni CSV sadržaj u PostgreSQL-u, SHA-256, broj redaka i vrijeme objave. Nema automatskog brisanja, pa zadržavanje prelazi traženih 30 dana. Nakon prve objave potvrditi da se nova datoteka pojavljuje prije 8:00 sljedećeg radnog dana.

## Neuspjela objava i preostali rad

Administrator u `/admin/cjenici` vidi posljednje objave i pogreške. Ako današnja objava nedostaje, provjeriti GitHub Actions i bazu, ispraviti podatke te ručno objaviti prije 08:00. GitHub workflow prijavljuje neuspjeh; odgovorna osoba treba uključiti Actions obavijesti za ovaj repo i provjeriti njihov primitak. Isključen raspored vraća `DISABLED` i ne objavljuje datoteku, a automatska provjera tada ne prikazuje lažni uspjeh.

GitHub Actions ne jamči početak točno u sekundu: raspored može kasniti ili poziv izostati, a javni repo bez aktivnosti 60 dana može imati isključen raspored. Tri termina smanjuju taj rizik, ali nisu neovisni nadzor. Prije početka obveze potvrditi stvarni rad više jutara, odrediti osobu za provjeru do 07:50 i neovisni alarm ako se traži potpuno automatski nadzor izostanka svih poziva. Nemojte proglasiti operativnu spremnost prije aktivacije i takve provjere.

Zasebna povijest najniže cijene u 30 dana prije akcije još nije implementirana. Sidrena cijena ne zamjenjuje taj podatak, a postojeći `oldPrice` nije potvrđen povijesni minimum. Usluge i eventualni izuzeci iz asortimana također trebaju završnu poslovnu provjeru. Ovaj blok sam po sebi nije potvrda potpune pravne usklađenosti.

## Automatske provjere

`npm test` uključuje izvoz, datume, varijante i jedinice, zaštitu potvrde, stari fingerprint, idempotentnu objavu, cron autorizaciju, pregled bez upisa, javni manifest/download i cijeli posao preuzimanja/provjere CSV-a. Provjereni su prijelazi sata, zakašnjela objava, stari cjenik, isključen posao, neispravan hash i oporavak bez duplikata. PGlite pokreće stvarni PostgreSQL migracijski SQL i skupne upise u izoliranoj WASM bazi; provjerava triggere i jedinstveni dnevni zapis. To ne zamjenjuje prihvat na stvarnoj Prisma/PostgreSQL preview integraciji. Pokrenuti i lint, TypeScript i produkcijski build.

Izvori provjere: [NN 1213, dnevno do 08:00](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_09_101_1213.html), [MINGO pojašnjenja, dio 2](https://mingo.gov.hr/UserDocsImages/slike/MINGO_Poja%C5%A1njenja_dodatna%20cijena_objava%20cjenika.pdf), [GitHub raspored i ograničenja](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule). Pojašnjenje je objavljeno prije odgode na 17. 11.; kasnija NN izmjena određuje važeći početak.
