# Payment / Escrow Infrastructure for Central America — Research Notes

**Date of research:** 2026-08-02
**Author context:** Research for `arreglao`, a two-sided home-services marketplace (React Native/Expo). No backend exists yet in this repo.

## Question and scope

`arreglao`'s flow is: poster creates a job → workers apply → poster picks one → in-app chat → **poster pays and the app holds the money in escrow until the job is marked done, then releases/pays out to the worker.**

This document asks, per target country, three questions about every payment/escrow provider investigated:

- **(a)** Can the provider accept a payment **from** a customer (poster) in that country?
- **(b)** Can the provider onboard a payee and **pay out to** a recipient (worker) in that country — and specifically, **can that payout land in an ordinary local bank account** (e.g. at BAC Credomatic, a bank that operates in Costa Rica, Guatemala, Honduras, Nicaragua, Panama and El Salvador) via the country's domestic transfer rail, as opposed to only a wallet, card, or a bank account in some other "home" country? A provider that pays out only to a card or wallet, and not to a local bank account, is treated as a **hard disqualifier** for this use case — landing money in a real bank account is a requirement, not a nice-to-have.
- **(c)** Does the provider offer a built-in escrow / delayed-capture / hold / split-payment primitive that fits a "hold until job complete" flow?

**Target countries:** Honduras, Guatemala, El Salvador, Nicaragua, Costa Rica, Panama (primary), Belize (lower priority, covered where easy).

**Sourcing rule:** every claim below is linked to the specific primary-source page it came from (the provider's own docs, support articles, or official site). Blog posts / listicles / forum threads were used only to find leads, never cited as the source of a claim. Anything I could not confirm from a primary source is isolated in the **[Could not verify](#could-not-verify)** section at the end — nothing there should be treated as fact.

---

## 1. Global / multinational platforms

### 1.1 Stripe (incl. Stripe Connect) — hard disqualifier, all countries

| Country | (a) Accept payments | (b) Payout / local bank | (c) Escrow primitive |
|---|---|---|---|
| Honduras, Guatemala, El Salvador, Nicaragua, Costa Rica, Panama, Belize | Not listed as a country where a business can open a Stripe account | Not supported — Connect cross-border payouts restricted to a fixed region | N/A — moot, platform can't be onboarded |

- Stripe's own global-availability page lists supported business countries by region (Europe, Asia-Pacific, Americas: Brazil/Canada/Mexico/US, plus an African network via Paystack); no Central American country appears in that list. [stripe.com/global](https://stripe.com/global)
- Stripe Connect's cross-border payouts documentation states connected accounts can only be located in the **US, UK, EEA, Canada, or Switzerland**, and explicitly: *"Stripe does not support self-service cross-border payouts to countries outside the regions indicated."* No Central American country is listed. [docs.stripe.com/connect/cross-border-payouts](https://docs.stripe.com/connect/cross-border-payouts)
- **Bank-payout bar:** fails outright — a platform business cannot even be onboarded from any of these seven countries, and connected accounts (payees) cannot be located there either, so BAC Credomatic reachability is moot.

### 1.2 Adyen for Platforms — hard disqualifier, all countries

| Country | (a) | (b) | (c) |
|---|---|---|---|
| All 7 target countries | Not listed | Not listed | N/A |

- Adyen's Platforms docs state: *"You can onboard users operating in any of the following countries and regions,"* and the list covers Europe, North America (US, Canada), and Asia-Pacific (Australia, Hong Kong, New Zealand, Singapore) only. No Central American country appears. [docs.adyen.com/platforms/](https://docs.adyen.com/platforms/)
- **Bank-payout bar:** fails — no CA country is an eligible onboarding country at all, so no local bank rail question even arises.

### 1.3 Mangopay — hard disqualifier for local bank payout, all countries

| Country | (a) User/pay-in creation | (b) Payout / local bank | (c) Escrow |
|---|---|---|---|
| Honduras, Guatemala, El Salvador, Nicaragua, Costa Rica, Panama, Belize | Listed as "no restrictions" in Mangopay's country-restrictions table (user creation, pay-ins, recipients all shown as OK) | **No** — see below | Yes, generically (wallet-based escrow), but unusable here since payout can't reach these countries |

- Mangopay's country-restrictions guide shows Honduras, Guatemala, El Salvador, Nicaragua, Costa Rica, Panama, and Belize as unrestricted for user creation, pay-ins, and recipients/payouts at the country-code level. [docs.mangopay.com/guides/users/country-restrictions](https://docs.mangopay.com/guides/users/country-restrictions)
- However, Mangopay's full supported-currency list is: **AED, AUD, CAD, CHF, CNH, CZK, DKK, EUR, GBP, HKD, HUF, ILS, JPY, MXN, NOK, NZD, PLN, RON, SAR, SEK, SGD, TRY, USD, ZAR.** None of HNL, GTQ, CRC, NIO, or BZD appear. [docs.mangopay.com/guides/currencies](https://docs.mangopay.com/guides/currencies)
- Mangopay's payouts guide describes two payout methods per Recipient — `InternationalBankTransfer` (SWIFT to an IBAN) or `LocalBankTransfer` (domestic rail) — and the domestic (`LocalBankTransfer`) rails it documents are SEPA (EUR), UK Faster Payments/CHAPS (GBP), US ACH (USD, for **US** recipients), and Canadian EFT (CAD); no Central American local rail is described, and activation of any rail is contract-dependent ("contact Mangopay via the Dashboard to discuss activation"). [docs.mangopay.com/guides/payouts](https://docs.mangopay.com/guides/payouts)
- Mangopay itself states elsewhere that companies (platforms) must be registered in the EEA or UK to use the service at all. [docs.mangopay.com](https://docs.mangopay.com/) (see also currency/payout pages above)
- **Bank-payout bar: fails.** Even though a worker's *country* isn't blocked at the KYC layer, there is no supported currency or domestic rail for any of the seven target countries, so a payout cannot land in a Honduran, Guatemalan, Salvadoran, Nicaraguan, Costa Rican, Panamanian, or Belizean bank account (BAC Credomatic or otherwise) through Mangopay today.

### 1.4 PayPal (Payouts product) — partial, unresolved on the bank-payout bar

| Country | (a) Accept payments | (b) Payout | (c) Escrow |
|---|---|---|---|
| Honduras | Listed in PayPal Payouts as "Send, receive, and withdraw" | Ambiguous — see below | None found |
| Guatemala | Same | Ambiguous | None found |
| El Salvador | Same | Ambiguous | None found |
| Nicaragua | Same | Ambiguous | None found |
| Costa Rica | Same | Ambiguous | None found |
| Panama | Same | Ambiguous | None found |
| Belize | **Not listed** | Not listed | — |

- PayPal's Payouts developer reference lists Honduras (HN), Guatemala (GT), El Salvador (SV), Nicaragua (NI), Costa Rica (CR), and Panama (PA) with the feature set "Send, receive, and withdraw"; Belize does not appear in this table. [developer.paypal.com/docs/payouts/standard/reference/country-feature/](https://developer.paypal.com/docs/payouts/standard/reference/country-feature/)
- That page does **not** state whether "withdraw" means a direct transfer to a local bank account or only a PayPal-balance withdrawal via a linked bank/card — the distinction matters for the bank-payout bar and isn't resolved by this document.
- Separately, PayPal's own consumer "send money to Honduras" page describes sending money via **Xoom** (a PayPal service) to Honduras with delivery options including "cash pickup, for bank deposit, or to a mobile wallet" — i.e., bank deposit into a Honduran bank account is confirmed for that specific consumer product. [paypal.com — Send Money to Honduras](https://www.paypal.com/us/digital-wallet/send-receive-money/send-money-internationally/send-money-to-honduras)
- No marketplace/escrow/split-payment primitive was found in PayPal's own documentation for this use case (PayPal Payouts is a mass-payment/disbursement API, not an escrow product; capture/hold behavior on regular PayPal Checkout is a short authorization window, not designed for "hold until job done" over days/weeks).
- **Bank-payout bar: not confirmed either way from primary docs** for the business Payouts API (as opposed to the consumer Xoom product) — flagged in Could Not Verify.

### 1.5 Braintree (PayPal) via EBANX integration

| Country | (a) | (b) | (c) |
|---|---|---|---|
| Guatemala | Supported per Braintree's own EBANX integration guide | Not confirmed as sub-merchant/marketplace payout | Not found |
| Costa Rica | Supported, but page notes "local processing is not supported" | Not confirmed | Not found |
| Honduras, El Salvador, Nicaragua, Panama, Belize | Not listed | Not listed | — |

- Braintree's own EBANX integration guide lists supported countries as: Argentina, Brazil, Chile, Colombia, **Costa Rica**, Egypt, **Guatemala**, Mexico, Nigeria, Paraguay, Peru, South Africa, Uruguay — with a note that Costa Rica requires 3DS for non-recurring transactions and that "local processing is not supported" for Guatemala. [developer.paypal.com/braintree/docs/guides/ebanx/integration-guide](https://developer.paypal.com/braintree/docs/guides/ebanx/integration-guide)
- No Braintree documentation found describing marketplace sub-merchant onboarding or payouts for these countries — Braintree/EBANX here reads as a card-acceptance channel, not a payout/escrow solution.

### 1.6 dLocal — strongest global-platform candidate, 6 of 7 countries

dLocal is the only global-scale platform found with **primary-source, per-country payout documentation that names actual banks**, including BAC entities, across most of the region.

**Coverage (from dLocal's own country reference):** Honduras (HN/HNL), Guatemala (GT/GTQ), El Salvador (SV/USD), Nicaragua (NI/NIO), Costa Rica (CR/CRC), and Panama (PA/USD) are all listed; **Belize does not appear** in dLocal's country coverage. [docs.dlocal.com/reference/country-reference](https://docs.dlocal.com/reference/country-reference)

| Country | (a) Accept payments | (b) Payout / local bank transfer | BAC Credomatic reachable? |
|---|---|---|---|
| Honduras | Cards (Visa, Mastercard, JCB, Amex, Discover, Diners) confirmed on the Honduras payments page. [docs.dlocal.com/docs/honduras](https://docs.dlocal.com/docs/honduras) | Bank transfer only, to one of 16 named Honduran banks. [docs.dlocal.com/docs/honduras-payouts-v3](https://docs.dlocal.com/docs/honduras-payouts-v3) | **Yes** — "BAC Honduras" listed with bank code 130. [docs.dlocal.com/docs/honduras-payouts-v3](https://docs.dlocal.com/docs/honduras-payouts-v3) |
| Guatemala | Card coverage listed per dLocal's payment-method-by-country structure (not itemized in this pass — see [docs.dlocal.com/docs/payment-method](https://docs.dlocal.com/docs/payment-method)) | Bank transfer only, to one of 19 named Guatemalan banks; cash/mobile wallet **not** supported. [docs.dlocal.com/docs/guatemala-payouts-v3](https://docs.dlocal.com/docs/guatemala-payouts-v3) | **Yes** — "BAC Guatemala" listed, bank code 42. [docs.dlocal.com/docs/guatemala-payouts-v3](https://docs.dlocal.com/docs/guatemala-payouts-v3) |
| El Salvador | Same structure as above | Bank transfer only, to one of 14 named banks | **Yes** — "Banco de América Central, S.A." listed, bank code 4. [docs.dlocal.com/docs/el-salvador-payouts-v3](https://docs.dlocal.com/docs/el-salvador-payouts-v3) |
| Nicaragua | Same structure | Bank transfer only, to one of 7 named banks | **Yes** — "BAC Nicaragua" listed, bank code 7. [docs.dlocal.com/docs/nicaragua-payouts-v3](https://docs.dlocal.com/docs/nicaragua-payouts-v3) |
| Costa Rica | Same structure | Bank transfer only; uses the country's standard 22-character IBAN-format account number (e.g. `CR32011400007914077990`) rather than a named-bank list | **Not confirmed** — no bank-name list published for Costa Rica in the fetched page, so BAC San José could not be individually confirmed, though the IBAN format used applies uniformly to all CR banks. [docs.dlocal.com/docs/costa-rica-payouts-v3](https://docs.dlocal.com/docs/costa-rica-payouts-v3) |
| Panama | Same structure | Bank transfer only, to one of 54 named banks | **Yes** — "BAC International Bank" listed, bank code 138. [docs.dlocal.com/docs/panama-payouts-v3](https://docs.dlocal.com/docs/panama-payouts-v3) |
| Belize | Not covered | Not covered | N/A |

**(c) Escrow:** dLocal does **not** offer a true "hold funds until a condition is met" escrow primitive. Its "Split Payments for Platforms" feature splits an incoming payment across a platform account and one or more user accounts **at the moment of the sale** (or at authorization/capture time for card flows); a "Liable account" is described as holding funds only for fee/tax purposes, and dLocal's own overview states funds "remain in transit until reaching the settlement period" — not a conditional, merchant-triggered release. [docs.dlocal.com/docs/split-payments-platforms](https://docs.dlocal.com/docs/split-payments-platforms), [docs.dlocal.com/docs/platforms-overview](https://docs.dlocal.com/docs/platforms-overview). A "hold until job complete" flow on dLocal would have to be **built by the platform**: collect the payment into the platform's own dLocal balance/account, and only call the split/payout API once the job is marked done — i.e., dLocal supplies the payment rail and payout rail, not the escrow logic itself.

**KYC:** dLocal requires structured KYC data before a platform sub-user (payee) can transact — for companies: tax ID, registered name, legal representative details, and Ultimate Beneficial Owners (10–25%+ ownership); for individuals: tax ID, document number, address, PEP status. Requirements vary "depending on the entity type and country." [docs.dlocal.com/docs/kyc-requirement-platforms](https://docs.dlocal.com/docs/kyc-requirement-platforms). Honduras payouts specifically require a beneficiary DNI (13 digits) or RTN (14 digits). [docs.dlocal.com/docs/honduras-payouts-v3](https://docs.dlocal.com/docs/honduras-payouts-v3)

### 1.7 Rapyd — mostly unconfirmed from public primary sources

- Rapyd's public network page for Honduras is a generic template with no country-specific content filled in (the page literally left the country-name placeholder blank in the fetched content), so no concrete payin/payout claim can be sourced from it. [rapyd.net/network/country/honduras/](https://www.rapyd.net/network/country/honduras/)
- Rapyd's detailed supported-countries and payment-method-by-country documentation sits behind a client portal / login (`help.rapyd.net` was unreachable during this research, and `docs.rapyd.net`'s country-list content requires portal access), so per-country (a)/(b)/(c) and BAC-reachability claims could not be confirmed from primary sources. Flagged in Could Not Verify.

### 1.8 Checkout.com — not confirmed from public primary sources

- Checkout.com's own "Supported countries for Bank Payouts" support article returned an HTTP 403 on every fetch attempt during this research, so its Central America bank-payout coverage (and therefore the bank-payout bar) could not be verified. [support.checkout.com — Supported countries for Bank Payouts](https://support.checkout.com/hc/en-us/articles/31187373544466-Supported-countries-for-Bank-Payouts) *(inaccessible during this research — flagged in Could Not Verify)*
- Checkout.com's public payment-methods marketing page makes only generic global claims ("over 50 countries," "150+ currencies") without a Central America-specific breakdown. [checkout.com/payment-methods](https://www.checkout.com/payment-methods)

### 1.9 Wise — payout-rail component only, no acceptance/escrow

Wise is a money-transfer product, not a marketplace payment/checkout platform: it has no customer-facing card-acceptance/checkout product for a marketplace's payers, and no escrow, hold, or split-payment feature was found in any Wise documentation reviewed. It is relevant only as a possible **payout leg** inside a custom-built (fallback) escrow architecture — see [§3](#3-fallback--build-it-yourself-escrow).

| Country | (b) Local bank account payout confirmed? |
|---|---|
| Honduras | Yes — "you can receive to local bank accounts — no need for a Wise account." [wise.com — Send Money to Honduras](https://wise.com/us/send-money/send-money-to-honduras) |
| Guatemala | Yes, same language. [wise.com — Send Money to Guatemala](https://wise.com/us/send-money/send-money-to-guatemala) |
| El Salvador | Yes, same language (USD→USD). [wise.com — Send Money to El Salvador](https://wise.com/us/send-money/send-money-to-el-salvador) |
| Nicaragua | Yes, same language. [wise.com — Send Money to Nicaragua](https://wise.com/us/send-money/send-money-to-nicaragua) |
| Costa Rica | Yes, same language. [wise.com — Send Money to Costa Rica](https://wise.com/us/send-money/send-money-to-costa-rica) |
| Panama | Yes, same language. [wise.com — Send Money to Panama](https://wise.com/us/send-money/send-money-to-panama) |
| Belize | **No** — Wise's own page states: *"We're working hard to allow customers to send BZD to Belize from the US - but we're not quite there yet,"* with a waitlist signup. [wise.com — Send Money to Belize](https://wise.com/us/send-money/send-money-to-belize) |

Wise separately publishes a "Wise Platform" API product for institutional partners, but no evidence was found (or looked for in depth, given Wise's disqualification on escrow/acceptance grounds) that it changes this picture for a marketplace use case.

### 1.10 Kushki — not currently operating in Central America

- Kushki's own documentation portal, in the pages fetched, lists supported payment-acceptance countries as Chile, Colombia, Ecuador, Mexico, and Peru — no Central American country appears. [docs.kushki.com](https://docs.kushki.com/)
- A direct URL guess for Guatemala-specific docs (`docs.kushki.com/en/docs/guatemala`) returned a 404, consistent with no current Guatemala coverage in the docs.
- Kushki does support a payout/"dispersión de dinero" (money distribution) feature per its docs, described as automating "el reparto de dinero de tu plataforma a tus clientes o usuarios," but this is only evidenced for the countries already listed (Chile, Colombia, Ecuador, Mexico, Peru), none of which are in scope.
- Secondary press coverage (not cited as fact) suggests Kushki has *planned* expansion into Panama, Costa Rica, and Guatemala, but no primary-source confirmation of live service was found. **Treat as not currently usable for this project.**

---

## 2. Regional / local processors and mobile money

### 2.1 Wompi — fragmented by country/legal entity; payout capability confirmed only in Colombia (out of scope)

Wompi is not one company across the region: "Wompi" in Panama is operated by **Banistmo** (a Panamanian bank), and "Wompi" in Colombia is Bancolombia's product; El Salvador has a separate `wompi.sv` site. This matters because features documented for one country's Wompi do not necessarily apply to another.

| Country | (a) Accept payments | (b) Payout / local bank ("Pagos a Terceros") |
|---|---|---|
| Panama | Cards (Visa/Mastercard) and **Clave** (Telered's card/payment system in Panama) confirmed. [docs.wompi.co/en/docs/panama/metodos-de-pago/](https://docs.wompi.co/en/docs/panama/metodos-de-pago/) Wompi in Panama is run by Banistmo. [banistmo.com — Wompi Panamá](https://www.banistmo.com/pymes/adquirencia/wompi) | **Not confirmed** — Wompi's "Payouts"/"Pagos a Terceros" documentation found (`docs.wompi.co/en/docs/colombia/que-es-pagos-a-terceros/`) explicitly describes the product for Colombia (payout to Bancolombia/Nequi/any Colombian bank); attempts to reach a Panama-specific payouts page (`.../panama/cuentas-pagos-a-terceros/`) returned HTTP 403 during this research |
| El Salvador | Payment links / API for card charges referenced on `docs.wompi.sv`, but the fetched excerpt didn't detail full payment-method coverage | Not found in the accessible documentation |
| Guatemala, Honduras, Nicaragua, Costa Rica, Belize | No Wompi presence found | — |

- **Bank-payout bar:** cannot be confirmed as passing for Panama or El Salvador from the documentation actually accessible in this research; Wompi's own "Payouts" product, as documented, appears scoped to Colombia. Flagged as an open item, not asserted as a fail, since the Panama payout pages could not be loaded (403) rather than being confirmed absent.

### 2.2 Pagadito — Central-America-native PSP, promising but thinly documented publicly

- Pagadito is headquartered in San Salvador, El Salvador, and its own site states it operates in Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica, Panama, the US, Dominican Republic, Mexico, **Belize**, Sint Maarten, Guyana, and Suriname (13+ countries) — the only provider found in this research whose own site explicitly claims Belize coverage. [pagadito.com](https://www.pagadito.com/)
- Pagadito advertises a "Transferencias por Lote" (batch transfers) feature explicitly pitched at "collaborative economy apps and marketplaces" (B2B2C), which is directionally the right shape for a marketplace payout flow — but the detailed mechanics (which banks/rails it reaches per country, whether BAC Credomatic is reachable, any escrow/hold semantics) were **not** found in the publicly accessible pages of `pagadito.com`, `comercios.pagadito.com`, or `dev.pagadito.com` during this research; the developer portal only documents Java/PHP APIs for accepting card payments, not the batch-transfer/payout product specifically. [dev.pagadito.com](https://dev.pagadito.com/en/int/)
- A merchant-requirements page (KYC-style: ID document, proof of address, bank reference) was referenced by a search result, but on direct fetch the live page did not contain that content, so it is **not** cited as confirmed — see Could Not Verify.
- **Recommendation:** Pagadito is worth a direct sales/API conversation given its explicit regional (and Belize) coverage claim, but nothing here should be treated as a confirmed "passes the bank-payout bar" today.

### 2.3 Payvalida — payout API confirmed for Guatemala and El Salvador only

- Payvalida's own payouts API documentation lists exactly five payout countries: Colombia, Ecuador, **Guatemala**, Peru, and **El Salvador**. Honduras, Nicaragua, Costa Rica, and Panama are not included. [docs.payvalida.com/api-payouts](https://docs.payvalida.com/api-payouts)
- The same page references country-specific bank lists ("Bancos en Guatemala," "Bancos en El Salvador") but the bank names themselves were not visible in the fetched content, so **BAC Credomatic's presence on Payvalida's bank list could not be confirmed either way**.

### 2.4 EBANX — regional pay-in presence confirmed for 4 CA countries; payout-to-local-bank not confirmed

- EBANX's own press room states it *"has started its expansion throughout Central America, launching operations in Costa Rica and going live in El Salvador, Panama, Guatemala, and the Dominican Republic by the first half of 2021."* [business.ebanx.com — press release](https://business.ebanx.com/en/press-room/press-releases/ebanx-kicks-off-operations-in-central-america-starting-with-costa-rica-el-salvador-panama-guatemala-and-dominican-republic) This confirms **pay-in / regional operating presence** in Costa Rica, El Salvador, Panama, and Guatemala (not Honduras, Nicaragua, or Belize) as a first-party claim, though it is a press release rather than a technical/coverage doc page.
- EBANX's payout "Get started" developer documentation, in the content actually retrieved, illustrates payout recipient fields/examples using **Brazil, Chile, Colombia, and Mexico** only; it did not, in the pages fetched, confirm that local bank-account payout is available in Costa Rica, El Salvador, Panama, or Guatemala specifically. [docs.ebanx.com/docs/payout/get-started](https://docs.ebanx.com/docs/payout/get-started)
- EBANX's marketing pages describe a marketplace/platform product (seller onboarding, split payments, mass payouts) at a general level, but the country-specific coverage and bank-reachability detail needed to confirm the bank-payout bar could not be retrieved — several EBANX pages (`ebanx.com/en/markets-coverage/`, `ebanx.com/en/legal/merchants/description-of-ebanx-payment-methods/`) returned HTTP 403 during this research.
- **Bank-payout bar: unresolved** — flagged in Could Not Verify; worth a direct follow-up with EBANX given the confirmed regional presence.

### 2.5 Tigo Money — consumer mobile wallet, no public developer/business API found

- Tigo Money operates consumer mobile-wallet apps in Honduras and Guatemala (per the apps' own Google Play listings), supporting bill pay, remittances (including receiving Western Union/MoneyGram transfers), and P2P transfers. [Google Play — Billetera Tigo Money Honduras](https://play.google.com/store/apps/details?id=hn.tigo.mfsapp)
- No publicly discoverable primary-source developer or business-integration API documentation was found describing how a third-party marketplace platform would programmatically pay out into a Tigo Money wallet. **Cannot confirm (b) from primary sources.**

### 2.6 SINPE / SINPE Móvil (Costa Rica) — central-bank rail, no third-party developer API found

- SINPE Móvil is Costa Rica's instant, mobile-number-based interbank transfer service run by the Central Bank of Costa Rica (BCCR); businesses are required to report SINPE Móvil as a payment method on electronic invoices, indicating it is a recognized commercial payment rail. However, no BCCR-published developer/API documentation for third-party programmatic integration was located in this research — businesses appear to integrate via their own bank's merchant products rather than a direct public BCCR API. **Flagged in Could Not Verify** rather than asserted as usable or unusable for a marketplace integration.

### 2.7 BAC Credomatic itself — has a developer API portal; scope unconfirmed

- BAC Credomatic operates across Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica, Panama, plus Grand Cayman, the Bahamas, and the US, and maintains its own developer portal ("BAC API Center") advertising a Payments API product. [developers.baccredomatic.com](https://developers.baccredomatic.com/)
- The specific API-product detail pages (which would show payout/marketplace/split capabilities and per-country availability) were not successfully retrieved in this research — the portal's homepage only exposed navigation, not product detail. **This is a lead worth a direct follow-up, not a confirmed finding.**

### 2.8 Yappy (Panama) — payin-only mobile wallet, Panama-only

- Yappy is Banco General's mobile wallet in Panama, with a merchant "Botón de Pago" (payment button) API for accepting payments from Panamanian Yappy users, integrable directly or via the partner Tilopay. [yappy.com.pa — Desarrolladores](https://www.yappy.com.pa/comercial/desarrolladores/)
- This is a **payin-only, Panama-only** channel — no payout, marketplace, or multi-country capability was found, so it does not address the payout/escrow leg of the product and is not regionally general enough on its own.

### 2.9 Kushki — see [§1.10](#110-kushki--not-currently-operating-in-central-america) (covered there; a regional processor, but not yet live in Central America per its own docs).

---

## 3. Fallback / build-it-yourself escrow

Given that **no provider found in this research offers, from its own documentation, a turnkey "accept payment → hold in escrow → release to a Central American worker's bank account" flow across the whole target region**, the realistic architecture today is a **custom-built escrow on top of whichever processor(s) actually reach the required countries**:

1. **Collect** the poster's payment through a processor that can accept payment from the poster's country (dLocal covers payment acceptance across HN/GT/SV/NI/CR/PA per §1.6; PayPal/Xoom, Wompi, Pagadito, or EBANX may supplement depending on country).
2. **Hold** the funds in a company-controlled ledger — either (a) inside the processor's own platform/merchant balance (e.g., dLocal's "Split Payments for Platforms" flow, where the platform controls *when* it calls the split/payout API — see §1.6) or (b) in the company's own bank account, tracked by an internal ledger table that marks funds as "held for job #X" until the job is marked complete.
3. **Trigger payout** to the worker only once the job is marked done — via whichever processor's payout API reaches that worker's country and bank (dLocal's named-bank payout endpoints, per §1.6, are the most concretely documented option today), or via a local bank transfer / mobile money API if a direct banking relationship is established.

This is not "escrow" in the regulated, licensed sense that a dedicated escrow provider offers — it is **the platform holding customer funds itself**, whether inside a PSP's platform balance or its own bank account, until a business condition (job completion) is met.

### Regulatory exposure — general concepts only, not legal advice

Holding funds that belong to a third party (the poster's payment, which is ultimately owed to the worker) before disbursing it is the kind of activity that in many jurisdictions falls under **money transmission / money services business regulation**, sometimes referred to in Spanish-language contexts by concepts like *"fondos de terceros"* (third-party funds) or requirements around operating a *"cuenta concentradora"* (pooled/concentrator account). Whether — and under what license, registration, or exemption — a marketplace app is permitted to hold third-party funds this way is a **per-country legal/regulatory question that this document cannot answer**. None of the provider documentation reviewed in this research constitutes legal guidance on Honduran, Guatemalan, Salvadoran, Nicaraguan, Costa Rican, or Panamanian money-transmission/fintech licensing law.

**This explicitly requires local legal counsel, per country, before building or launching a self-held-escrow flow.** Nothing in this section should be read as a legal conclusion about any specific country's licensing regime, and no such conclusion is offered here.

---

## 4. KYC / identity verification

Every payout-capable provider reviewed that publishes onboarding requirements requires payee (worker) identity verification before releasing funds:

- **dLocal** requires, for platform sub-users: for individuals, a tax ID/document number, address, and PEP (politically exposed person) status; for companies, additionally a legal representative and Ultimate Beneficial Owner(s) (10–25%+ ownership) disclosure. Requirements vary "depending on the entity type and country." [docs.dlocal.com/docs/kyc-requirement-platforms](https://docs.dlocal.com/docs/kyc-requirement-platforms) For Honduras specifically, payout beneficiaries must supply a DNI (13-digit national ID) or RTN (14-digit tax ID). [docs.dlocal.com/docs/honduras-payouts-v3](https://docs.dlocal.com/docs/honduras-payouts-v3)
- **Mangopay** enforces country-level KYC restrictions (blocking some countries entirely, e.g. Cuba, Iran, North Korea, Myanmar, Syria, and partially restricting ~20 others) via its Country Authorizations API/guide, though — per §1.3 — this doesn't translate into usable payout coverage for Central America today. [docs.mangopay.com/guides/users/country-restrictions](https://docs.mangopay.com/guides/users/country-restrictions)
- **PayPal** requires standard account verification for its Payouts recipients per country (documented at a country-feature level, not a document-checklist level, in the reference table already cited). [developer.paypal.com/docs/payouts/standard/reference/country-feature/](https://developer.paypal.com/docs/payouts/standard/reference/country-feature/)
- No specific KYC document checklist could be confirmed from primary sources for Pagadito, Payvalida, EBANX, Wompi, or BAC Credomatic's API in this research pass (see Could Not Verify) — any of these would need direct confirmation of onboarding/KYC requirements before being relied on.

---

## Could not verify

Everything in this section is explicitly **unconfirmed** — either no primary source could be reached, or the source didn't state the fact clearly enough to cite. None of it should be treated on par with the sourced findings above.

- **PayPal Payouts — bank vs. balance withdrawal.** Whether the PayPal Payouts API's "withdraw" capability for Honduras/Guatemala/El Salvador/Nicaragua/Costa Rica/Panama means a direct transfer into a local bank account (as the consumer Xoom product does for Honduras) or only a PayPal-balance withdrawal requiring a separately linked bank/card, could not be confirmed from PayPal's developer documentation.
- **Rapyd** — per-country payin/payout coverage, payment methods, and bank-payout capability could not be confirmed; Rapyd's detailed docs sit behind a login-gated client portal, and `help.rapyd.net` could not be reached during this research.
- **Checkout.com** — the "Supported countries for Bank Payouts" support article returned HTTP 403 on every attempt; no Central America-specific payout coverage could be confirmed or denied from primary sources.
- **Wompi (Panama and El Salvador) — Payouts/"Pagos a Terceros" availability.** Wompi's documented Payouts product could only be confirmed for Colombia; Panama- and El Salvador-specific payout pages returned HTTP 403 and could not be checked. Whether Wompi's payout product is available in Panama or El Salvador, and whether it reaches BAC Credomatic, is unconfirmed.
- **Pagadito** — the "Transferencias por Lote" batch-transfer product's actual bank/rail coverage per country, BAC Credomatic reachability, and any escrow/hold semantics could not be confirmed from the publicly accessible Pagadito site or developer portal. A merchant KYC requirements page referenced by a search snippet (ID + proof of address + bank reference) could **not** be reproduced on direct fetch of the live page and is therefore not treated as confirmed.
- **EBANX** — payout-to-local-bank-account availability specifically in Costa Rica, El Salvador, Panama, and Guatemala (as opposed to confirmed pay-in/operating presence in those four countries) could not be confirmed; several EBANX coverage/payment-method pages returned HTTP 403 during this research.
- **Payvalida** — the actual bank names reachable in Guatemala and El Salvador (and whether BAC Credomatic is among them) could not be confirmed; the docs page referenced separate bank-list pages whose content wasn't retrieved.
- **Tigo Money** — no business/developer API documentation was found at all; whether a third-party platform can programmatically pay into a Tigo Money wallet is unconfirmed.
- **SINPE / SINPE Móvil** — no BCCR-published third-party developer API documentation was found; whether/how a marketplace could integrate directly with SINPE Móvil (versus only via a bank's own merchant product) is unconfirmed.
- **BAC Credomatic's own developer API** — the BAC API Center's specific product pages (which would show whether its Payments API supports marketplace/payout/split use cases, and in which of its six countries) could not be retrieved in this research.
- **Kushki's Central America expansion timeline** — secondary press coverage suggests planned expansion into Panama, Costa Rica, and Guatemala, but no primary-source (Kushki's own docs or site) confirmation of live service in any Central American country was found; current primary-source-confirmed coverage is Chile, Colombia, Ecuador, Mexico, Peru only.
- **Regulatory / money-transmission licensing conclusions for any specific country.** This entire topic area requires local legal counsel per country (Honduras, Guatemala, El Salvador, Nicaragua, Costa Rica, Panama, Belize) and is explicitly **not** addressed with legal conclusions anywhere in this document — see §3.
