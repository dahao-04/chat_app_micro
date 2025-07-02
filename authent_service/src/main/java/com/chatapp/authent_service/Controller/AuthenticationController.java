package com.chatapp.authent_service.Controller;

import java.text.ParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chatapp.authent_service.DTO.Request.AuthenticationRequest;
import com.chatapp.authent_service.DTO.Request.IntrospectRequest;
import com.chatapp.authent_service.DTO.Request.LogoutRequest;
import com.chatapp.authent_service.DTO.Request.RefreshTokenRequest;
import com.chatapp.authent_service.DTO.Request.SignupRequest;
import com.chatapp.authent_service.DTO.Response.APIResponse;
import com.chatapp.authent_service.DTO.Response.AuthenticationResponse;
import com.chatapp.authent_service.DTO.Response.IntrospectResponse;
import com.chatapp.authent_service.DTO.Response.RefreshTokenResponse;
import com.chatapp.authent_service.Service.AuthenticationService;
import com.nimbusds.jose.JOSEException;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@RestController
@FieldDefaults ( level = AccessLevel.PRIVATE )
@RequestMapping ("/auth")
public class AuthenticationController {

    @Autowired
    AuthenticationService authenticationService;

    @PostMapping("/login")
    APIResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.login(request);
        return APIResponse.<AuthenticationResponse>builder()
                .data(result)
                .build();
    }

    @PostMapping("/introspect")
    APIResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        var result = authenticationService.introspect(request);
        return APIResponse.<IntrospectResponse>builder()
                .data(result)
                .build();
    }

    @PostMapping("/logout")
    APIResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException {
        authenticationService.logout(request);
        return APIResponse.<Void>builder().build();
    }

    @PostMapping("/signup")
    APIResponse<Void> signup(@RequestBody SignupRequest request) {
        authenticationService.signup(request);
        return APIResponse.<Void>builder().build();
    }

    @PostMapping("/refresh")
    APIResponse<RefreshTokenResponse> refresh(@RequestBody RefreshTokenRequest request) throws JOSEException, ParseException {
        RefreshTokenResponse result = authenticationService.refresh(request);
        return APIResponse.<RefreshTokenResponse>builder()
                .data(result)
                .build();
    }
}
