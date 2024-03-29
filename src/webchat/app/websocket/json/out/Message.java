package websocket.json.out;

import java.util.*;

import javax.swing.text.html.HTML;

import websocket.json.in.InMessage;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;
import org.apache.commons.lang.StringEscapeUtils;

import models.*;
import play.libs.Json;

import flexjson.JSONDeserializer;
import flexjson.JSONException;
import flexjson.JSONSerializer;

public class Message {
	public final String type;
	public Map<Integer, Map<Integer, MessageData>> data = new LinkedHashMap<Integer, Map<Integer, MessageData>>();
	public Boolean init;
	public Map<Integer, String> actions = new LinkedHashMap<Integer, String>();

	public Message() {
		this.type = "message";

	}

	public static JsonNode genMessage(JsonNode inmessage, int userid) {
		String json = "";
		try {
			// Map the incomeJsonMessage to a model
			InMessage im = new InMessage();
			im = new JSONDeserializer<InMessage>().deserialize(
					inmessage.toString(), InMessage.class);
			models.Message dbmessage = new models.Message();
	
			// Create DB Message
			dbmessage.content = StringEscapeUtils.escapeSql(im.data.message);
			dbmessage.date = new Date();
			dbmessage.modified = new Date();
			dbmessage.type = im.data.type;
			dbmessage.user = models.User.find.byId(userid);
			for (Iterator<Integer> iterator = im.data.channel.iterator(); iterator
					.hasNext();) {
				dbmessage.channels.add(models.Channel.find.byId(iterator.next()));
			}
			// Save the Message to the DB
			dbmessage.save();
			dbmessage.saveManyToManyAssociations("channels");

			// Create JsonMessage
			Message m = new Message();
			MessageData md = new MessageData();
			m.init = false;
			md.date = new Date();
		
			md.message = StringEscapeUtils.escapeHtml(im.data.message);
			if (im.data.type.equals("text"))
				md.message = md.message.replaceAll("\n", "<br/>");
			md.modified = new Date();
			md.type = im.data.type;
			md.user_id = userid;

			// Put the Messages in the map
			Map<Integer, MessageData> mdata = new LinkedHashMap<Integer, MessageData>();
			mdata.put(dbmessage.id, md);

			// Fill the Action Dict; always create by messages
			m.actions.put(dbmessage.id, "create");

			// Put the Messages in the channels
			for (Iterator<Integer> iterator = im.data.channel.iterator(); iterator
					.hasNext();) {
				m.data.put(iterator.next(), mdata);
			}
	
			// Generate the Json Message
			JSONSerializer aser = new JSONSerializer().include("*.data",
					"*.actions");
			json = aser.exclude("*.class").serialize(m);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return Json.parse(json);
	}

	// JsonNode-Generation for sending more messages at one time
	public static JsonNode genjoinMessage(int channelid) {
		String json = "";
		try {
			Message m = new Message();
			Map<Integer, MessageData> mdata = new LinkedHashMap<Integer, MessageData>();
			m.init = true;
			for (Iterator<models.Message> miter = models.Message.getallChannelMessages(channelid).iterator(); miter.hasNext();){
				models.Message dbmessage = new models.Message();
				dbmessage = miter.next();
				MessageData md = new MessageData();
				md.date = dbmessage.date;
				md.message = StringEscapeUtils.escapeHtml(dbmessage.content);
				md.modified = dbmessage.modified;
				md.type = dbmessage.type;
				md.user_id = dbmessage.user.id;
				mdata.put(dbmessage.id, md);
				m.actions.put(dbmessage.id, "create");
				
			}
			m.data.put(channelid, mdata);
			
			// Generate the Json Message
			JSONSerializer aser = new JSONSerializer().include("*.data",
					"*.actions");
			json = aser.exclude("*.class").serialize(m);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return Json.parse(json);
	}
}
