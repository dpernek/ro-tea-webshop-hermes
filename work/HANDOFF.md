# RO-TEA Hermes — stanje 2026-10-01

## Cilj i odluke

Korisnik je zatražio analizu NN PDF-a, plan zakonskih obveza i zatim „Kreni redom”. Potvrdio: **samo webshop; redovne cijene nisu se mijenjale**. Implementiran je prvi blok sidrenih cijena i javnih dnevnih cjenika. Plan: `work/LEGAL_IMPLEMENTATION_PLAN.md`; aktivacija i prihvat: `work/LEGAL_PRICE_LIST_RUNBOOK.md`.

Službeni NN 101/2026 br. 1212/1213 uređuju sidrene cijene i CSV/XML. NN 110/2026 br. 1309/1310 odgađaju početak obiju odluka na **17. 11. 2026.** Opće sidro ostaje 10. 9. 2026.; ranije kategorije zadržavaju 2. 5. 2025. Izjava vlasnika služi kao dokumentirani izvor prijedloga iz sadašnjih redovnih cijena. Ne potvrđivati automatski nepoznatu povijest; provjeriti novije artikle i ranije kategorije. Sidro nije najniža cijena u 30 dana prije akcije.

## Implementacija

Prisma model i migracija `20261001120000_legal_price_lists`: sidra proizvoda/varijanti, metadata barkoda, jedinice i količine pakiranja (i po varijanti), settings jednog webshopa, audit, CSV snapshots i zapis objava. SQL triggeri štite potvrđena sidra od prepisivanja i audit/datoteke od izmjene ili brisanja. Sidra i metadata spremaju se parametriziranim skupnim SQL-om unutar transakcije.

`src/lib/compliance/`: prijedlog, fingerprint kataloga, validacija punog pregleda, potvrda s administratorskim identitetom/izvorom, CSV i atomarna dnevna objava. Jedan zapis po zagrebačkom danu, advisory lock, ponavljanje serialization konflikta; SHA-256 i nepromjenjiv sadržaj arhive. Nepotpuni podaci blokiraju objavu. Arhiva se ne briše, pa zadržavanje prelazi 30 dana.

`/admin/cjenici`: pregled i potvrda, zajednička marka/vrsta prodaje, zasebne jedinice varijanti, postavke i ručna objava. `/cjenici` + javni CSV download bez prijave i s ETag. Footer/admin navigacija dodani. `vercel.json` cron 04:00 UTC, endpoint zaštićen `CRON_SECRET`; objava početno isključena. Nema vanjskog alarma za izostanak cron poziva; potreban operativni nadzor.

Prikaz sidra na karticama, detalju, odabranim varijantama, povezanim proizvodima, mobilnoj cijeni, košarici i novim stavkama liste želja. Najjeftinija varijanta ima svoju aktualnu cijenu i sidro. Lista želja otvara proizvod za provjeru cijene/odabir varijante. Zajednički helper odbija nevažeću akcijsku cijenu.

## Provjere i granice

28/28 testova PASS; lint 0 errors/9 postojećih warnings; TypeScript i produkcijski build PASS. PGlite izvršava stvarni migracijski PostgreSQL SQL i skupne upise; provjereni triggeri, posebne jedinice varijanti i jedinstvena dnevna objava. Testovi obuhvaćaju fingerprint, preview bez upisa, blokiranje nepotpunog CSV-a, idempotenciju, cron auth i javni download. Stvarni Prisma/PostgreSQL end-to-end još nije potvrđen. Build je trebao mrežni pristup postojećem Google fontu.

Produkcijska migracija, podaci, potvrde sidara i cron aktivacija **nisu izvršeni**. Nema novih produkcijskih narudžbi/naplata/e-mailova/GLS. Sljedeće: izolirana preview baza, migracija, pregled stvarnog kataloga i browser prihvat prema runbooku. Zasebna povijest najniže cijene za 30 dana prije akcije još je otvorena; postojeći oldPrice nije dokaz minimuma. Ne tvrditi potpunu usklađenost.

## Repo i ovlasti

Repo `/Users/macbookair/Documents/ro-tea web + shop/hermes`, remote `dpernek/ro-tea-webshop-hermes`. Implementacija je commit `fd6a3b4`, grana `codex/legal-prices-and-price-lists`, draft PR #2 https://github.com/dpernek/ro-tea-webshop-hermes/pull/2 (base `codex/checkout-and-home-fixes`). PR je priložen chatu. Korisnik je ranije odobrio push/PR/preview, ne produkcijski merge/deploy. PR #1 ostaje draft.

Produkcija https://ro-tea-webshop-hermes.vercel.app ostaje main. Vercel project `prj_qSJwfEYirr9jiezRLLhgdNDfxKKP`, team `team_9Rv8XaptaeM9SWtERRp5tFz8`. GitHub Vercel check i bot potvrđuju READY za `fd6a3b4`: https://ro-tea-webshop-hermes-git-codex-legal-9c3bfe-dperneks-projects.vercel.app. Supabase Preview SKIPPED; stvarna izolirana baza/browser prihvat ostaju otvoreni. Raniji preview nije imao DATABASE_URL ni Stripe ključ. Vercel get_project/get_deployment connector ima schema/404 greške; gh radi. Roditeljske korisnikove izmjene ne dirati. Pročitani Next 16.2.9 vodiči i Next/cron/deployments skills. Generirane duplikate „ 2.ts” sačuvani u `/private/tmp/ro-tea-generated-copies`.
