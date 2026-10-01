# RO-TEA Hermes — stanje 2026-10-01

## Cilj i ovlasti

Korisnik traži sidrene cijene i javni dnevni cjenik u 07:30 Europe/Zagreb. Potvrdio samo webshop i nepromijenjene redovne cijene. Izričito je odobrio prebacivanje svega na live uz postojeću Supabase bazu. Zasebna testna baza ne postoji, oba free mjesta zauzeta, drugi projekt ne smijemo pauzirati. Ne kreirati narudžbe, naplate, e-mailove ili GLS pošiljke. Ne izmišljati metadata ni povijesne dokaze.

NN 101/2026 1212/1213, izmijenjeni NN 110/2026 1309/1310: početak 17. 11. 2026.; opće sidro 10. 9. 2026., ranije kategorije 2. 5. 2025. Vlasnikova izjava je dokumentirani izvor prijedloga, ne neovisan dokaz. Pregledati novije artikle i ranije kategorije. Sidro ne zamjenjuje najnižu cijenu u 30 dana prije akcije.

## Implementacija i provjere

Prisma migracija 20261001120000_legal_price_lists, src/lib/compliance/, /admin/cjenici, javni /cjenici, manifest i CSV, zaštićeni cron endpoint. Sidra se potvrđuju nakon pregleda; fingerprint sprječava zastarjeli pregled. PostgreSQL triggeri štite potvrđena sidra i audit/CSV. Transakcijska objava s zaključavanjem jednom dnevno, SHA-256, trajna arhiva. Nepotpuni podaci blokiraju objavu. Sidra prikazana na karticama, detalju, varijantama, košarici i listi želja.

GitHub daily-price-list.yml: 07:30, provjere/oporavak 07:40/07:50 Europe/Zagreb. Vercel cron uklonjen. Potreban isti CRON_SECRET u GitHubu i produkcijskom Vercelu; GitHub secrets bili prazni. Raspored može kasniti/izostati. Bez aktivacije, potpune baze i jutarnjeg prihvata ne tvrditi operativnu spremnost. Povijest najniže cijene u 30 dana nedovršena.

36/36 testova PASS, uključuju PGlite migraciju, triggere, DST, CSV, hash i cron. Lint 0 errors/9 postojećih warnings, TypeScript i build PASS. Nakon RLS ponovno 36/36 PASS i diff-check PASS. Plan work/LEGAL_IMPLEMENTATION_PLAN.md, runbook work/LEGAL_PRICE_LIST_RUNBOOK.md.

## Produkcijska baza — izvršeno

Supabase fmqcjvoemdmghikrzulk / rotea-webshop-hermes, org meskazabvkjhademquop. Migracija atomarno izvršena preko SQL editora i provjerena: 4 nove tablice RLS=true; nova polja i triggeri postoje; sačuvano 846 proizvoda i 152 varijante. Prvi neuspjeli pokušaj nije izmijenio bazu; Monaco fill nije zamijenio cijeli tekst. Native select-all/paste i clipboard usporedba osigurali točan SQL. Ne ponavljati migraciju. Dokaz /private/tmp/ro-tea-live-migration.png. Nema Prisma migration ledgera; migracija je primijenjena ručno.

Svi proizvodi/varijante ACTIVE; brojčana zaliha samo 4 proizvoda i 0 varijanti. Barkodovi/jedinice/količine pakiranja nisu postojali. Sidra i CSV još nisu potvrđeni/objavljeni. Postojeće osobne i narudžbene podatke nismo čitali.

## Repo i sljedeći korak

Repo /Users/macbookair/Documents/ro-tea web + shop/hermes; GitHub dpernek/ro-tea-webshop-hermes; grana codex/legal-prices-and-price-lists, dosadašnji HEAD a18b4c7. PR #1 base main, #2 base PR1 grana; oba mergeable i Vercel PASS, priloženi chatu. Sljedeće: commit/push RLS, merge #1 i #2 na main, produkcijski deployment i browser prihvat; cron tajna i pregled nedostajućih podataka.

Produkcija https://ro-tea-webshop-hermes.vercel.app; Vercel project prj_qSJwfEYirr9jiezRLLhgdNDfxKKP, team team_9Rv8XaptaeM9SWtERRp5tFz8. Connector schema/404 greške; gh i Chrome rade. Pročitani Next 16.2.9 vodiči i Next/cron/deployments/env-vars skills. Roditeljske izmjene ne dirati.
