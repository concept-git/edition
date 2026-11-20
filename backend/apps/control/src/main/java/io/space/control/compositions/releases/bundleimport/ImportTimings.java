package io.space.control.compositions.releases.bundleimport;

import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StopWatch;

/** 每次 worker 尝试的单调时钟分段耗时；不包含受理、排队及事务提交。 */
final class ImportTimings implements AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(ImportTimings.class);
    private final UUID jobId;
    private final StopWatch watch = new StopWatch();

    ImportTimings(UUID jobId) {
        this.jobId = jobId;
        watch.start("inspecting");
    }

    void phase(String name) {
        if (watch.isRunning()) watch.stop();
        watch.start(name);
    }

    @Override
    public void close() {
        if (watch.isRunning()) watch.stop();
        var event = log.atInfo().addKeyValue("jobId", jobId).addKeyValue("totalMs", watch.getTotalTimeMillis());
        for (var task : watch.getTaskInfo()) {
            event.addKeyValue(task.getTaskName() + "Ms", (long) task.getTime(TimeUnit.MILLISECONDS));
        }
        event.log("Import attempt phase timings");
    }
}
