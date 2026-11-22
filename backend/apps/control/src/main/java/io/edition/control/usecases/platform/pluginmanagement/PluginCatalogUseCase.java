package io.edition.control.usecases.platform.pluginmanagement;

import static io.edition.control.usecases.platform.pluginmanagement.PluginManagementTypes.*;

import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class PluginCatalogUseCase {
    private final PluginManagementOperations operations;

    PluginCatalogUseCase(PluginManagementDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public Catalog pluginCatalog(String credential, UUID tenant) {
        return operations.catalog(credential, tenant);
    }
}
