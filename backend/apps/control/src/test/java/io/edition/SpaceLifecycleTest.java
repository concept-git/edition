package io.edition;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

class SpaceLifecycleTest extends PlatformBehaviorSuite {
    @Autowired
    MockMvc http;

    @Autowired
    JsonMapper json;

    @Test
    void anOwnerCanRecoverAnArchivedSpaceAndRetryCreationWithoutDuplicates() throws Exception {
        String auth = login("owner");
        String me = http.perform(get("/api/v1/me").header("Authorization", auth))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String spaces = "/api/v1/tenants/"
                + json.readTree(me).get("tenants").get(0).get("id").asString() + "/spaces";
        String key = UUID.randomUUID().toString();
        JsonNode created = create(spaces, auth, key);
        assertEquals(created, create(spaces, auth, key));
        String path = spaces + "/" + created.get("id").asString();
        for (String action : new String[] {"archive", "restore"}) {
            http.perform(post(path + ":" + action)
                            .header("Authorization", auth)
                            .header("Idempotency-Key", UUID.randomUUID()))
                    .andExpect(status().is2xxSuccessful());
            http.perform(get(path).header("Authorization", auth))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Editorial desk"))
                    .andExpect(jsonPath("$.status").value(action.equals("archive") ? "archived" : "active"));
        }
        http.perform(get(path)).andExpect(status().isUnauthorized());
    }

    @Test
    void suspendedMembershipKeepsItsSessionAndRegainsSpaceAccessWhenResumed() throws Exception {
        String operator = login("operator");
        String owner = login("owner");
        String result = http.perform(post("/admin/tenants")
                        .header("Authorization", operator)
                        .contentType("application/json")
                        .content("""
                {"name":"Suspension review","ownerEmail":"owner@dev.local"}
                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String tenant = json.readTree(result).get("tenant").get("id").asString();
        String spaces = "/api/v1/tenants/" + tenant + "/spaces";
        http.perform(post("/admin/tenants/" + tenant + ":suspend").header("Authorization", owner))
                .andExpect(status().isForbidden());
        http.perform(post("/admin/tenants/" + tenant + ":suspend").header("Authorization", operator))
                .andExpect(status().isNoContent());
        http.perform(get(spaces).header("Authorization", owner))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("tenant_suspended"));
        http.perform(post("/admin/tenants/" + tenant + ":resume").header("Authorization", operator))
                .andExpect(status().isNoContent());
        http.perform(get(spaces).header("Authorization", owner)).andExpect(status().isOk());
    }

    private String login(String account) throws Exception {
        String login = http.perform(post("/auth/login")
                        .header("Origin", "http://localhost:8088")
                        .contentType("application/json")
                        .content("""
                {"email":"%s@dev.local","password":"password1"}
                """.formatted(account)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return "Bearer " + json.readTree(login).get("accessToken").asString();
    }

    private JsonNode create(String spaces, String auth, String key) throws Exception {
        String result = http.perform(post(spaces)
                        .header("Authorization", auth)
                        .header("Idempotency-Key", key)
                        .contentType("application/json")
                        .content("""
                {"name":"Editorial desk","mode":"authored"}
                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return json.readTree(result);
    }
}
