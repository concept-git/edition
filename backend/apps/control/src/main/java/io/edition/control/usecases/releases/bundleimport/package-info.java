/**
 * 持续导入 flow（票 20）：synced 空间的 live 导入作业与发版流水线，
 * 与 {@code SYNCS.md} / {@code ContinuousImportUseCase} 共置。
 * 入站由 ImportZipIngress 管理；BundleImportJobRunner 管作业事务与恢复；ImportBundleAssembler 纯转换快照；
 * ImportZipFile 管下载流与临时文件生命周期。协作者保持包可见，避免为分层暴露内部接口。
 * 不拥有 authored 共享流水线（{@code release.PublishPageUseCase}）；不暴露 HTTP。
 */
@org.springframework.modulith.NamedInterface("releases")
package io.edition.control.usecases.releases.bundleimport;
