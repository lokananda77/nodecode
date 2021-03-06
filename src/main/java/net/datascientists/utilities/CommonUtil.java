package net.datascientists.utilities;

import java.util.List;

public class CommonUtil {

	
	public static boolean isListEmpty(List<? extends Object> list) {
		return list == null || list.isEmpty();
	}
	
	private static boolean isReadOnly = false;
	
	public static boolean isReadOnlyEnabled(){
		return isReadOnly;
	}
	
	public static boolean setReadOnly(boolean readOnly){
		return isReadOnly = readOnly;
	}

	public static boolean isNumeric(String str) {
		try {
			Integer.parseInt(str);
		} catch (NumberFormatException nfe) {
			return false;
		}
		return true;
	}

	public static String getNextQuestionByCurrentNumber(String number) {
		if(number==null){
			number = "0";
		}else if(number.length() == 0){
			number = "0";
		}
		StringBuilder sb = new StringBuilder(number);		
		String lastChar = sb.substring(sb.length() - 1);
		if(isInteger(lastChar)){
			String[] numArray = number.split("[a-zA-Z]+");
			String lastLetter = numArray[numArray.length - 1];
			numArray[numArray.length - 1] = String.valueOf(Integer.parseInt(lastLetter) + 1);
			sb.delete(sb.lastIndexOf(lastLetter), sb.length());
			sb.append(numArray[numArray.length - 1]);
		}
		else{
			sb.append("1");
		}		
		return sb.toString();
	}

	private static boolean isInteger(String lastLetter) {
		try {
			Integer.parseInt(lastLetter);
			return true;
		} catch (NumberFormatException exception) {
			return false;
		}
	}

}
