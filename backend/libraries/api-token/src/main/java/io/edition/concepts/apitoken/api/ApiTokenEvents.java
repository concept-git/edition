package io.edition.concepts.apitoken.api;

/** 与令牌状态同事务发布的完成事件；只携稳定身份，后续交付与撤权由组合层编排。 */
public final class ApiTokenEvents {
    private ApiTokenEvents() {}

    public record Changed(ApiTokenApi.TokenId token) {}
}
