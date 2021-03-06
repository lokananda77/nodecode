package net.datascientists.security.audit;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.Date;
import java.util.Iterator;
import java.util.LinkedHashMap;

import javax.transaction.Transactional;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import net.datascientists.security.dao.AuditDao;
import net.datascientists.security.handler.TokenManager;
import net.datascientists.security.model.AuditLog;
import net.datascientists.security.model.TokenResponse;

@Aspect
public class AuditAspect {
	
	@Autowired
	private AuditDao dao;

	@Before(value="@annotation(auditable)")
	@Transactional
	public void logTheAuditActivity(JoinPoint aPoint, Auditable auditable) {
		AuditLog auditLog = new AuditLog();
		auditLog.setUsername(getUserName());
		auditLog.setUserType(getRoles());
		auditLog.setAction(auditable.actionType().getValue());
		String arguments = getArgs(aPoint.getArgs());
		String[] split = aPoint.getThis().toString().split("\\.");
		String classNameLast = split[split.length - 1];
		String methodInvocation =  classNameLast.substring(0, classNameLast.indexOf("@"))+ "-"+aPoint.getSignature().getName();
		if (arguments.length() > 0) {
			auditLog.setArguments(arguments.getBytes());
		}
		auditLog.setMethod(methodInvocation);
		auditLog.setDate(new Timestamp(new Date().getTime()));
		dao.save(auditLog);
	}

	private String getArgs(Object[] args) {
		String arguments = "";
		int argCount = 0;

		for (Object object : args) {
			if (argCount > 0) {
				arguments += ", ";
			}
			arguments += "arg[" + ++argCount + "]=" + "[" + object + "]";
		}
		return arguments;
	}

	private String getUserName() {
		try {
			return extractUserFromToken();
		} catch (NullPointerException npe) {
			return null;
		}
	}
	
	private String getRoles(){
		try{
			return extractAuthFromToken();
		}catch(NullPointerException npe){
			return null;
		}
	}

	private String extractAuthFromToken() {
		TokenManager tokenManager = new TokenManager();
		String token = ((TokenResponse)SecurityContextHolder.getContext().getAuthentication().getDetails()).getToken();
		Collection<GrantedAuthority> auth = tokenManager.parseAuthFromToken(token);
		StringBuilder sb = new StringBuilder();
		Iterator<GrantedAuthority> iterator = auth.iterator();
		while(iterator.hasNext()){
			@SuppressWarnings("unchecked")
			LinkedHashMap<String, String> ga = (LinkedHashMap<String, String>)iterator.next();
			sb.append(ga.get("authority"));
		}
		return sb.toString();
	}

	private String extractUserFromToken() {
		TokenManager tokenManager = new TokenManager();
		String token = ((TokenResponse)SecurityContextHolder.getContext().getAuthentication().getDetails()).getToken();
		return tokenManager.parseUsernameFromToken(token);
	}

}
