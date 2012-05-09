package json_models;

import java.util.UUID;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;

import play.libs.Json;
import flexjson.JSONException;
import flexjson.JSONSerializer;

public class Auth {
	public final String type;
	public AuthData data;
	
	public Auth(){
		this.type = "auth";
	}
	
	public static String genAuth(){
		String json = "";	
		try{
			
			Auth a = new Auth();
			AuthData ad = new AuthData();
			UUID idOne = UUID.randomUUID();
			ad.sessionid = idOne.toString();
			a.data = ad;
			JSONSerializer aser = new JSONSerializer();
			json = aser.exclude("*.class").serialize(a);
			} 
		catch (JSONException e) {	 
			 e.printStackTrace();
		}
		return json;
	}
}
