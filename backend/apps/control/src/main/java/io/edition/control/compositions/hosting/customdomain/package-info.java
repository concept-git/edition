/**
 * 域名管理 flow：绑定、TXT 核验、主域名、解绑与 ask。
 * 核验证明 {@code DomainProof}、概念输出翻译 {@code DomainResults}、本 flow error case（{@code DomainErrors}）。
 * 真实归属走组合根 ResourceChain。不拥有 CustomDomain 状态、不暴露 HTTP。
 */
@org.springframework.modulith.NamedInterface("hosting")
package io.edition.control.compositions.hosting.customdomain;
