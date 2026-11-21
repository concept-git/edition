package io.edition.control.compositions.releases.bundleimport;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/** 远程地址导入的服务端出流量并发额度已满：我方容量而非用户输入错误，503 + Retry-After（gateway 专属 handler 加头）。 */
public final class ImportRemoteBusyException extends FlowException {
    public static final long RETRY_AFTER_SECONDS = 5;

    ImportRemoteBusyException() {
        super(ProblemCode.DEPENDENCY_UNAVAILABLE);
    }
}
