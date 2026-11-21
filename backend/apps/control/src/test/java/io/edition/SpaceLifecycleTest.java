package io.edition;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.servlet.http.Cookie;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
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

    @Autowired
    @Qualifier("migrationDataSource")
    DataSource fixtureDataSource;

    @Test
    void mountWritesFollowSpaceIdsAfterAnAddressIsReused() throws Exception {
        String auth = login("owner");
        String tenant = tenantPath(auth);
        String first = mutate(post(tenant + "/spaces"), auth, """
                {"name":"Original desk","mode":"authored"}
                """).get("id").asString();
        String second = mutate(post(tenant + "/spaces"), auth, """
                {"name":"Replacement desk","mode":"authored"}
                """).get("id").asString();
        String site = createSite(tenant, auth, "Stable mount IDs");

        mutate(put(site + "/mounts/guide"), auth, "{\"spaceId\":\"" + first + "\"}");
        mutate(post(site + "/space-mounts/" + first + ":remount"), auth, "{\"newSlug\":\"handbook\"}");
        mutate(put(site + "/mounts/guide"), auth, "{\"spaceId\":\"" + second + "\"}");

        var order = mutate(
                        put(site + "/space-mounts:order"),
                        auth,
                        "{\"spaceIds\":[\"" + second + "\",\"" + first + "\"]}")
                .get("mounts");
        assertEquals(second, order.get(0).get("spaceId").asString());
        assertEquals(first, order.get(1).get("spaceId").asString());
        var remaining =
                mutate(delete(site + "/space-mounts/" + first), auth, null).get("mounts");
        assertEquals(1, remaining.size());
        assertEquals(second, remaining.get(0).get("spaceId").asString());
        assertEquals("guide", remaining.get(0).get("slug").asString());
    }

    @Test
    void readerHistoryResolvesTheCurrentAddressWithoutDuplicatingARemountedSpace() throws Exception {
        String auth = login("owner");
        String tenant = tenantPath(auth);
        String space = mutate(post(tenant + "/spaces"), auth, """
                {"name":"Reading history","mode":"authored"}
                """).get("id").asString();
        String spacePath = tenant + "/spaces/" + space;
        String page = mutate(post(spacePath + "/pages"), auth, """
                {"title":"Start","format":"markdown","slug":"start.md"}
                """).get("id").asString();
        mutate(post(spacePath + "/pages/" + page + ":publish"), auth, null);
        String site = createSite(tenant, auth, "Reading history IDs");
        mutate(put(site + "/mounts/guide"), auth, "{\"spaceId\":\"" + space + "\"}");
        mutate(put(site + "/permissions/grants/anonymous"), auth, "{\"role\":\"reader\"}");
        String host = "stable-history-" + UUID.randomUUID() + ".acme.test";
        var domain = mutate(post(site + "/domains"), auth, "{\"host\":\"" + host + "\"}");
        new JdbcTemplate(fixtureDataSource)
                .update(
                        "insert into shared.dns_txt_stubs(name,value) values(?,?)",
                        domain.get("txtName").asString(),
                        domain.get("txtValue").asString());
        mutate(post(site + "/domains/" + host + ":verify"), auth, null);

        String setCookie = http
                .perform(post("https://" + host + "/_auth/session")
                        .secure(true)
                        .header("Host", host)
                        .header("Origin", "https://" + host)
                        .contentType("application/json")
                        .content("""
                                {"email":"owner@dev.local","password":"password1"}
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeaders("Set-Cookie")
                .stream()
                .filter(value -> value.startsWith("__Host-space_reader="))
                .findFirst()
                .orElseThrow();
        String[] credential = setCookie.split(";", 2)[0].split("=", 2);
        var access = new Cookie(credential[0], credential[1]);
        recordVisit(host, access, "guide", "/guide/start.md");
        http.perform(get("https://" + host + "/_auth/history")
                        .secure(true)
                        .header("Host", host)
                        .cookie(access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].pagePath").value("/guide/start.md"));

        mutate(post(site + "/space-mounts/" + space + ":remount"), auth, "{\"newSlug\":\"handbook\"}");
        http.perform(get("https://" + host + "/_auth/history")
                        .secure(true)
                        .header("Host", host)
                        .cookie(access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].pagePath").value("/handbook/start.md"));

        recordVisit(host, access, "handbook", "/handbook/start.md");
        recordVisit(host, access, "handbook", "/handbook/missing.md");
        http.perform(get("https://" + host + "/_auth/history")
                        .secure(true)
                        .header("Host", host)
                        .cookie(access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].spaceSlug").value("handbook"))
                .andExpect(jsonPath("$[0].pagePath").value("/handbook/start.md"));
    }

    private void recordVisit(String host, Cookie access, String slug, String path) throws Exception {
        http.perform(post("https://" + host + "/_auth/history")
                        .secure(true)
                        .header("Host", host)
                        .header("Origin", "https://" + host)
                        .cookie(access)
                        .contentType("application/json")
                        .content(json.writeValueAsString(java.util.Map.of("spaceSlug", slug, "pagePath", path))))
                .andExpect(status().isNoContent());
    }

    private String tenantPath(String auth) throws Exception {
        var me = http.perform(get("/api/v1/me").header("Authorization", auth))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return "/api/v1/tenants/"
                + json.readTree(me).get("tenants").get(0).get("id").asString();
    }

    private String createSite(String tenant, String auth, String name) throws Exception {
        String id = mutate(post(tenant + "/sites"), auth, json.writeValueAsString(java.util.Map.of("name", name)))
                .get("id")
                .asString();
        return tenant + "/sites/" + id;
    }

    private JsonNode mutate(MockHttpServletRequestBuilder request, String auth, String body) throws Exception {
        request.header("Authorization", auth)
                .header("Idempotency-Key", UUID.randomUUID().toString());
        if (body != null) request.contentType("application/json").content(body);
        String response = http.perform(request)
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return response.isEmpty() ? json.nullNode() : json.readTree(response);
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
