package io.space.shared;

import java.util.List;
import java.util.function.Function;

/** 从已排序候选行截取一页；多取的一行仅用于判断续页，游标始终指向最后一条返回项。 */
public record PageWindow<T, C>(List<T> items, C nextCursor) {
    public PageWindow {
        items = List.copyOf(items);
    }

    /** 调用方负责排序、筛选和多取一行；不足或恰好一页时不计算游标。 */
    public static <T, C> PageWindow<T, C> of(List<T> rows, int limit, Function<? super T, ? extends C> cursor) {
        if (limit < 1) throw new IllegalArgumentException("page limit must be positive");
        var items = rows.subList(0, Math.min(limit, rows.size()));
        return new PageWindow<>(items, rows.size() > limit ? cursor.apply(items.getLast()) : null);
    }
}
