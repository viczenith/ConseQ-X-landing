import hashlib
import random
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional, Tuple

CANONICAL_SYSTEMS: List[str] = [
    "interdependency",
    "orchestration",
    "investigation",
    "interpretation",
    "illustration",
    "inlignment",
]


def normalize_system_key(system_key: str | None) -> str:
    if not system_key:
        return "investigation"
    k = str(system_key).strip().lower()

    legacy_to_canonical = {
        "dependency": "interdependency",
        "dependencies": "interdependency",
        "analysis": "investigation",
        "research": "investigation",
        "insights": "interpretation",
        "reporting": "illustration",
        "visualization": "illustration",
        "coordination": "inlignment",
        "strategy": "inlignment",
        "alignment": "inlignment",
        "inlign": "inlignment",
    }
    return legacy_to_canonical.get(k, k)


def _clip100(x: float) -> float:
    if not (x == x) or x in (float("inf"), float("-inf")):
        return 0.0
    return max(0.0, min(100.0, x))


def _clip01(x: float) -> float:
    if not (x == x) or x in (float("inf"), float("-inf")):
        return 0.0
    return max(0.0, min(1.0, x))


def normalize_metric(value: Any) -> Optional[int]:
    if value is None:
        return None
    try:
        n = float(value)
    except (TypeError, ValueError):
        return None
    if n != n or n in (float("inf"), float("-inf")):
        return None
    if 0.0 <= n <= 1.0:
        return int(round(n * 100))
    return int(round(_clip100(n)))


def score_system(
    metrics: Dict[str, Any] | None = None,
    weights: Dict[str, Any] | None = None,
    required_metrics: Optional[Iterable[str]] = None,
) -> Dict[str, Any]:
    metrics = metrics or {}
    weights = weights or {}

    keys = list(metrics.keys())
    if not keys:
        return {"score": 0, "coverage": 0, "inputMetrics": {}, "rationale": {"top": [], "text": "No data"}}

    norm: Dict[str, int] = {}
    for k in keys:
        v = normalize_metric(metrics.get(k))
        if v is not None:
            norm[k] = v

    used_keys = list(norm.keys())
    if not used_keys:
        return {"score": 0, "coverage": 0, "inputMetrics": {}, "rationale": {"top": [], "text": "No valid metrics"}}

    if required_metrics:
        req = list(required_metrics)
        present = len([k for k in req if norm.get(k) is not None])
        coverage = present / len(req) if req else 0
    else:
        present = len(used_keys)
        total = len(keys)
        coverage = present / total if total else 0

    w: Dict[str, float] = {}
    wsum = 0.0
    for k in used_keys:
        wk_raw = weights.get(k, 1)
        try:
            wk = float(wk_raw)
        except (TypeError, ValueError):
            wk = 1.0
        w[k] = wk
        wsum += wk

    if wsum <= 0:
        for k in used_keys:
            w[k] = 1.0
        wsum = float(len(used_keys))

    acc = 0.0
    for k in used_keys:
        acc += float(norm.get(k, 0)) * float(w.get(k, 0.0))
    mean = acc / wsum if wsum else 0.0

    score = int(round(_clip100(mean)))

    contribs = sorted(
        [{"key": k, "value": norm[k], "weighted": float(norm[k]) * float(w.get(k, 1.0))} for k in used_keys],
        key=lambda x: x["weighted"],
        reverse=True,
    )
    top = contribs[:2]
    if top:
        parts = [f"{t['key']} ({t['value']})" for t in top]
        text = f"Top drivers: {', '.join(parts)}"
    else:
        text = "No strong drivers"

    return {"score": score, "coverage": coverage, "inputMetrics": norm, "rationale": {"top": top, "text": text}}


def compute_org_health(system_scores: List[Dict[str, Any]] | None = None, system_weights: Dict[str, Any] | None = None) -> Dict[str, Any]:
    system_scores = system_scores or []
    system_weights = system_weights or {}
    if not system_scores:
        return {"orgHealth": 0, "confidence": 0, "breakdown": []}

    acc = 0.0
    wsum = 0.0
    breakdown = []

    for row in system_scores:
        key = normalize_system_key(row.get("key"))
        score = float(row.get("score") or 0)
        coverage = float(row.get("coverage") or 0)
        w_raw = system_weights.get(key, 1)
        try:
            w = float(w_raw)
        except (TypeError, ValueError):
            w = 1.0

        acc += score * w
        wsum += w
        breakdown.append({"key": key, "score": _clip100(score), "coverage": _clip01(coverage)})

    if wsum <= 0:
        wsum = float(len(system_scores))

    org_health = int(round(_clip100(acc / wsum)))
    coverage_avg = sum([b["coverage"] for b in breakdown]) / len(breakdown) if breakdown else 0.0
    confidence = min(1.0, 0.5 + 0.5 * coverage_avg)

    return {"orgHealth": org_health, "confidence": round(confidence, 3), "breakdown": breakdown}


def analyze_filename_or_text(name_or_text: str) -> List[str]:
    lowered = (name_or_text or "").lower()
    found = set()

    for k in CANONICAL_SYSTEMS:
        if k in lowered:
            found.add(k)
        if k == "inlignment" and ("alignment" in lowered or "inlign" in lowered):
            found.add("inlignment")
        if k == "investigation" and "investig" in lowered:
            found.add("investigation")

    if not found:
        # pick two deterministically from the text
        h = int(hashlib.md5(lowered.encode("utf-8")).hexdigest(), 16)
        idx1 = h % len(CANONICAL_SYSTEMS)
        idx2 = (h // 7) % len(CANONICAL_SYSTEMS)
        if idx2 == idx1:
            idx2 = (idx2 + 1) % len(CANONICAL_SYSTEMS)
        found.add(CANONICAL_SYSTEMS[idx1])
        found.add(CANONICAL_SYSTEMS[idx2])

    return list(found)


def make_series(base: int, days: int = 7) -> List[Dict[str, Any]]:
    arr = []
    now = int(time.time() * 1000)
    for i in range(days - 1, -1, -1):
        ts = now - i * 24 * 3600 * 1000
        v = max(5, min(95, base + int((random.random() - 0.5) * 8)))
        conf = int(2 + random.random() * 6)
        arr.append({"ts": ts, "value": v, "upper": min(100, v + conf), "lower": max(0, v - conf)})
    return arr


def deterministic_system_metrics(org_seed: str, system_id: str) -> Dict[str, int]:
    seed = f"{org_seed}::{system_id}".encode("utf-8")
    h = int(hashlib.md5(seed).hexdigest(), 16)
    m1 = 55 + (h % 41)
    m2 = 50 + ((h >> 3) % 46)
    m3 = 45 + ((h >> 5) % 50)
    m4 = 40 + ((h >> 7) % 55)
    return {"throughput": m1, "cycle_time": m2, "quality": m3, "predictability": m4}
