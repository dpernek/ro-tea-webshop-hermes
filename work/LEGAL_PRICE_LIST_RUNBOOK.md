# Aktivacija sidrenih cijena i cjenika

Implementacija pretpostavlja jedan webshop. Vlasnik je 1. 10. 2026. potvrdio da se redovne cijene nisu mijenjale. Ta izjava dopušta pripremu prijedloga iz sadašnjih redovnih cijena; pojedinačna sidra postaju potvrđena tek nakon administratorskog pregleda. Plan i službeni izvori: `LEGAL_IMPLEMENTATION_PLAN.md`. Početak novih obveza prema NN 110/2026 je **17. 11. 2026.**

## Prvo testno okruženje

1. Pripremiti izoliranu PostgreSQL bazu s kopijom kataloga, bez stvarnih kupaca i narudžbi. Preview mora koristiti tu bazu. Ne dijeliti produkcijsku bazu jer preview koristi novu shemu.
2. Spremiti backup prije migracije. Pokrenuti `npx prisma migrate deploy` nad testnom bazom i potvrditi da su stare migracije već ispravno evidentirane. Ne koristiti `db push` kao zamjenu za migraciju sa zaštitnim triggerima.
3. U `/admin/cjenici` provjeriti broj artikala i varijanti, predložene redovne cijene te odgovarajuće datume. Opći datum je 10. 9. 2026.; ranije obuhvaćene kategorije zadržavaju 2. 5. 2025.; noviji artikli trebaju stvarnu prvu cijenu i datum uvrštenja. Ne koristiti datum migracije kao datum uvrštenja.
4. Dopuniti barkod ili stvarnu neprimjenjivost, marku, jedinicu i količinu pakiranja po varijanti, stvarnu raspoloživost te naziv posebne prodaje gdje postoji. Prazna zaliha nije nula. Nepoznati podaci blokiraju cjenik.
5. Dopuniti izvor potvrde: izjava vlasnika, datum i lokacija dostupnog povijesnog izvoza/računa/backup-a. Pregledati prijedlog, zatim potvrditi. Serverski zapis čuva administratora, vrijeme, razlog, stare i potvrđene podatke. Izjava se ne predstavlja kao neovisni povijesni dokaz.
6. Provjeriti prikaz jednake i različite sidrene cijene na kartici, detalju, mobilnom prikazu, odabranoj varijanti, košarici i novoj stavci liste želja. Stare stavke spremljene u pregledniku mogu prethoditi novim podacima; za prihvat koristiti svježu košaricu/listu.
7. Unijeti adresu webshopa i oznaku `WEB-01`, uključiti objavu u testnoj bazi i ručno objaviti. Provjeriti CSV, zasebne retke varijanti, aktualne i sidrene iznose, jedinice, PDV i naziv datoteke. `/cjenici` i download moraju raditi bez prijave. Ponovljena objava istog dana vraća postojeću datoteku.

## Produkcija nakon provjere

Migracija i aktivacija produkcije još nisu izvršene. Nakon prihvata testnog rezultata napraviti backup produkcije, primijeniti migraciju, objaviti aplikaciju i ponoviti pregled podataka na produkcijskom katalogu. Sidra i objavljene datoteke ne prepisuju se redovnim administratorskim postupkom; pogrešna potvrda treba zaseban pregled i dokumentiranu korekciju.

Postaviti zaseban `CRON_SECRET` u produkcijskom Vercel okruženju. Tajnu ne spremati u Git. `vercel.json` poziva `/api/cron/cjenici` svakodnevno u 04:00 UTC, odnosno 05:00 zimi / 06:00 ljeti u Zagrebu. Vercel cron radi na produkciji; preview provjeravati ručnom objavom. Hobby raspored može kasniti unutar sata. Provjeriti stvarnu konfiguraciju i trajanje na Vercelu.

Arhiva čuva izvorni CSV sadržaj u PostgreSQL-u, SHA-256, broj redaka i vrijeme objave. Nema automatskog brisanja, pa zadržavanje prelazi traženih 30 dana. Nakon prve objave potvrditi da se nova datoteka pojavljuje prije 8:00 sljedećeg radnog dana.

## Neuspjela objava i preostali rad

Administrator u `/admin/cjenici` vidi posljednje objave i pogreške. Ako današnja objava nedostaje, provjeriti Vercel Cron i bazu, ispraviti podatke te ručno objaviti prije roka. Vercel ne ponavlja automatski neuspjeli cron. Trenutačno nema vanjskih obavijesti o izostanku poziva; odrediti odgovornu osobu i dodati nadzor prije zakonskog početka. Isključen raspored vraća `DISABLED` i ne objavljuje datoteku.

Zasebna povijest najniže cijene u 30 dana prije akcije još nije implementirana. Sidrena cijena ne zamjenjuje taj podatak, a postojeći `oldPrice` nije potvrđen povijesni minimum. Usluge i eventualni izuzeci iz asortimana također trebaju završnu poslovnu provjeru. Ovaj blok sam po sebi nije potvrda potpune pravne usklađenosti.

## Automatske provjere

`npm test` uključuje izvoz, datume, varijante i jedinice, zaštitu potvrde, stari fingerprint, idempotentnu objavu, cron autorizaciju i javni download. PGlite pokreće stvarni PostgreSQL migracijski SQL i skupne upise u izoliranoj WASM bazi; provjerava triggere i jedinstveni dnevni zapis. To ne zamjenjuje prihvat na stvarnoj Prisma/PostgreSQL preview integraciji. Pokrenuti i lint, TypeScript i produkcijski build.
