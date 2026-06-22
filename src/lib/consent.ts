// ===========================================================================
// Single source of truth for the legal-document version users consent to.
//
// Every consent_log row (terms / privacy / marketing) is stamped with this
// version + a timestamp (ADR-3, append-only). Bump this string whenever the
// Terms or Privacy Policy changes so re-acceptance is auditable and we can
// tell who agreed to which revision. Referenced everywhere — never inline it.
// ===========================================================================

export const CONSENT_VERSION = "2026-06-01";
