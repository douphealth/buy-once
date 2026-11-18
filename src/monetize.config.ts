// Partner / affiliate slots. A slot stays invisible until its url is set.
// Add your tracking link to "url" (and the programme name to "partner"), commit, push: Cloudflare deploys it.
// Per-item links (e.g. one product page per device) go in OFFER_LINKS keyed by item slug; they override the slot url.
export type OfferSlotId = "device-price";
export type OfferSlot = { heading: string; body: string; cta: string; url: string; partner: string };

export const OFFER_SLOTS: Record<OfferSlotId, OfferSlot> = {
  "device-price": { heading: "Check the current price of the {context}", body: "Prices change often. Confirm what is in the box and whether storage is included.", cta: "Check price", url: "", partner: "" },
};

export const OFFER_LINKS: Record<string, string> = {};
