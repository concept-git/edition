package io.edition.delivery.contract;

/** One immutable part of a complete search generation; unchanged parts are reused. */
public record SearchSegment(String indexUid, String fingerprint) {}
