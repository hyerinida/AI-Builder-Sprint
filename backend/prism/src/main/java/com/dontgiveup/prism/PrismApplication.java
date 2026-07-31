package com.dontgiveup.prism;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PrismApplication {

	public static void main(String[] args) {
		SpringApplication.run(PrismApplication.class, args);
	}

}
