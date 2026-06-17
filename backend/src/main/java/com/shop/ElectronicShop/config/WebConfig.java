package com.shop.ElectronicShop.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Альтернативный короткий путь для image_url в БД, например /images/name.jpg
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:///C:/Users/30100/OneDrive/Рабочий стол/Internet-Shop/backend/images/");
    }
}
