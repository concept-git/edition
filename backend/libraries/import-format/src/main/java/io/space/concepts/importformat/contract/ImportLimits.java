package io.space.concepts.importformat.contract;

import io.space.concepts.importformat.api.*;

/** 所有格式共同遵循的有界处理预算；来源特有策略留在格式包。 */
public final class ImportLimits {
    private ImportLimits() {}

    public static final int MAX_CONTENT_BYTES = 2 * 1024 * 1024;
    public static final long MAX_ATTACHMENT_BYTES = 10L * 1024 * 1024;
    public static final int MAX_ATTACHMENTS_PER_PAGE = 50;
    public static final int MAX_TOC_DEPTH = 7;
    public static final int SNIFF_PEEK_BYTES = 2048;
    /** file-tree 兜底适配器接受的最多候选文件数；超出即整包 Invalid（zip 炸弹兜底）。 */
    public static final int MAX_PAGE_FILES = 5000;

    public static final int MAX_PROPERTIES = 32;
    public static final int MAX_PROPERTY_VALUE_CHARS = 1024;
}
