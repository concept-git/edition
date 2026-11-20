import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveView,
  unavailableMessage,
} from "../src-reader/app/client/content-plugins/resolve-view.ts";
import {
  contentPluginDescriptors,
  contentTypes,
} from "../src-reader/app/client/content-plugins/catalog.ts";
import { trustedContribution } from "../src-reader/app/client/content-plugins/references.ts";
import { validateManifest } from "../src-reader/app/client/content-plugins/manifest.ts";

test("随构建的内容插件目录与 contracts/content-plugins.json 逐字节一致", () => {
  const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
  assert.equal(
    read("../src-reader/app/client/content-plugins/content-plugins.json"),
    read("../../contracts/content-plugins.json"),
  );
});

test("每个浏览器渲染类型都有可解析的渲染贡献", () => {
  const browserTypes = Object.values(contentTypes).filter(
    (type) => type.renderHost === "browser",
  );
  assert.ok(browserTypes.length >= 3);
  for (const type of browserTypes) {
    const view = resolveView(type.id, undefined);
    assert.match(view.tagName, /-/);
  }
  assert.ok(contentPluginDescriptors.length > 0);
});

test("内置类型无快照时按类型解析；服务端呈现与未知类型保留原文", () => {
  assert.ok(resolveView("json", undefined).tagName);
  assert.throws(() => resolveView("markdown", undefined), {
    message: unavailableMessage,
  });
  assert.throws(() => resolveView("unknown-type", undefined), {
    message: unavailableMessage,
  });
});

test("冻结的定义快照由其渲染引用决定呈现组件", () => {
  const plugin = contentPluginDescriptors.find(
    (item) => item.manifest.renderers.length,
  ).manifest;
  const renderer = plugin.renderers[0];
  const snapshot = (renderHost, renderers) =>
    JSON.stringify({
      definition: { id: "custom", renderHost, renderers },
    });
  const reference = {
    pluginId: plugin.id,
    pluginVersion: plugin.version,
    contributionId: renderer.id,
    config: { extra: 1 },
  };
  const view = resolveView("custom", snapshot("browser", [reference]));
  assert.equal(view.tagName, renderer.tagName);
  assert.equal(view.config.extra, 1);
  assert.throws(() => resolveView("custom", snapshot("server", [reference])), {
    message: unavailableMessage,
  });
  assert.throws(() => resolveView("custom", snapshot("browser", [])), {
    message: unavailableMessage,
  });
  assert.throws(
    () =>
      resolveView(
        "custom",
        snapshot("browser", [{ ...reference, pluginVersion: "0.0.0" }]),
      ),
    /未知受信贡献/,
  );
  assert.throws(() => resolveView("json", "{bad"), SyntaxError);
});

test("trustedContribution 与 validateManifest 对内置插件成立", () => {
  for (const { manifest } of contentPluginDescriptors) {
    assert.deepEqual(
      validateManifest(manifest).filter((item) => item.severity === "error"),
      [],
    );
    for (const view of manifest.renderers)
      assert.equal(
        trustedContribution(
          {
            pluginId: manifest.id,
            pluginVersion: manifest.version,
            contributionId: view.id,
          },
          "renderer",
        ).tagName,
        view.tagName,
      );
  }
});
