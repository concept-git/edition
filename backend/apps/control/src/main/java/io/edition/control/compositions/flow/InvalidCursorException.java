package io.edition.control.compositions.flow;

/** 任何键集分页列表收到无法解析的游标（400 invalid_cursor）；跨组共用，故放组合根。 */
public final class InvalidCursorException extends FlowException {

    public InvalidCursorException() {
        super(ProblemCode.INVALID_CURSOR);
    }
}
