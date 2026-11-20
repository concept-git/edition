/**
 * Site HTTP 适配：DTO、路由与响应翻译；只调用 CreateSiteUseCase createSiteUseCase, ListSitesUseCase listSitesUseCase, ViewSiteUseCase viewSiteUseCase, ListSpaceMountsUseCase listSpaceMountsUseCase, UpdateSiteUseCase updateSiteUseCase, MountSpaceUseCase mountSpaceUseCase, UnmountSpaceUseCase unmountSpaceUseCase, ReorderMountsUseCase reorderMountsUseCase BindDomainUseCase。
 * 不拥有业务状态，不直接调用 delivery 概念门面。
 */
package io.space.control.entry.http.site;
