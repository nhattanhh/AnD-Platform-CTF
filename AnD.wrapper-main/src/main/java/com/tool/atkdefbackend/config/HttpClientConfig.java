package com.tool.atkdefbackend.config;

import com.tool.atkdefbackend.exception.CoreApiException;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * WebClient configuration for communication with Python Core API.
 * 
 * Features:
 * - Connection pooling
 * - Timeout configuration
 * - Request/Response logging
 * - Error handling
 */
@Slf4j
@Configuration
public class HttpClientConfig {

    @Value("${python.server-url:http://localhost:8000}")
    private String pythonServerUrl;

    @Value("${http.client.connect-timeout:5000}")
    private int connectTimeout;

    @Value("${http.client.read-timeout:30000}")
    private int readTimeout;

    @Value("${http.client.write-timeout:10000}")
    private int writeTimeout;

    @Bean
    public WebClient coreApiWebClient() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectTimeout)
                .responseTimeout(Duration.ofMillis(readTimeout))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(readTimeout, TimeUnit.MILLISECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(writeTimeout, TimeUnit.MILLISECONDS)));

        return WebClient.builder()
                .baseUrl(pythonServerUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .filter(logRequest())
                .filter(logResponse())
                .filter(handleErrors())
                .build();
    }

    /**
     * Log outgoing requests
     */
    private ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(request -> {
            log.debug("Core API Request: {} {}", request.method(), request.url());
            return Mono.just(request);
        });
    }

    /**
     * Log incoming responses
     */
    private ExchangeFilterFunction logResponse() {
        return ExchangeFilterFunction.ofResponseProcessor(response -> {
            log.debug("Core API Response: {} {}", response.statusCode(), response.headers().asHttpHeaders());
            return Mono.just(response);
        });
    }

    /**
     * Handle error responses from Python Core API
     */
    private ExchangeFilterFunction handleErrors() {
        return ExchangeFilterFunction.ofResponseProcessor(response -> {
            if (response.statusCode().isError()) {
                return response.bodyToMono(String.class)
                        .defaultIfEmpty("")
                        .flatMap(body -> {
                            log.warn("Core API Error: {} - {}", response.statusCode(), body);
                            return Mono.error(new CoreApiException(
                                    body.isEmpty() ? "Core API error" : body,
                                    response.statusCode().value()
                            ));
                        });
            }
            return Mono.just(response);
        });
    }
}
