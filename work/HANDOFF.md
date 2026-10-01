# RO-TEA Hermes — stanje 2026-10-01

## Cilj i granice

Korisnik je nakon pregleda online webshopa odobrio popravljanje nalaza redom. Aktivni projekt je `/Users/macbookair/Documents/ro-tea web + shop/hermes`, GitHub `dpernek/ro-tea-webshop-hermes`. Roditeljski direktorij je stariji projekt s korisnikovim lokalnim izmjenama; ne dirati ga. Radna grana: `codex/checkout-and-home-fixes`, polazište main `e08541bf2dad634326ed2073773a374349379d62`.

Produkcija: https://ro-tea-webshop-hermes.vercel.app. Vercel projekt `prj_qSJwfEYirr9jiezRLLhgdNDfxKKP`, team `team_9Rv8XaptaeM9SWtERRp5tFz8`. Početni produkcijski deployment `dpl_3scg1f2NVR4UHimp4tua3bdiThkJ` bio je READY i odgovarao mainu. Ne stvarati stvarne narudžbe, naplate, e-mailove ni GLS pošiljke tijekom provjera. Nema promjene baze, migracije ili prepisivanja povijesnih narudžbi.

## Implementirane odluke

- `src/lib/tax.ts` izdvaja PDV iz bruto cijena; dijele ga `pricing.ts` i `CartSummary.tsx`. Primjer 8 € = 1,60 € PDV. `taxTotal` ostaje PDV međuzbroja artikala, prije dostave/kupona, kao prikaz u košarici.
- `checkout-validation.ts` sadrži zajedničku Zod validaciju za ručni i Stripe checkout. Količine moraju biti pozitivni cijeli brojevi; prazna košarica i ponovljeni ID artikla se odbijaju. Klijentske cijene, nazivi i iznosi se uklanjaju. Ručni checkout dopušta samo bank_transfer/cod.
- `shipping-pricing.ts` računa dostavu iz aktivnog zapisa baze i praga besplatne dostave. Oba serverska puta koriste isti helper; ne oslanjaju se na ID koji sadrži “osobno”. GLS Paketomat zahtijeva lokaciju. `actions/orders.ts` više ne koristi klijentski shippingTotal i ne ponavlja DB upit za dostavu. Admin e-mail koristi nazive/cijene iz baze.
- Početna daje CMS intro izravno komponenti FeaturedCategories, bez drugog naslova. PopularProducts poziva `/api/catalog/products?home=true`; API odabire aktivne featured proizvode ili valjane fallback proizvode prije ograničenja na osam. Ostali katalog upiti ostaju isti.
- README dostava usklađena s pregledanim postavkama 8 €/70 €; baza ostaje izvor postavki. CHANGELOG bilježi izmjene.

## Provjere

Pročitani relevantni Next.js 16.2.9 lokalni vodiči prije pisanja koda. Dependencies instalirane, tsx dodan kao devDependency. `npm test`: 13/13 PASS, bez stvarne baze ili Stripe poziva. Testovi pokrivaju bruto PDV/akcije, manipulirane iznose, nevaljane količine/duplikate, aktivnu dostavu/paketomat i stvarne API handlere s testnim DB klijentom. `npm run build` PASS uz mrežni pristup za Google font i javno označen placeholder Stripe ključ samo za build. `npm run lint`: 0 errors, 9 postojećih warnings. `git diff --check` PASS. Logovi `/private/tmp/ro-tea-hermes-{build,lint,tests}.log`.

Početni produkcijski smoke bio je 21/21 PASS i browser pregled kataloga, pretrage, detalja, košarice i blagajne bez console grešaka. Nisu potvrđeni stvarna naplata, e-mail i GLS. Slične kategorije električnog alata imaju različite brand slugove; taxonomy nije mijenjana.

## Sljedeći korak

Korisnik je izričito odobrio push, PR i preview. Commit `c662e2c` je poslan; draft PR https://github.com/dpernek/ro-tea-webshop-hermes/pull/1 je povezan s chatom. Prvi preview `dpl_5heNdV1euTTAEUxwuNCYinrmwNK3` pao je zbog nedostajućeg Stripe ključa (potvrđeno build logom). `getStripe()` sada inicijalizira SDK pri zahtjevu; checkout bez ključa vraća 503 prije DB pristupa, ostali importi prilagođeni. Dodan regresijski test: 14/14 PASS; lint 0 errors/9 postojećih warnings; build bez Stripe ključa PASS. Slijedi push dopune i provjera novog previewa. Produkcijski merge/deploy nije napravljen niti odobren.
