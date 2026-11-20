#!/usr/bin/env python3
"""Build deterministic, synthetic IPD acceptance packages from checked-in fixtures.

ipd-codearts-reference.zip ALL_META is a 2026-09-17 transcription of
https://support.huaweicloud.com/productdesc-codeartsagent/ALL_META.TXT.json
from a user-opened page (format only). CLASS and HTML are synthetic; the original CLASS was not obtained.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

PACKS = Path(__file__).resolve().parent
ROOT = next(path for path in PACKS.parents if (path / "CONTEXT.md").exists())
FIXTURE = PACKS / "F-ipd-tolerant"
GENERATOR = "python3 backend/libraries/import-format/src/testFixtures/resources/import-packs/generate-ipd-tolerance.py"


def encode(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "backend/apps/control/build/import-packs")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    source = {p.relative_to(FIXTURE).as_posix(): p.read_bytes() for p in sorted(FIXTURE.rglob("*")) if p.is_file()}
    meta = json.loads(source["ALL_META.TXT.json"])
    klass = json.loads(source["CLASS.TXT.json"])
    variants = {}

    def add(name, expected, metadata=None, directory=None, omit=None):
        files = dict(source)
        files["ALL_META.TXT.json"] = encode(meta if metadata is None else metadata)
        files["CLASS.TXT.json"] = encode(klass if directory is None else directory)
        if omit:
            del files[omit]
        variants[name] = (expected, files)

    add("valid", "adapted")
    renumbered = json.loads(json.dumps(klass).replace("100", "900").replace("110", "910"))
    add("renumbered", "adapted", directory=renumbered)
    missing = copy.deepcopy(klass)
    missing[1]["p_code"] = "missing"
    add("missing-parent", "invalid", directory=missing)
    duplicate = copy.deepcopy(klass)
    duplicate[-1]["code"] = "100"
    add("duplicate-code", "invalid", directory=duplicate)
    cyclic = copy.deepcopy(klass)
    cyclic[0]["p_code"] = "120"
    add("cycle", "invalid", directory=cyclic)
    conflict = copy.deepcopy(meta)
    conflict[2]["des"] = "冲突的描述"
    add("conflicting-meta", "invalid", metadata=conflict)
    add("missing-html", "invalid", omit="intro.html")
    ambiguous = copy.deepcopy(meta)
    ambiguous[-1]["uri"] = "same.html"
    add("ambiguous-uri", "invalid", metadata=ambiguous)
    blank = copy.deepcopy(meta)
    blank[1]["uri"] = ""
    add("blank-uri", "invalid", metadata=blank)
    long_title = copy.deepcopy(meta)
    long_title[4]["title"] = "长" * 201
    add("long-title", "invalid", metadata=long_title)
    deep = [{"code": n, "p_code": "" if n == 1 else n - 1} for n in range(1, 9)]
    add("too-deep", "invalid", directory=deep)

    reference = PACKS / "F-ipd-codearts-reference"
    variants["codearts-reference"] = ("adapted", {
        p.relative_to(reference).as_posix(): p.read_bytes()
        for p in sorted(reference.rglob("*")) if p.is_file()
    })
    add("empty", "invalid", metadata=[{"dockw": "产品介绍"}], directory=[])
    add("missing-link", "invalid")
    variants["missing-link"][1]["intro.html"] = b"<a href='missing.html'>broken</a>"
    cases = []
    for name, (expected, files) in variants.items():
        target = args.output / f"ipd-{name}.zip"
        with ZipFile(target, "w", compression=ZIP_DEFLATED) as archive:
            for filename, data in sorted(files.items()):
                info = ZipInfo(filename, date_time=(2020, 1, 1, 0, 0, 0))
                info.compress_type = ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                archive.writestr(info, data)
        cases.append({"file": target.name, "expected": expected, "pages": 2 if name == "codearts-reference" else 7, "sha256": hashlib.sha256(target.read_bytes()).hexdigest()})
    (args.output / "cases.json").write_bytes(encode(cases))
    (args.output / "README.md").write_text(f"""# IPD 导入验证包

主测试包为合成数据，并非华为云原始产品文档。
2026-09-17 HTTP 请求返回安全验证 HTML；随后从用户已打开的浏览器页面读取到 ALL_META。
ipd-codearts-reference.zip 的 ALL_META 是该页面 JSON 的内容转录（仅重排格式），
CLASS 和 HTML 为明确标注的合成数据；原 CLASS 未取得。
来源：https://support.huaweicloud.com/productdesc-codeartsagent/ALL_META.TXT.json

- ipd-valid.zip：7 页、2 个根目录分组；dockw、缺 SEO、META/CLASS 单侧页面、重复目录引用、不同目录同名 HTML。
- ipd-renumbered.zip：仅变更目录 code/p_code；紧接 valid 包导入应 skipped，页面 ID 不变。
- ipd-codearts-reference.zip：真实 ALL_META 加合成目录/正文，预期 2 页。
- 其余 ZIP：应 invalid_bundle，保留已有 live 与页面身份；具体预期见 cases.json。

重新生成：`rtk proxy {GENERATOR}`
验证：在 backend 执行，设置 IPD_TEST_PACK_DIR 为本目录的绝对路径：
`rtk proxy env IPD_TEST_PACK_DIR=/absolute/path ./gradlew :control:test --tests 'io.space.concepts.importformat.*' --tests io.space.control.compositions.releases.bundleimport.BundleImportSyncsTest`
""", encoding="utf-8")
    print(json.dumps({"directory": str(args.output), "packages": len(cases)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
