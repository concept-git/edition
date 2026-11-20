package io.space.control.entry.http.config;

import java.lang.reflect.Method;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.JavaType;
import tools.jackson.databind.json.JsonMapper;

/** Projects successful read DTOs after their normal flow; never filters authorization or errors. */
@RestControllerAdvice(basePackages = "io.space.control.entry.http")
class FieldProjectionAdvice implements ResponseBodyAdvice<Object> {
    private final JsonMapper mapper;

    FieldProjectionAdvice(JsonMapper mapper) {
        this.mapper = mapper;
    }

    static JavaType responseType(Method method) {
        var type = tools.jackson.databind.type.TypeFactory.createDefaultInstance()
                .constructType(method.getGenericReturnType());
        return HttpEntity.class.isAssignableFrom(type.getRawClass()) ? type.containedType(0) : type;
    }

    static boolean eligible(Method method) {
        if (method == null || method.getAnnotation(GetMapping.class) == null) return false;
        String owner = method.getDeclaringClass().getName();
        if (!owner.startsWith("io.space.control.entry.http.")
                || owner.contains(".auth.")
                || owner.contains(".token.")
                || owner.contains(".account.")) return false;
        JavaType type = responseType(method);
        return type != null
                && !type.isPrimitive()
                && type.getRawClass() != String.class
                && !org.springframework.core.io.Resource.class.isAssignableFrom(type.getRawClass())
                && type.getRawClass() != Void.class
                && type.getRawClass() != byte[].class;
    }

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return eligible(returnType.getMethod());
    }

    @Override
    public Object beforeBodyWrite(
            Object body,
            MethodParameter returnType,
            MediaType mediaType,
            Class<? extends HttpMessageConverter<?>> converterType,
            ServerHttpRequest request,
            ServerHttpResponse response) {
        String fields = UriComponentsBuilder.fromUri(request.getURI())
                .build()
                .getQueryParams()
                .getFirst("fields");
        if (fields == null || body == null) return body;
        var mask = new FieldMask(java.net.URLDecoder.decode(fields, java.nio.charset.StandardCharsets.UTF_8));
        mask.validate(responseType(returnType.getMethod()), mapper);
        return mask.project(mapper.valueToTree(body), mapper);
    }
}
