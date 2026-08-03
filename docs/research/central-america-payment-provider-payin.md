# Payment Pay-In Infrastructure for the Target Market — Research Notes

**Date of research:** 2026-08-03
**Author context:** Research for `arreglao`, a two-sided home-services marketplace (React Native/Expo). This document is issue #6 on a GitHub wayfinder map (issue #1) tracking architecture decisions for the app's MVP.

## Question and scope

This document is **narrower than payment payout/escrow**, which was researched separately and deliberately deferred (see `docs/research/central-america-payment-escrow.md`). In this product, **there is no in-app payment flow between helpers and posters** — the marketplace transaction between them happens outside the app. So the question below is not one leg of a bigger escrow problem; it is the **entire payment scope** this product currently needs:

> Which payment provider (or platform mechanism) can **accept payment (pay-in only)** from a user in the target market, inside an Expo/React Native mobile app, for:
> 1. A one-time low-value charge: credit packages at placeholder prices of $3 / $6.50 / $9 (USD placeholder — actual currency depends on which provider/country the product lands on).
> 2. A recurring monthly charge: a $30/month auto-renewing "Unlimited" subscription.

**Product constraint (added mid-research):** the payment method is restricted to **Apple Pay and Google Pay only** for loading credits or subscribing. The app must **not** store or vault raw card details itself, and must not rely on a processor's generic card-on-file feature either — payment must flow through the device wallet's tokenized flow (Apple Pay / PassKit, Google Pay API), not a raw card-entry form. This constraint, and its interaction with App Store/Play Store policy, turns out to be the single most decisive fact in this research — see [§0](#0-the-decisive-finding-app-store--play-store-policy) and the [recommendation](#recommendation).

**Target market:** referred to throughout only as "the target market" — a single country, never named in this document. Research was run across the same seven-country candidate set the escrow document used (Honduras, Guatemala, El Salvador, Nicaragua, Costa Rica, Panama — primary/highest priority — and Belize, lower priority), and findings below are presented per-candidate-country without asserting which one is real, matching the escrow doc's own convention.

**Sourcing rule:** every claim is linked to the specific primary-source page it came from (the provider's own developer docs, or Apple's/Google's own policy pages). Where a primary source could not be reached or didn't state something clearly enough, it is isolated in the [Could not verify](#could-not-verify) section — nothing there should be treated as fact.

---

## 0. The decisive finding: App Store / Play Store policy

Before evaluating any third-party processor, both platform owners' own policies need to be checked, because they largely pre-empt the question. Credit packages and an "Unlimited" subscription that unlock functionality **inside** the app are the textbook shape of what both platforms call "digital goods/content consumed within the app" — and both platforms require their own in-app purchase system for that, independent of which payment method (card, wallet, anything) would otherwise be used.

### 0.1 Apple App Store — Guideline 3.1.1 (In-App Purchase)

Apple's own App Review Guidelines state, verbatim:

> **3.1.1 In-App Purchase:** "If you want to unlock features or functionality within your app, (by way of example: subscriptions, in-game currencies, game levels, access to premium content, or unlocking a full version), you must use in-app purchase. Apps may not use their own mechanisms to unlock content or functionality, such as license keys, augmented reality markers, QR codes, cryptocurrencies and cryptocurrency wallets, etc."

[developer.apple.com/app-store/review/guidelines](https://developer.apple.com/app-store/review/guidelines/)

Directly relevant sub-clauses from the same page:
- Credits/in-app currencies: *"Any credits or in-game currencies purchased via in-app purchase may not expire, and you should make sure you have a restore mechanism for any restorable in-app purchases."*
- Digital gift cards/vouchers redeemable for digital goods/services *"can only be sold in your app using in-app purchase."*

**Exceptions (3.1.3)** — none of which plausibly cover credits/subscription in this app: physical goods consumed outside the app (3.1.3(e)); real-time person-to-person services like tutoring or medical consultations (3.1.3(d) — this doesn't apply here because the credits/subscription purchase is a payment *to arreglao itself* for app functionality, not a person-to-person service payment, and in any case arreglao has no in-app payment between poster and worker at all per the current product scope); reader apps, multiplatform/enterprise access to previously-purchased content, and free companion apps (3.1.3(a)/(b)/(c)/(f)).

**US-storefront external-link exception:** since a 2025 policy change, apps on the **US** App Store storefront may include external purchase links without a special entitlement; *"In all other storefronts, except for the United States storefront, where this prohibition does not apply, apps and their metadata may not include buttons, external links, or other calls to action that direct customers to purchasing mechanisms other than in-app purchase."* [developer.apple.com/app-store/review/guidelines](https://developer.apple.com/app-store/review/guidelines/) A user in the target market would see the target-market storefront, not the US one, so this exception is not expected to apply to arreglao's actual users even though it changes the US picture.

**Conclusion:** on iOS, unlocking credits/subscription functionality inside the app requires Apple's In-App Purchase (StoreKit) — this is Apple's own stated rule, independent of payment method.

### 0.2 Google Play — Play Billing policy

Google Play's own policy center states, verbatim:

> "Play-distributed apps requiring or accepting payment for access to in-app features or services, including any app functionality, digital content or goods (collectively 'in-app purchases'), must use Google Play's billing system for those transactions unless Section 3, 8, or 9 applies."

[support.google.com/googleplay/android-developer/answer/9858738](https://support.google.com/googleplay/android-developer/answer/9858738)

The policy explicitly lists **virtual currencies** and **subscription services** as required categories, and separately restricts virtual currency use: *"In-app virtual currencies must only be used within the app or game title for which they were purchased."* The main carve-out is **physical goods and physical services** (groceries, transportation, cleaning, gym memberships, food delivery, event tickets) plus certain peer-to-peer payment and auction cases — again, none of which plausibly cover arreglao's credits/subscription (which are payments to arreglao for app functionality, not for a physical good/service or a peer-to-peer transfer).

**Conclusion:** on Android, the same purchase requires Google Play's own billing system, again independent of payment method.

### 0.3 What this means for the "Apple Pay / Google Pay only" constraint

There are two different things the product ask could map to, and they are easy to conflate:

1. **Apple Pay (PassKit) / Google Pay (Google Pay API) presented inside a normal checkout** built by arreglao and processed by a third-party PSP (Stripe, dLocal, etc.). These are tokenized wallet payment methods — the merchant/PSP never sees or stores the raw card number, which inherently satisfies "don't save credit cards." **But per §0.1/§0.2 above, this whole category of "our own checkout for digital in-app functionality" is against store policy on both platforms**, regardless of whether the checkout happens to use Apple Pay/Google Pay or a raw card form.
2. **Apple's In-App Purchase (StoreKit) / Google Play Billing** — the store-mandated system for exactly this purchase. It also never exposes card data to arreglao (Apple/Google own the entire billing relationship), so it satisfies "don't save credit cards" too, **by construction, independent of whether the underlying funding method on the user's Apple ID/Google Account happens to be a card, Apple Pay balance, gift balance, or carrier billing.** IAP is not "Apple Pay" and Play Billing is not "Google Pay" — they are separate, store-owned systems that happen to also avoid the app touching card data.

Given §0.1 and §0.2, **option 1 is not available for this specific purchase on either platform**, which makes option 2 (IAP/Play Billing) the load-bearing answer to this whole document, ahead of any third-party processor's technical merits. Provider-level findings below are still valuable — as a complete map of the pay-in landscape, as color on the "why not just use a processor" question, and in case product scope ever expands to something IAP's carve-outs would cover — but none of them changes the §0 conclusion.

---

## 1. Global processors

### 1.1 Stripe

**Business/merchant account country.** Re-confirmed: Stripe's own global-availability page does not list any of the seven candidate countries as a country where a business can register a Stripe account. [stripe.com/global](https://stripe.com/global)

**But this is a *merchant-registration* restriction, not necessarily a *cardholder* restriction.** Stripe's own developer content states that once a business is registered in a supported country, it can accept payments from customers in many other countries: *"Businesses in Stripe-supported countries can accept payments from customers in 195+ countries."* [stripe.com/resources/more/how-to-accept-international-payments](https://stripe.com/resources/more/how-to-accept-international-payments) Stripe's list of prohibited jurisdictions (for either side of a transaction) is narrow and does not include any candidate country: *"Persons located in, resident in, or a citizen of, or products or services originating from jurisdictions that Stripe has determined ... to be prohibited, including, Cuba, Iran, North Korea, and Syria, and the Crimea, Donetsk, and Luhansk regions."* [stripe.com/en-mx/legal/restricted-businesses](https://stripe.com/en-mx/legal/restricted-businesses) So in principle, a business entity registered in a Stripe-supported country (e.g. the US) could accept international Visa/Mastercard payments from a cardholder in any of the seven candidate countries. This document does not name or assume which country arreglao would register in — only that it would need to be a Stripe-supported one.

**Apple Pay via Stripe — explicit digital-goods block outside the US/EEA.** This is the decisive Stripe-specific finding. Stripe's own Apple Pay integration page states, verbatim (translated from the fetched French-locale page; the English original carries the same content at the same URL path):

> "For digital products, content and subscriptions sold in the United States or the European Economic Area (EEA), your application can accept Apple Pay by redirecting to an external payment page. You can use the following payment UIs: Stripe Checkout, Web Elements, Payment Links... **In other regions, your application cannot accept Apple Pay for digital products, content, or subscriptions.**"

[docs.stripe.com/apple-pay](https://docs.stripe.com/apple-pay?platform=react-native)

None of the seven candidate countries are the US or in the EEA. Read together with §0, this means: even setting aside the App Store's own Guideline 3.1.1 ban on non-IAP checkouts for digital goods, **Stripe's own platform will not let an app accept Apple Pay for a digital-goods/subscription purchase from a customer in the target market at all** — not even via the hosted-checkout workaround that's permitted in the US/EEA.

**Google Pay via Stripe — same underlying restriction, sourced from Google's own terms.** Stripe's Google Pay doc states the parallel rule for Android: *"For digital products, content and subscriptions sold in the United States or the European Economic Area (EEA), your Android app can accept payments directly in-app via a third-party payment provider such as Stripe,"* and points to Google Play's Developer Terms of Service to determine which purchases must use Play Billing. [docs.stripe.com/google-pay](https://docs.stripe.com/google-pay?platform=react-native) Outside the US/EEA, Google's own Play Billing policy (§0.2) already mandates Play Billing for this purchase category regardless of what Stripe's docs additionally say.

**Recurring/subscription billing.** Confirmed strong: Stripe Billing manages the full subscription lifecycle (invoice generation, automatic payment collection/retries, state machine) and Apple Pay/Google Pay properties tables both show "Recurring payments: Yes," including support for iOS 16+ Apple Pay merchant tokens for recurring billing and SetupIntent-based reusable Google Pay payment methods. [docs.stripe.com/billing/subscriptions/overview](https://docs.stripe.com/billing/subscriptions/overview), [docs.stripe.com/apple-pay](https://docs.stripe.com/apple-pay?platform=react-native), [docs.stripe.com/payments/mobile/set-up-future-payments](https://docs.stripe.com/payments/mobile/set-up-future-payments)

**Expo/React Native SDK.** Confirmed strong and official: `@stripe/stripe-react-native` is Stripe's own first-party SDK ([github.com/stripe/stripe-react-native](https://github.com/stripe/stripe-react-native)), documented directly in Expo's own SDK reference with an Expo config plugin (`merchantIdentifier` for iOS, `enableGooglePay` for Android), and Expo's docs are explicit that it requires a development build — *"Google Pay is not supported in Expo Go. To use Google Pay, you must create a development build,"* and the same for Apple Pay. [docs.expo.dev/versions/latest/sdk/stripe](https://docs.expo.dev/versions/latest/sdk/stripe/) This mirrors this repo's own existing MMKV situation (native module → `expo-dev-client` required, no Expo Go), so it fits the project's established pattern.

**PCI/tokenization.** Stripe's own security guide states that "low-risk" integrations (its SDKs/Elements) *"securely collect and transmit payment information directly to Stripe without passing through your servers, which reduces your PCI obligations"* [docs.stripe.com/security/guide](https://docs.stripe.com/security/guide) — consistent with "app never touches raw card data," though this fetch did not surface an explicit "SAQ A" label; treated as **directionally confirmed, not a verbatim SAQ-A citation** (flagged in Could Not Verify).

**Net assessment:** Stripe is the strongest-documented processor by a wide margin on every general capability (RN SDK, subscriptions, PCI posture, Apple Pay/Google Pay support in the abstract) — but its own documentation explicitly disqualifies it for *this exact use case* (Apple Pay/Google Pay, digital in-app goods, non-US/EEA customer), independently confirming §0's conclusion. See the [recommendation](#recommendation) for how this nets out.

### 1.2 PayPal / Braintree

**Pay-in / country presence (re-verified).** PayPal's Payouts country-feature reference (a business-payout API, not consumer checkout, so only loosely indicative here) lists Honduras, Guatemala, El Salvador, Nicaragua, Costa Rica, and Panama with "Send, receive, and withdraw"; Belize does not appear. [developer.paypal.com/docs/payouts/standard/reference/country-feature](https://developer.paypal.com/docs/payouts/standard/reference/country-feature/) Separately, PayPal's own consumer-facing "list of countries and currencies" page exists at `paypal.com/us/webapps/mpp/country-worldwide` but its full country table could not be retrieved in this research (page returned only a title on fetch) — **flagged in Could Not Verify** rather than asserted from the page itself, though secondary evidence (search-indexed excerpts of that same page) suggests Guatemala, Honduras, and Panama appear as supported PayPal markets.

**Native Checkout SDK — gated, not generally available.** PayPal's own developer resources describe a "Native Checkout SDK" for iOS/Android mobile apps [developer.paypal.com/sdk/in-app](https://developer.paypal.com/sdk/in-app/), but per PayPal's own developer content this SDK *"is currently only available for select customers and requires PayPal approval"* (contact via `native-checkout@paypal.com`) — i.e. it is not a self-serve, generally-available mobile SDK the way Stripe's is.

**Braintree (PayPal-owned) — recurring billing confirmed, no official RN SDK.** Braintree's own docs list "Recurring Billing" as a supported capability [developer.paypal.com/braintree/docs/guides/recurring-billing/overview](https://developer.paypal.com/braintree/docs/guides/recurring-billing/overview/), and Braintree has official native iOS and Android SDKs, but **no official React Native SDK was found** — the React Native packages that exist (`react-native-braintree-dropin-ui`, `react-native-expo-braintree`, `react-native-paypal`) are third-party/community-maintained wrappers around the native SDKs, not first-party PayPal/Braintree products.

**Apple Pay / Google Pay via PayPal.** PayPal does document Apple Pay and Google Pay as *additional funding sources presentable through a PayPal-hosted checkout* (e.g. `developer.paypal.com/docs/checkout/apm/google-pay`), with device/browser prerequisites (Apple Pay needs Safari on iOS/macOS; Google Pay needs Chrome and a saved card) — these integration guides are framed around **web** checkout, not the gated Native Checkout SDK specifically, so their applicability to an Expo mobile app is unconfirmed.

**Net assessment:** PayPal/Braintree's pay-in country footprint is plausible for most candidates, but the mobile-SDK and Apple Pay/Google Pay-in-a-native-app story is thin and partly access-gated compared to Stripe — and it inherits the exact same §0 problem (a third-party PSP cannot legally be the checkout for in-app digital goods on either platform) regardless of any of this.

### 1.3 dLocal

**Card acceptance (re-verified for Honduras).** dLocal's Honduras payments page confirms card acceptance (Visa, Mastercard, JCB, Amex, Discover, Diners). [docs.dlocal.com/docs/honduras](https://docs.dlocal.com/docs/honduras) The escrow doc's broader country coverage claim (all candidates except Belize appearing in dLocal's country reference) was not independently re-verified per-country in this pass beyond Honduras but is treated as still current absent contrary evidence.

**Google Pay: confirmed as a payment method, country-scope unconfirmed.** dLocal's Plugins & Wallets documentation explicitly lists **Google Pay™** — *"Allows customers to make payments using any card saved to their Google Account"* — with a dedicated integration guide. [docs.dlocal.com/docs/plugins-wallets](https://docs.dlocal.com/docs/plugins-wallets) However, the Honduras country page's own payment-method list does **not** include Google Pay (only the six card brands above) — **Google Pay's actual availability in any of the seven candidate countries specifically could not be confirmed from dLocal's own docs** (flagged in Could Not Verify).

**Apple Pay: not found.** No mention of Apple Pay was found anywhere in dLocal's documentation reviewed in this research (Plugins & Wallets page, Honduras page, or general payment-method docs).

**Recurring billing: token-based, but not an auto-renewing subscription primitive.** dLocal's "Recurring payments" doc describes a **merchant-initiated, token-based** model: after one authorization, the merchant receives a token and then *actively calls the API again* for each subsequent charge — this is not an auto-scheduling subscription engine like Stripe Billing, it is tokenization + manual re-charge, which a platform would have to wrap in its own scheduler to behave like an auto-renewing subscription. [docs.dlocal.com/docs/recurring-payments-smartpix](https://docs.dlocal.com/docs/recurring-payments-smartpix) The only worked example found in the fetched content used Brazil/BRL; candidate-country coverage of this specific recurring feature is unconfirmed.

**Mobile SDK: no true native SDK — WebView bridge only.** dLocal Direct (its card-tokenization product) is explicitly **not a native SDK**. dLocal's own docs describe a WebView-embedded JavaScript SDK bridge pattern for both iOS (`WKWebView` + message handler) and Android (`WebView` + `JavascriptInterface`), and explicitly acknowledge React Native compatibility only via the third-party `react-native-webview` library wrapping this same JS-in-WebView bridge — not a native React Native module. [docs.dlocal.com/docs/native-payment-dlocal-direct](https://docs.dlocal.com/docs/native-payment-dlocal-direct) No Expo-specific guidance was found.

**Net assessment:** dLocal remains a well-documented card-acceptance rail for the region generically, but for *this specific* Apple Pay/Google Pay-only, auto-renewing-subscription requirement it is materially weaker than Stripe on every axis checked (no Apple Pay found at all; Google Pay country-scope unconfirmed; recurring is manual-token, not auto-subscription; integration is a WebView bridge, not a native RN SDK) — and it inherits the same §0 blocker regardless.

### 1.4 EBANX

**Pay-in / regional presence (re-confirmed from the escrow doc).** EBANX's own press room confirms operating/pay-in presence in Costa Rica, El Salvador, Panama, and Guatemala (not Honduras, Nicaragua, or Belize) as of its Central America expansion. [business.ebanx.com — press release](https://business.ebanx.com/en/press-room/press-releases/ebanx-kicks-off-operations-in-central-america-starting-with-costa-rica-el-salvador-panama-guatemala-and-dominican-republic)

**Mobile SDKs exist but are narrow in scope.** EBANX publishes an Android SDK and an iOS SDK on its own GitHub organization. The Android SDK's own description states it *"was created to facilitate the creation of tokens, set the CVV [and view] tokens list already created by the SDK. Other features need to be made from server to server using its integration key"* [github.com/ebanx/android-sdk](https://github.com/ebanx/android-sdk) — i.e. these SDKs handle card **tokenization** only, not a full checkout UI, and are MIT-licensed community-facing repos rather than the kind of first-party product page Stripe maintains. No React Native SDK or Expo guidance was found from EBANX.

**Recurring billing: confirmed as a general EBANX capability, not confirmed for candidate countries.** EBANX documents multiple recurring/subscription primitives — card tokenization for recurring use (*"The token operation is used to create a token for a given credit card to be used for recurring payments. Tokens expire after 14 months of their last use"*), NuPay-Recurrent, Pix Automático (recurring Pix debit), and card-recurring guides — but every country-specific recurring guide found in this research was for **Brazil, India, or South Africa**; none of the fetched EBANX recurring-payments documentation covered Costa Rica, El Salvador, Panama, or Guatemala specifically. [docs.ebanx.com](https://docs.ebanx.com/) (navigation and guide index)

**Apple Pay / Google Pay: not found.** No mention of Apple Pay or Google Pay was found in the EBANX documentation pages reached in this research.

**Net assessment:** EBANX's confirmed pay-in presence in four candidate countries is a real asset, but its mobile SDK story is tokenization-only (no full checkout UI, no RN SDK), no wallet (Apple Pay/Google Pay) support was found anywhere, and recurring billing is unconfirmed for any candidate country specifically — combined with §0, this is one of the weaker candidates for the stated use case.

### 1.5 Adyen, Checkout.com, Mangopay, Wise, Kushki, Rapyd

Not re-researched in depth for pay-in-specific detail in this pass: the escrow document already established that Adyen and Mangopay's onboarding-country lists exclude all seven candidates (Adyen: *"You can onboard users operating in any of the following countries and regions"* — no Central American country listed; Mangopay: EEA/UK-only company registration requirement) in a way that (unlike Stripe) is not obviously worked around by a foreign-registered merchant entity, since Adyen for Platforms' "onboard users" language is about the *platform's own* onboarding, not just payees. Checkout.com's coverage remained unconfirmed (its supported-countries page still 403'd in this pass, consistent with the escrow doc). Wise has no consumer-facing checkout/card-acceptance product at all — irrelevant to pay-in. Kushki's own docs still list only Chile/Colombia/Ecuador/Mexico/Peru as supported countries, no Central American country. Rapyd's detailed docs remain portal-gated. None of these were re-verified for Apple Pay/Google Pay or Expo-SDK specifics in this pass — treat as **not researched for pay-in** rather than disqualified, and see Could Not Verify.

---

## 2. Regional / local processors and wallets

### 2.1 Wompi (Panama entity, operated by Banistmo)

**Card acceptance (re-confirmed from escrow doc).** Cards (Visa/Mastercard) and Clave (Telered's Panamanian card system) are confirmed for Panama. [docs.wompi.co/en/docs/panama/metodos-de-pago](https://docs.wompi.co/en/docs/panama/metodos-de-pago/) *(this specific URL 403'd on direct fetch in this pass but is the same URL cited and reachable in the prior escrow research; treated as still current.)*

**Recurring billing: confirmed at the API level (Colombia-documented, Panama-inheritance unconfirmed).** Wompi's payment-sources/tokenization documentation describes a `payment_source` + 3D-Secure-once model: after the first 3DS-authenticated transaction using a stored `payment_source`, subsequent charges *"will not require additional customer interaction."* This is described primarily in the Colombia section of Wompi's docs; whether the same subscription/tokenization capability is live on the Panama entity's API specifically was **not confirmed** in this pass (Panama-specific subscription pages returned HTTP 403, consistent with the escrow doc's experience).

**Mobile SDK: not found.** Wompi documents a JS library (`docs.wompi.co/.../js/`) for web integration and consumer/merchant mobile *apps* (its own Wompi app on the App Store/Play Store), but **no embeddable mobile SDK for a third-party app was found** — integration for a marketplace app like arreglao would be via Wompi's REST API directly, not a native or React Native SDK.

**Apple Pay / Google Pay: not found.** No mention of Apple Pay or Google Pay support was found in any Wompi documentation reached in this research.

**Net assessment:** Wompi is a real card-acceptance option for Panama specifically, but has no confirmed mobile SDK and no confirmed Apple Pay/Google Pay support — combined with §0, not a fit for this use case as specified.

### 2.2 Yappy (Panama, Banco General) — disqualified for this specific ask

Yappy is Banco General's own consumer/merchant mobile wallet, identified by phone number, with a web/API "Botón de Pago" (Payment Button) for merchants — described in Yappy's own materials as usable via custom PHP/Node.js/.NET server integration or through e-commerce platform plugins (WooCommerce, Shopify, Magento, etc., some via the partner Tilopay). No native mobile SDK for embedding Yappy checkout inside a third-party app was found, and no recurring/subscription capability was found in Yappy's own materials.

Critically, **Yappy is not built on the Apple Pay / Google Pay rails at all** — it is Banco General's own proprietary wallet product, separate from (and not a superset of) the bank's *separate* Apple Pay and Google Pay card-linking support (Banco General does support linking its cards to Apple Pay and Google Pay generally, per its own site, but that is a different product from the Yappy "Botón de Pago" merchant API). Given the product's Apple Pay/Google Pay-only constraint, **Yappy does not qualify** regardless of its Panama-only pay-in strength noted in the escrow doc.

---

## 3. Apple Pay / Google Pay availability in the target market — a prerequisite check

Before any processor question, it's worth confirming Apple Pay and Google Pay are actually *available to consumers* in the candidate countries at all, since a wallet-only constraint is moot where the wallet itself doesn't operate.

**Google Wallet (Google Pay's current name — Google Pay as a standalone consumer app was sunset and folded into Google Wallet):** confirmed present, per-country, via Google's own "Find supported payment methods" pages, for six of seven candidates:

| Candidate country label | Google Wallet supported? | Source |
|---|---|---|
| Candidate A | Yes — bank/card table shown | [support.google.com/wallet/answer/12059326?co=GENIE.CountryCode=CR](https://support.google.com/wallet/answer/12059326?hl=en&co=GENIE.CountryCode%3DCR) |
| Candidate B | Yes — bank/card table shown | [...co=GENIE.CountryCode=GT](https://support.google.com/wallet/answer/12059326?hl=en&co=GENIE.CountryCode%3DGT) |
| Candidate C | Yes — bank/card table shown | [...co=GENIE.CountryCode=HN](https://support.google.com/wallet/answer/12059326?hl=en&co=GENIE.CountryCode%3DHN) |
| Candidate D | Yes — bank/card table shown | [...co=GENIE.CountryCode=NI](https://support.google.com/wallet/answer/12059326?hl=en&co=GENIE.CountryCode%3DNI) |
| Candidate E | Yes — bank/card table shown | [...co=GENIE.CountryCode=PA](https://support.google.com/wallet/answer/12059326?hl=en&co=GENIE.CountryCode%3DPA) |
| Candidate F | Yes — bank/card table shown | [...co=GENIE.CountryCode=SV](https://support.google.com/wallet/answer/12059326?hl=en&co=GENIE.CountryCode%3DSV) |
| Candidate G (lower priority) | **No** — page states *"If you can't find your country, there are no supported payment methods yet in your country"* and only shows US content | [...co=GENIE.CountryCode=BZ](https://support.google.com/wallet/answer/12059326?hl=en&co=GENIE.CountryCode%3DBZ) |

**Apple Pay:** per Apple's own "participating banks" reference pages, confirmed present for five of seven candidates (Costa Rica, El Salvador, Guatemala, Honduras, Panama all appear with named participating banks, e.g. Costa Rica lists Banco Promerica de Costa Rica, Credomatic de Costa Rica, Scotiabank de Costa Rica), and **not found** for the other two (no Nicaragua section found on Apple's participating-banks page; Belize not found either). [support.apple.com/en-us/109524 — Apple Pay participating banks in Canada, Latin America, and the United States](https://support.apple.com/en-us/109524)

**Implication:** if the product ends up in a candidate country where Apple Pay isn't available at all (the research suggests this could be true for two of the seven), Apple Pay-specific flows are moot there on *any* platform (Stripe, IAP, or otherwise) — but Google Wallet is available in six of seven, and critically, **IAP does not depend on Apple Pay/Google Pay availability at all**, since it draws on whatever payment method (which can be a plain card) is configured on the user's Apple ID / Google Account. This is a further point in IAP's favor for a market where wallet coverage is inconsistent.

---

## Recommendation

**Given the constraints as specified — Apple Pay/Google Pay only, no stored cards, for a purchase that is squarely "digital content/functionality unlocked inside the app," in a market outside the US/EEA — the evidence from primary sources points to a clear answer that is not "pick a processor":**

1. **Both Apple's and Google's own store policies (§0) require their own in-app purchase system (StoreKit / Google Play Billing) for this exact purchase shape** — credits and an auto-renewing subscription that unlock in-app functionality — independent of which payment method would otherwise be used. No exception in either policy (physical goods, real-time person-to-person services, reader apps, etc.) plausibly covers this purchase, especially now that there is no in-app payment between poster and worker at all in this product's current scope.
2. **This conclusion is independently corroborated by Stripe's own documentation**, the strongest third-party candidate on every other axis: Stripe's Apple Pay integration docs state outright that *"in other regions [outside the US/EEA], your application cannot accept Apple Pay for digital products, content, or subscriptions"* — Stripe itself will not let this exact flow be built outside the US/EEA, wallet-only or not. Google Pay via Stripe carries the same restriction by reference to Google Play's own Developer Terms.
3. Therefore: **In-App Purchase (StoreKit on iOS, Google Play Billing on Android) should be the primary — effectively only viable — channel** for the $3/$6.50/$9 credit packages and the $30/month "Unlimited" subscription, as specified in this ticket. A cross-platform wrapper SDK such as RevenueCat's `react-native-purchases` is worth evaluating for implementation ergonomics: it *"provides a backend and SDKs that wrap StoreKit, Google Play Billing, the Amazon Appstore, the Samsung Galaxy Store, and RevenueCat Billing,"* is documented for Expo directly, and (like Stripe's RN SDK and this repo's existing MMKV dependency) is a native module requiring a development build rather than Expo Go. [revenuecat.com/docs/getting-started/installation/reactnative](https://www.revenuecat.com/docs/getting-started/installation/reactnative)
4. **A third-party processor's Apple Pay/Google Pay integration (Stripe being the best-documented of the group researched) is not a viable *alternative* to IAP for this specific purchase** — it would place the app in violation of both App Store Guideline 3.1.1 and Google Play's Billing policy, and in Stripe's case the platform's own Apple Pay product would refuse to serve the flow outside the US/EEA regardless. A third-party processor only becomes relevant again if the product later adds something IAP's own carve-outs would cover (e.g. a real-world/physical service payment, which is explicitly outside this document's now-confirmed scope) — or a **separate web-based purchase channel** (e.g. buying credits from a companion website rather than inside the mobile app), which is a distinct question from what this ticket asked.
5. If IAP is adopted, note two of its own primary-source constraints worth carrying into implementation planning (not blocking, but relevant): Apple requires *"any credits or in-game currencies purchased via in-app purchase may not expire"* and a restore mechanism for restorable purchases; and Google's policy restricts virtual currencies to *"only be used within the app ... for which they were purchased."*

**Strongest candidates, ranked, if IAP were somehow not usable (kept for completeness, not as the primary recommendation):** Stripe first (best RN SDK, best-documented subscriptions engine, only provider with an unambiguous "merchant country ≠ cardholder country" pay-in argument grounded in its own docs) — but explicitly *not* for the Apple Pay/Google Pay-only, non-US/EEA digital-goods case per finding 2 above; dLocal and EBANX second-tier (real regional pay-in presence, but no confirmed Apple Pay support, no confirmed auto-renewing subscription primitive for the candidate countries, and no true native mobile SDK).

---

## Could not verify

- **PCI SAQ-A classification for Stripe's SDK-based tokenization** — Stripe's security guide confirms low-risk integrations reduce PCI obligations by not routing card data through the merchant's servers, but this research did not surface a page explicitly stating "SAQ A" applies to the mobile SDK flow specifically.
- **dLocal Google Pay — which candidate countries actually support it.** Confirmed as a dLocal payment method generically (Plugins & Wallets doc), but not present in the Honduras country page's payment-method list, and no country-by-country Google Pay coverage list was found.
- **dLocal recurring payments — candidate-country coverage.** The only worked example found used Brazil/BRL; whether the SmartPix/wallet-token recurring flow (or any recurring flow) is live for any of the seven candidates was not confirmed.
- **EBANX recurring billing — candidate-country coverage.** EBANX documents multiple recurring primitives, but every country-specific recurring guide found was for Brazil, India, or South Africa; Costa Rica/El Salvador/Panama/Guatemala coverage of any recurring feature is unconfirmed.
- **Wompi Panama entity — subscription/recurring API availability.** Confirmed at the API/docs level for the Colombia entity; Panama-specific subscription pages returned HTTP 403 in this research, so whether the same capability is live on the Panama entity is unconfirmed (as in the escrow doc's experience with the same pages).
- **PayPal's consumer country-availability list (`paypal.com/us/webapps/mpp/country-worldwide`)** — the full country table on this page could not be retrieved (fetch returned only the page title); candidate-country presence is inferred from secondary/search-indexed content, not a direct primary-source read of the table itself.
- **PayPal Apple Pay/Google Pay integration inside the gated Native Checkout mobile SDK** — PayPal documents Apple Pay/Google Pay as funding sources for its **web** checkout; whether the same applies inside the approval-gated Native Checkout SDK for mobile apps was not confirmed.
- **Adyen, Checkout.com, Mangopay, Wise, Kushki, Rapyd** — not re-researched for pay-in-specific detail (Apple Pay/Google Pay support, RN SDK, recurring billing) in this pass; only their escrow-doc-era onboarding-country status was carried forward. Checkout.com's supported-countries page again returned HTTP 403.
- **Apple Pay in the two lower-confidence candidate countries.** Apple's own participating-banks reference page did not show a Nicaragua section in the content reached, and did not show Belize; this was corroborated by a second search pass but the full page could not be fetched without truncation, so absence is inferred rather than a verbatim "not supported" statement from Apple.
- **Whether Belize (lowest-priority candidate) has *any* Apple Pay or Google Pay coverage.** Both wallets' own per-country pages indicate no support; treated as a probable disqualifier for Belize specifically under the wallet-only constraint, but not independently corroborated by a second source.
