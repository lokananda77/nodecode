package net.datascientists.security.model;

public enum UserProfileType {
	READONLY("READONLY"),
    ASSESSOR("ASSESSOR"),
    CONTDEV("CONTDEV"),
    INTERVIEWER("INTERVIEWER"),
    ADMIN("ADMIN");
     
    String userProfileType;
     
    private UserProfileType(String userProfileType){
        this.userProfileType = userProfileType;
    }
     
    public String getUserProfileType(){
        return userProfileType;
    }
     
}