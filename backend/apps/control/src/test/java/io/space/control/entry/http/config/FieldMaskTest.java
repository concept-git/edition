package io.space.control.entry.http.config;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.json.JsonMapper;

class FieldMaskTest {
    final JsonMapper mapper = JsonMapper.builder().build();

    record Item(String id, String content, Map<String, String> properties) {}

    record Page(List<Item> items, String nextCursor) {}

    @RestController
    static class FixtureController {
        @GetMapping("/fixture")
        Page list() {
            return new Page(List.of(new Item("one", "正文".repeat(5000), Map.of("key/with?query", "valid"))), null);
        }
    }

    @Test
    void projectsOnTheServerAndRetainsCursorAndEtagSemantics() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new FixtureController())
                .setControllerAdvice(new FieldProjectionAdvice(mapper))
                .build();
        byte[] full = mvc.perform(get("/fixture"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();
        byte[] selected = mvc.perform(get("/fixture").queryParam("fields", "items(id),nextCursor"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();
        assertThat(selected.length).isLessThan(full.length / 5);
        assertThat(mapper.readTree(selected).toString())
                .isEqualTo("{\"items\":[{\"id\":\"one\"}],\"nextCursor\":null}");
    }

    @Test
    void validatesUnknownFieldsAgainstTheTypeEvenForAnEmptyPage() {
        var type = mapper.constructType(Page.class);
        for (String invalid : List.of(
                "items(typo)",
                "items(id/child)",
                "items(properties/key)",
                "items(",
                "items(),",
                "../id",
                "items(**)",
                "items(id),"))
            assertThatThrownBy(() -> new FieldMask(invalid).validate(type, mapper))
                    .isInstanceOf(io.space.control.entry.http.problem.GatewayProblemException.class);
        var valid = new FieldMask("items/id,nextCursor");
        valid.validate(type, mapper);
        assertThat(valid.project(mapper.valueToTree(new Page(List.of(), null)), mapper)
                        .toString())
                .isEqualTo("{\"items\":[],\"nextCursor\":null}");
    }

    @Test
    void preservesDynamicMapsWhenSelectedWholeAndRejectsUnboundedExpressions() {
        var mask = new FieldMask("items(properties)");
        mask.validate(mapper.constructType(Page.class), mapper);
        var value = new FixtureController().list();
        assertThat(mask.project(mapper.valueToTree(value), mapper)
                        .at("/items/0/properties/key~1with?query")
                        .asString())
                .isEqualTo("valid");
        assertThatThrownBy(() -> new FieldMask("x(".repeat(20) + "id" + ")".repeat(20)))
                .isInstanceOf(RuntimeException.class);
        assertThatThrownBy(() -> new FieldMask("x".repeat(4097))).isInstanceOf(RuntimeException.class);
    }
}
