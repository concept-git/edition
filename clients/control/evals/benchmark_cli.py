"""Compare installed CLIs using interleaved fresh processes on one JDK.

Only offline discovery and local previews run. The configured origin is never contacted.
Filesystem caches are warm; each timed invocation starts a new shell/JVM process.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import random
import statistics
import subprocess
import tempfile
import time


CASES = {
    "version": (["--version"], 0),
    "root_help": (["--help"], 0),
    "method_help": (["control", "tenants", "stats", "get", "--help"], 0),
    "schema_brief": (["schema", "control.tenants.stats.get", "--brief"], 0),
    "schema_type": (["schema", "control.Usage", "--brief", "--resolve-refs"], 0),
    "valid_preview": (["control", "tenants", "stats", "get", "--params",
                       '{"id":"00000000-0000-0000-0000-000000000001"}', "--dry-run"], 0),
    "invalid_preview": (["control", "tenants", "stats", "get", "--params",
                         '{"id":"bad-id"}', "--dry-run"], 3),
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def distribution(path):
    jars = [{"name": jar.name, "bytes": jar.stat().st_size, "sha256": digest(jar.read_bytes())}
            for jar in sorted((path / "lib").glob("*.jar"))]
    return {"path": str(path), "jars": jars, "jarBytes": sum(jar["bytes"] for jar in jars),
            "launcherSha256": digest((path / "bin/spacectl").read_bytes())}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", type=Path, required=True)
    parser.add_argument("--candidate", type=Path, required=True)
    parser.add_argument("--reference", type=Path, help="Optional third distribution, such as untrimmed dependencies")
    parser.add_argument("--java-home", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--samples", type=int, default=30)
    parser.add_argument("--warmup", type=int, default=3)
    parser.add_argument("--seed", type=int, default=20261023)
    args = parser.parse_args()
    if args.samples < 10 or args.warmup < 1:
        parser.error("Use at least 10 samples and one warmup per candidate and case.")
    paths = {"baseline": args.baseline.resolve(), "candidate": args.candidate.resolve()}
    if args.reference:
        paths["reference"] = args.reference.resolve()
    java_home = args.java_home.resolve()
    args.output.mkdir(parents=True, exist_ok=True)
    output = args.output.resolve()
    rng = random.Random(args.seed)
    rows = []
    manifests = {name: distribution(path) for name, path in paths.items()}
    java_version = subprocess.run([str(java_home / "bin/java"), "-version"],
                                  capture_output=True, text=True, check=True).stderr
    with tempfile.TemporaryDirectory(prefix="spacectl-benchmark-") as temp:
        work = Path(temp)
        environments = {}
        for name, path in paths.items():
            env = {key: os.environ[key] for key in ("PATH", "LANG", "LC_ALL", "TMPDIR") if key in os.environ}
            env.update(JAVA_HOME=str(java_home), SPACECTL_HOME=str(work / name))
            environments[name] = env
            configured = subprocess.run([str(path / "bin/spacectl"), "configure", "--base-url",
                                         "http://127.0.0.1:1", "--allow-http-loopback",
                                         "--token-env", "BENCHMARK_UNUSED_PAT"], cwd=work,
                                        env=env, capture_output=True, timeout=20)
            if configured.returncode:
                raise RuntimeError(f"{name}: isolated configuration failed")

        def run(name, case, timed, iteration):
            argv, expected = CASES[case]
            start = time.perf_counter_ns()
            completed = subprocess.run([str(paths[name] / "bin/spacectl"), *argv], cwd=work,
                                       env=environments[name], input=b"", capture_output=True, timeout=20)
            elapsed = (time.perf_counter_ns() - start) / 1_000_000
            if completed.returncode != expected:
                raise RuntimeError(f"{name}/{case}: unexpected exit {completed.returncode}")
            if case.startswith("schema") or case.endswith("preview"):
                value = json.loads(completed.stdout)
                if case == "valid_preview" and value.get("dry_run") is not True:
                    raise RuntimeError("Preview did not produce a local plan")
                if case == "invalid_preview" and value.get("error", {}).get("reason") != "invalid_input":
                    raise RuntimeError("Invalid input was not locally refused")
            if timed:
                row = {"arm": name, "case": case, "iteration": iteration, "elapsedMs": elapsed,
                       "exit": completed.returncode, "stdoutBytes": len(completed.stdout),
                       "stderrBytes": len(completed.stderr), "stdoutSha256": digest(completed.stdout),
                       "stderrSha256": digest(completed.stderr)}
                rows.append(row)
                with (output / "samples.jsonl").open("a") as stream:
                    stream.write(json.dumps(row) + "\n")

        # Start a fresh output log; partial runs remain inspectable on failure.
        (output / "samples.jsonl").write_text("")
        for iteration in range(-args.warmup, args.samples):
            cases = list(CASES)
            rng.shuffle(cases)
            for case in cases:
                order = list(paths)
                shift = iteration % len(order)
                order = order[shift:] + order[:shift]
                if (iteration // len(order)) % 2:
                    order.reverse()
                for name in order:
                    run(name, case, iteration >= 0, iteration)
        states = {}
        for name in paths:
            states[name] = sorted(str(p.relative_to(work / name)) for p in (work / name).rglob("*") if p.is_file())
            if any("journal" in p or "invocations" in p for p in states[name]):
                raise RuntimeError("Local-only benchmark created recovery state")

    summaries = {}
    for case in CASES:
        arms = {}
        for name in paths:
            values = sorted(row["elapsedMs"] for row in rows if row["case"] == case and row["arm"] == name)
            arms[name] = {"n": len(values), "medianMs": statistics.median(values),
                          "p95Ms": values[max(0, (95 * len(values) + 99) // 100 - 1)],
                          "minMs": min(values), "maxMs": max(values)}
        arms["medianChangePct"] = (arms["candidate"]["medianMs"] / arms["baseline"]["medianMs"] - 1) * 100
        if "reference" in paths:
            arms["candidateVsReferencePct"] = (arms["candidate"]["medianMs"] / arms["reference"]["medianMs"] - 1) * 100
        summaries[case] = arms
    report = {"method": "Serial interleaved fresh launcher/JVM processes; warm filesystem caches; offline only",
              "javaVersion": java_version, "platform": platform.platform(), "machine": platform.machine(),
              "samplesPerArmPerCase": args.samples, "warmupPerArmPerCase": args.warmup,
              "seed": args.seed, "cases": {key: argv for key, (argv, _) in CASES.items()},
              "distributions": manifests, "stateFiles": states, "results": summaries,
              "limits": "One host/session; no cold disk, network, provider-token cost or steady-state JVM claim."}
    (output / "summary.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"samples": len(rows), "results": summaries}, indent=2))


if __name__ == "__main__":
    main()
