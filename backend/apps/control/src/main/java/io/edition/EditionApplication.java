package io.edition;

import java.time.Clock;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.modulith.Modulithic;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@Modulithic(systemName = "Edition")
@SpringBootApplication(
        scanBasePackages = {"io.edition.control.bootstrap", "io.edition.control.usecases", "io.edition.control.adapters"
        },
        exclude = org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration.class)
@EnableAsync
@EnableScheduling
public class EditionApplication {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    public static void main(String[] args) {
        SpringApplication.run(EditionApplication.class, args);
    }
}
