package com.chatapp.authent_service.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.chatapp.authent_service.DTO.Request.AuthenticationRequest;
import com.chatapp.authent_service.DTO.Request.IntrospectRequest;
import com.chatapp.authent_service.DTO.Request.LogoutRequest;
import com.chatapp.authent_service.DTO.Request.RefreshTokenRequest;
import com.chatapp.authent_service.DTO.Request.SignupRequest;
import com.chatapp.authent_service.DTO.Response.AuthenticationResponse;
import com.chatapp.authent_service.DTO.Response.IntrospectResponse;
import com.chatapp.authent_service.DTO.Response.RefreshTokenResponse;
import com.chatapp.authent_service.Entity.RefreshToken;
import com.chatapp.authent_service.Entity.User;
import com.chatapp.authent_service.Exception.AppException;
import com.chatapp.authent_service.Exception.ErrorCode;
import com.chatapp.authent_service.Repository.RefreshTokenRepository;
import com.chatapp.authent_service.Repository.UserRepository;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

@Service
public class AuthenticationService {

    @Value("${jwt.access_token.secret_key}")
    private String ACCESS_TOKEN_KEY;
    @Value("${jwt.access_token.valid_duration}")
    private long ACCESS_TOKEN_VALID_DURATION;

    @Value("${jwt.refresh_token.secret_key}")
    private String REFRESH_TOKEN_KEY;
    @Value("${jwt.refresh_token.valid_duration}")
    private long REFRESH_TOKEN_VALID_DURATION;

    @Autowired
    UserRepository userRepo;
    @Autowired
    RefreshTokenRepository refreshtokenRepo;
    @Autowired
    PasswordEncoder passwordEncoder;
    
    private String generateToken ( User user, String secretKey, long validDuration ) {

        JWSHeader header = new JWSHeader (JWSAlgorithm.HS256);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
            .subject(user.getUserEmail())
            .issuer("Tekti.com")
            .issueTime(new Date())
            .claim("userId", user.getId())
            .claim("userEmail", user.getUserEmail())
            .claim("role", user.getRole())
            .jwtID(UUID.randomUUID().toString())
            .expirationTime( new Date(
                Instant.now().plus(validDuration, ChronoUnit.SECONDS).toEpochMilli()
            ))
            .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject token = new JWSObject(header, payload);

        try {
            token.sign(new MACSigner(secretKey.getBytes()));
            return token.serialize();
        } catch (JOSEException e) {
           return "Cannot create token: " + e.getMessage();
        }
    }

    private boolean verifyToken(String token, String secretKey) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(secretKey.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        boolean verified = signedJWT.verify(verifier);
        if (!verified) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Date expTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        if (expTime == null || expTime.before(new Date())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED); // token đã hết hạn
        }

        if (refreshtokenRepo.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED); // token đã bị revoke
        }

        return true;
    }

    public AuthenticationResponse login ( AuthenticationRequest request ) {
        var findUser = userRepo.findByUserEmail(request.getUserEmail());

        if(!findUser.isPresent()) throw new AppException(ErrorCode.USER_NOT_FOUND);

        boolean authenticated = passwordEncoder.matches(request.getPassword(), findUser.get().getUserPassword());
        
        if(!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String accessToken = generateToken(findUser.get(), ACCESS_TOKEN_KEY, ACCESS_TOKEN_VALID_DURATION);
        String refreshToken = generateToken(findUser.get(), REFRESH_TOKEN_KEY, REFRESH_TOKEN_VALID_DURATION);

        return AuthenticationResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .build();
    }

    public void signup (SignupRequest request) {
        boolean isExist = userRepo.existsByUserEmail(request.getUserEmail());
        if(isExist) throw new AppException(ErrorCode.USER_ALREADY_EXIST);

        String encodePassword = passwordEncoder.encode(request.getUserPassword());

        User newUser = User.builder()
                            .userEmail(request.getUserEmail())
                            .userName(request.getUserName())
                            .role("user")
                            .createAt(new Date())
                            .userPassword(encodePassword)
                            .build();
        
        userRepo.save(newUser);
    }

    public RefreshTokenResponse refresh ( RefreshTokenRequest request ) throws JOSEException, ParseException {
        boolean authenticated = verifyToken(request.getRefreshToken(), REFRESH_TOKEN_KEY);

        if(!authenticated) throw new  AppException(ErrorCode.UNAUTHENTICATED);

        String user_email = SignedJWT.parse(request.getAccessToken()).getJWTClaimsSet().getSubject();
        
        var findUser = userRepo.findByUserEmail(user_email);

        if(!findUser.isPresent()) throw new AppException(ErrorCode.USER_NOT_FOUND);
        String newToken = generateToken( findUser.get(), ACCESS_TOKEN_KEY, ACCESS_TOKEN_VALID_DURATION);

        return RefreshTokenResponse.builder()
            .token(newToken)
            .build();        
    }

    public void logout (LogoutRequest request) throws ParseException {

        SignedJWT token = SignedJWT.parse(request.getToken());
        String jid = token.getJWTClaimsSet().getJWTID();
        Date expTime = token.getJWTClaimsSet().getExpirationTime();
        
        RefreshToken refreshToken = RefreshToken.builder()
            .id(jid)
            .expTime(expTime)
            .build();
        
        refreshtokenRepo.save(refreshToken);
    }

    public IntrospectResponse introspect ( IntrospectRequest request ) {
        String token = request.getAccessToken();
        boolean isValid = true;

        try {
            verifyToken(token, ACCESS_TOKEN_KEY);
        } catch (Exception e) {
            isValid = false;
        }

        return IntrospectResponse.builder()
            .valid(isValid)
            .build();
    }
}
