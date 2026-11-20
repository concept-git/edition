package io.space.concepts.revision.domain;

import com.github.difflib.DiffUtils;
import io.space.concepts.revision.api.*;
import io.space.concepts.revision.api.RevisionApi;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public final class RevisionDiff {
    private RevisionDiff() {}

    public static RevisionApi.Diff between(int from, String before, int to, String after) {
        List<String> oldLines = lines(before);
        List<String> newLines = lines(after);
        var patch = DiffUtils.diff(oldLines, newLines);
        var hunks = patch.getDeltas().stream()
                .map(delta -> {
                    var values = new ArrayList<RevisionApi.DiffLine>();
                    delta.getSource()
                            .getLines()
                            .forEach(line ->
                                    values.add(new RevisionApi.DiffLine(RevisionApi.DiffLineType.DELETE, line)));
                    delta.getTarget()
                            .getLines()
                            .forEach(line -> values.add(new RevisionApi.DiffLine(RevisionApi.DiffLineType.ADD, line)));
                    return new RevisionApi.DiffHunk(
                            delta.getSource().getPosition() + 1,
                            delta.getSource().size(),
                            delta.getTarget().getPosition() + 1,
                            delta.getTarget().size(),
                            values);
                })
                .toList();
        return new RevisionApi.Diff(from, to, hunks);
    }

    private static List<String> lines(String value) {
        if (value.isEmpty()) return List.of();
        return Arrays.asList(value.split("\\R", -1));
    }
}
