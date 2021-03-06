package net.datascientists.security.config;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import net.datascientists.security.filter.AuthenticationFilter;
import net.datascientists.security.filter.ManagementEndpointAuthenticationFilter;
import net.datascientists.security.handler.TokenManager;
import net.datascientists.security.provider.BackendAdminUsernamePasswordAuthenticationProvider;
import net.datascientists.security.provider.DomainUsernamePasswordAuthenticationProvider;
import net.datascientists.security.provider.TokenAuthenticationProvider;
import net.datascientists.security.service.DaoServiceAuthenticator;
import net.datascientists.security.service.ExternalServiceAuthenticator;

@Configuration
@EnableWebSecurity
@Order(2)
@ImportResource("/WEB-INF/spring/applicationContext.xml")
public class SecurityConfig extends WebSecurityConfigurerAdapter{

	
	
	@Value("${backend.admin.role}")
	private String backendAdminRole;

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.csrf().disable().sessionManagement()
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
				.and()
				.authorizeRequests()
				.antMatchers(actuatorEndpoints())
				.hasRole(backendAdminRole)
				.anyRequest()
				.authenticated()
				.and()
				.anonymous()
				.disable()
				.exceptionHandling()
				.authenticationEntryPoint(unauthorizedEntryPoint());

		http.addFilterBefore(new AuthenticationFilter(authenticationManager()),
				BasicAuthenticationFilter.class).addFilterBefore(
				new ManagementEndpointAuthenticationFilter(
						authenticationManager()),
				BasicAuthenticationFilter.class);

	}
	
	@Bean
	public TokenManager tokenManager() {
		return new TokenManager();
	}

	@Bean
	public AuthenticationEntryPoint unauthorizedEntryPoint() {
		return new AuthenticationEntryPoint() {
			@Override
			public void commence(HttpServletRequest request, HttpServletResponse response,
					AuthenticationException authException) throws IOException, ServletException {
				response
						.sendError(HttpServletResponse.SC_UNAUTHORIZED);
			}
		};
	}

	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth)
			throws Exception {
		auth.authenticationProvider(
				domainUsernamePasswordAuthenticationProvider())
				.authenticationProvider(
						backendAdminUsernamePasswordAuthenticationProvider())
				.authenticationProvider(tokenAuthenticationProvider());
	}

	private String[] actuatorEndpoints() {
		return new String[] { "/web", "/mobile", "/desktop" };
	}
	
	@Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
     
	@Bean
	public ExternalServiceAuthenticator getExternalServiceAuthenticator() {
		return new DaoServiceAuthenticator();
	}

	@Bean
	public AuthenticationProvider domainUsernamePasswordAuthenticationProvider() {
		return new DomainUsernamePasswordAuthenticationProvider(getExternalServiceAuthenticator(), tokenManager());
	}

	@Bean
	public AuthenticationProvider backendAdminUsernamePasswordAuthenticationProvider() {
		return new BackendAdminUsernamePasswordAuthenticationProvider();
	}

	@Bean
	public AuthenticationProvider tokenAuthenticationProvider() {
		return new TokenAuthenticationProvider(tokenManager());
	}
	
}
