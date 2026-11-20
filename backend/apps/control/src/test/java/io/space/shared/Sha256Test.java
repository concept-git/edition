package io.space.shared;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import org.junit.jupiter.api.Test;

class Sha256Test {
    @Test
    void knownVectorsAndIndependentStreamingInstancesAgree() {
        assertThat(Sha256.hex("")).isEqualTo("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        String abc = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
        assertThat(Sha256.hex("abc")).isEqualTo(abc);
        var first = Sha256.newDigest();
        var second = Sha256.newDigest();
        first.update((byte) 'a');
        second.update("abc".getBytes(StandardCharsets.UTF_8));
        first.update("bc".getBytes(StandardCharsets.UTF_8));
        assertThat(HexFormat.of().formatHex(first.digest())).isEqualTo(abc);
        assertThat(HexFormat.of().formatHex(second.digest())).isEqualTo(abc);
        assertThat(Sha256.hex("中文")).isEqualTo(Sha256.hex("中文".getBytes(StandardCharsets.UTF_8)));
    }
}
