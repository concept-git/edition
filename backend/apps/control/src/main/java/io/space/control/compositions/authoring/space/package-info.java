/**
 * Space 管理 flow：拥有 Space 管理 sync、allowedActions 投影、补丁归一 {@code SpacePatch}、
 * 概念有限输出翻译 {@code SpaceResults}，以及 Space 自身的 error case
 * （{@code SpaceErrors}：space_name_invalid / space_icon_invalid / live_release_required）。
 * space_not_found 的异常类在组合根，与其它 flow 共用。真实归属走组合根 {@code ResourceChain}。
 * 归档与 mode 拒绝（space_archived / space_mode_restricted）也是跨 flow 共用件。
 * 租户准入与幂等执行复用组合根；不拥有 Space 状态、不暴露 HTTP，也不承接页面创作或导入。
 * convertSpace（票 18）在本包：无 live 时 409 live_release_required。
 */
@org.springframework.modulith.NamedInterface("authoring")
package io.space.control.compositions.authoring.space;
