package controllers;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.JsonNode;

import com.typesafe.config.ConfigException.Parse;

import play.Logger;
import play.mvc.*;
import play.data.*;

import models.*;

import views.html.*;
import websocket.WebsocketManager;
import websocket.WebsocketNotifier;



public class AdminController extends Controller {
	
	public static Result index() {
    	int uid = verifyAdmin();
    	if(uid != -1)
    	{
    		Logger.info("Admin Page for User with ID " + uid + " loaded - Admin Form filled with data");
        	return ok(admin.render(User.findAll(), Channel.findAll(), Groups.findAll(), File.findAll(), User.getUsername(Integer.parseInt(session("userid")))));
    	}
    	else
    	{
    		return redirect(routes.Application.index());
    	}
    }
	
	public static int verifyAdmin()
	{
		String user = session("userid");
    	
    	if(user != null)
        {
            int userid = Integer.parseInt(user);

            User tmp = User.find.ref(userid);
            if(tmp.admin == true && tmp.active == true)
            {
            	return userid;
            }
            else
            {
            	Logger.warn("Admin Page for User with ID " + userid + " not loaded, because User is not an Admin or active - Redirect to Index Form");
            	return -1;
            }
        }
        else
        {
            Logger.warn("Admin Page not available, because User isn't logged in - Redirect to Login Form");
            return -1;
        }
	}

    public static Result edituser(Long id) {
        Form<User> userForm = form(User.class).fill(User.find.byId(id.intValue()));
        return ok(edituser.render(id, userForm, User.getUsername(Integer.parseInt(session("userid")))));
    }
    
    public static Result updateuser(Long id) {
    	
    	int uid = verifyAdmin();
    	if(uid != -1)
    	{
    		User tmp = new User();
	        Form<User> userForm = form(User.class).bindFromRequest();
	        List<User> ulist = User.findAll();
	        if(userForm.hasErrors()) {
	        	Logger.error("Error while editing the existing User " + id);
	            return badRequest(edituser.render(id, userForm, User.getUsername(Integer.parseInt(session("userid")))));
	        }
	        for(User us : ulist)
	        {
	        	if(us.username.equals(userForm.field("username").value()))
	        	{
	        		if(us.id != id)
	    	        {
		    	        flash("failure", "User " + us.username + " already exists");
		        		Logger.error("Username " + us.username + " already exists");
			            return badRequest(edituser.render(id, userForm, User.getUsername(Integer.parseInt(session("userid")))));
	    	        }
    	        }
	        }
	        tmp.id = id.intValue();
	        tmp.username = userForm.field("username").value();
	        tmp.firstname = userForm.field("firstname").value();
	        tmp.lastname = userForm.field("lastname").value();
	        tmp.email = userForm.field("email").value();
	        tmp.setActive(userForm.field("active").value().toString());
	        tmp.setAdmin(userForm.field("admin").value().toString());
	        if(userForm.field("password").value() != "")
	        {
	        	tmp.setPassword(userForm.field("password").value());
	        }
	        tmp.update();
	        WebsocketNotifier.notifyAllMembers(websocket.json.out.User.genUserchanged(id.intValue(), "update"));
	        flash("success", "User " + userForm.get().username + " has been updated");
        	Logger.info("User " + userForm.get().username + " with ID " + userForm.get().id + " has been updated");
	        return index();
    	}
    	else
    	{
    		return redirect(routes.Application.index());
    	}
    }
    
    public static Result createuser() {
		Form<User> userForm = form(User.class);
	    return ok(createuser.render(userForm, User.getUsername(Integer.parseInt(session("userid")))));
	}
    
    public static Result saveuser() {
    	
    	int uid = verifyAdmin();
    	if(uid != -1)
    	{
    		Form<User> userForm = form(User.class).bindFromRequest();
    		List<User> ulist = User.findAll();
            if(userForm.hasErrors()) 
            {
            	Logger.error("Error while creating a new User");
                return badRequest(createuser.render(userForm, User.getUsername(Integer.parseInt(session("userid")))));
            }
            for(User us : ulist)
	        {
	        	if(us.username.equals(userForm.field("username").value()))
	        	{
	    	        flash("failure", "User " + us.username + " already exists");
	        		Logger.error("Username " + us.username + " already exists");
		            return badRequest(createuser.render(userForm, User.getUsername(Integer.parseInt(session("userid")))));
	        	}
	        }
            userForm.get().save();
            for(Iterator<models.Channel> chaniter = models.Channel.getAllPublicChannel().iterator(); chaniter.hasNext();){
            	models.Channel channel= new models.Channel();
            	channel = chaniter.next();
            	channel.users.add(userForm.get());
            	channel.saveManyToManyAssociations("users");
            	WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("update", channel.id));
            }
            WebsocketNotifier.notifyAllMembers(websocket.json.out.User.genUserchanged(userForm.get().id, "create"));
            flash("success", "User " + userForm.get().username + " has been created");
        	Logger.info("User " + userForm.get().username + " with ID " + userForm.get().id + " has been created");
            return index();
    	}
    	else
    	{
    		return redirect(routes.Application.index());
    	}
    }
    
    public static Result deleteuser(Long id) {
    	
    	String user = session("userid");
    	int uid = verifyAdmin();
    	if(uid != -1)
    	{
    		if(Integer.parseInt(user) == id.intValue())
    		{
    			Logger.error("User " + id + " tried to delete himself, canceled");
                return index();
    		}
    		else
    		{
    			for (Iterator<models.Message> miter = models.Message.getallUserMessages(id.intValue()).iterator(); miter.hasNext();){
    				models.Message message = miter.next();
    				for (Iterator<Channel> messageiter = message.channels.iterator(); messageiter.hasNext();){
    					models.Channel chan=messageiter.next();
    					chan.messages.remove(message);
    					chan.save();
    				}
    				message.delete();
    			}
    			for (Iterator<models.Channel> chaniter = models.User.getChannelsForUser(id.intValue()).iterator(); chaniter.hasNext();){
    				models.Channel channel = chaniter.next();
    				channel.users.remove(models.User.find.byId(id.intValue()));
    				channel.save();
    				WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("update", channel.id));
    			}
    			WebsocketNotifier.notifyAllMembers(websocket.json.out.User.genUserchanged(id.intValue(), "delete"));
    			
    			
    			List<Integer> luser=new ArrayList<Integer>();
    			luser.add(User.find.byId(id.intValue()).id);
    			WebSocket.Out<JsonNode> out = null;
				for(Map.Entry<WebSocket.Out<JsonNode>, Integer> entry: WebsocketManager.members.entrySet()) {
					if (luser.contains(entry.getValue())){
						out = (WebSocket.Out<JsonNode>)entry.getKey();
						out.write(websocket.json.out.Status.genStatus("error", "Your User has been deleted by an admin! You will be redirected to Login-Page!"));
			        }	
			    }		
    			WebsocketManager.members.entrySet().contains(id.intValue());
		        User.find.ref(id.intValue()).delete();
		        flash("success", "User " + id + " has been deleted");
		        Logger.info("User " + id + " has been deleted");
		        return index();
    		}
    	}
    	else
    	{
    		return redirect(routes.Application.index());
    	}
    }
    
    public static Result editchannel(Long id) {
        Form<Channel> channelForm = form(Channel.class).fill(Channel.find.byId(id.intValue()));
        return ok(editchannel.render(id, channelForm, User.getUsername(Integer.parseInt(session("userid")))));
    }
    
    public static Result updatechannel(Long id) {
    	
    	int uid = verifyAdmin();
    	if(uid != -1)
    	{
    		models.Channel oldchan = new models.Channel();
    		oldchan = Channel.find.byId(id.intValue());
	        Form<Channel> channelForm = form(Channel.class).bindFromRequest();
	        if(channelForm.hasErrors()) {
	        	Logger.error("Error while editing the existing Channel " + channelForm.get().id);
	            return badRequest(editchannel.render(id, channelForm, User.getUsername(Integer.parseInt(session("userid")))));
	        }
	        channelForm.get().update(id.intValue());
	        if (channelForm.get().archived != oldchan.archived){
	        	if (oldchan.archived == false)
	        		WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("delete", id.intValue()));
	        	else
	        		WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("create", id.intValue()));
	        }
	        else
	        	WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("update", id.intValue()));
	        flash("success", "Channel " + channelForm.get().name + " has been updated");
        	Logger.info("Channel " + channelForm.get().name + " with ID " + channelForm.get().id + " has been updated");
	        return index();
    	}
    	else
    	{
    		return redirect(routes.Application.index());
    	}
    }
    
    public static Result createchannel() {
		Form<Channel> channelForm = form(Channel.class);
	    return ok(createchannel.render(channelForm, User.getUsername(Integer.parseInt(session("userid")))));
	}
    
    public static Result savechannel() {
    	
    	int uid = verifyAdmin();
    	if(uid != -1)
    	{
    		Form<models.Channel> channelForm = form(models.Channel.class).bindFromRequest();
            if(channelForm.hasErrors()) 
            {
            	Logger.error("Error while creating a new Channel");
                return badRequest(createchannel.render(channelForm, User.getUsername(Integer.parseInt(session("userid")))));
            }
            models.Channel chan = new models.Channel();
            chan = channelForm.get();
        	if (chan.is_public == true){
				for (Iterator<models.User> useriter = models.User.find.all().iterator(); useriter.hasNext();){
					chan.setUsers(useriter.next());
				}
				for (Iterator<Groups> groupiter = models.Groups.find.all().iterator(); groupiter.hasNext();){
					chan.setGroups(groupiter.next());
				}
			}
			else
				chan.setUsers(models.User.find.byId(uid));   
            chan.save();
            if (chan.is_public == true)
    			WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("create", chan.id));
            flash("success", "Channel " + channelForm.get().name + " has been created");
        	Logger.info("Channel " + channelForm.get().name + " with ID " + channelForm.get().id + " has been created");
            return index();
    	}
    	else
    	{
    		return redirect(routes.Application.index());
    	}
    }
    
public static Result deletechannel(Long id) {
    	
    	String user = session("userid");
    	int uid = verifyAdmin();
    	if(uid != -1)
    	{
    		WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("delete", id.intValue()));
	        Channel.find.ref(id.intValue()).delete();
	        flash("success", "Channel " + id + " has been deleted");
	        Logger.info("Channel " + id + " has been deleted");
	        return index();
    	}
    	else
    	{
    		return redirect(routes.Application.index());
    	}
    }

public static Result deletechanneluser(Long channelid, Long userid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	if(uid != -1)
	{		
		User tmp = User.find.byId(userid.intValue());
		Channel tmp2 = Channel.find.byId(channelid.intValue());
		if(tmp.channels.contains(tmp2))
		{
			tmp.channels.remove(tmp2);
			tmp.save();	
			WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("delete", channelid.intValue()));
	        flash("success", "User " + userid + " with Channel " + channelid +  " has been deleted");
	        Logger.info("User " + userid + " with Channel " + channelid +  " has been deleted");
	        return edituser((long) userid);
		}
		return edituser((long) userid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}

public static Result addchanneluser(Long channelid, Long userid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	if(uid != -1)
	{
		
		User tmp = User.find.byId(userid.intValue());
		Channel tmp2 = Channel.find.byId(channelid.intValue());
		if(!tmp.channels.contains(tmp2))
		{
			tmp.channels.add(tmp2);
			tmp.save();
			WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("create", channelid.intValue()));
	        flash("success", "User " + userid + " with Channel " + channelid +  " has been created");
	        Logger.info("User " + userid + " with Channel " + channelid +  " has been created");
	        return edituser((long) userid);
		}
		return edituser((long) userid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}

public static Result deletegroupuser(Long groupid, Long userid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	if(uid != -1)
	{
		User tmp = User.find.byId(userid.intValue());
		Groups tmp2 = Groups.find.byId(groupid.intValue());
		if(tmp.groups.contains(tmp2))
		{
			tmp.groups.remove(tmp2);
			tmp.save();
			WebsocketNotifier.notifyAllMembers(websocket.json.out.User.genUserchanged(userid.intValue(), "update"));
	        flash("success", "User " + userid + " with Group " + groupid +  " has been deleted");
	        Logger.info("User " + userid + " with Group " + groupid +  " has been deleted");
	        return edituser((long) userid);
		}
		return edituser((long) userid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}

public static Result addgroupuser(Long groupid, Long userid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	if(uid != -1)
	{
		User tmp = User.find.byId(userid.intValue());
		Groups tmp2 = Groups.find.byId(groupid.intValue());
		if(!tmp.groups.contains(tmp2))
		{
			tmp.groups.add(tmp2);
			tmp.save();
			WebsocketNotifier.notifyAllMembers(websocket.json.out.User.genUserchanged(userid.intValue(), "update"));
	        flash("success", "User " + userid + " with Group " + groupid +  " has been created");
	        Logger.info("User " + userid + " with Group " + groupid +  " has been created");
	        return edituser((long) userid);
		}
		return edituser((long) userid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}

public static Result deletechannelgroup(Long channelid, Long groupid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	if(uid != -1)
	{
		
	
		Groups tmp = Groups.find.byId(groupid.intValue());
		Channel tmp2 = Channel.find.byId(channelid.intValue());
	
		if(tmp2.groups.contains(tmp))
		{
			tmp2.groups.remove(tmp);
			tmp2.save();
			WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("update",channelid.intValue()));
	        flash("success", "Group " + groupid + " with Channel " + channelid +  " has been deleted");
	        Logger.info("Group " + groupid + " with Channel " + channelid +  " has been deleted");
	        return editgroup((long) groupid);
		}
		return editgroup((long) groupid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}

public static Result addchannelgroup(Long channelid, Long groupid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	if(uid != -1)
	{
		Groups tmp = Groups.find.byId(groupid.intValue());
		Channel tmp2 = Channel.find.byId(channelid.intValue());
		if(!tmp2.groups.contains(tmp))
		{
			tmp2.groups.add(tmp);
			tmp2.save();
			WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("update",channelid.intValue()));
	        flash("success", "Group " + groupid + " with Channel " + channelid +  " has been created");
	        Logger.info("Group " + groupid + " with Channel " + channelid +  " has been created");
	        return editgroup((long) groupid);
		}
		return editgroup((long) groupid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}

public static Result deleteusergroup(Long userid, Long groupid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	if(uid != -1)
	{
		Groups tmp = Groups.find.byId(groupid.intValue());
		User tmp2 = User.find.byId(userid.intValue());
		if(tmp2.groups.contains(tmp))
		{
			tmp2.groups.remove(tmp);
			tmp2.save();
			WebsocketNotifier.notifyAllMembers(websocket.json.out.User.genUserchanged(userid.intValue(), "update"));
	        flash("success", "Group " + groupid + " with User " + userid +  " has been deleted");
	        Logger.info("Group " + groupid + " with User " + userid +  " has been deleted");
	        return editgroup((long) groupid);
		}
		return editgroup((long) groupid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}

public static Result addusergroup(Long userid, Long groupid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	if(uid != -1)
	{
		Groups tmp = Groups.find.byId(groupid.intValue());
		User tmp2 = User.find.byId(userid.intValue());
		if(!tmp2.groups.contains(tmp))
		{
			tmp2.groups.add(tmp);
			tmp2.save();
			WebsocketNotifier.notifyAllMembers(websocket.json.out.User.genUserchanged(userid.intValue(), "update"));
	        flash("success", "Group " + groupid + " with User " + userid +  " has been created");
	        Logger.info("Group " + groupid + " with User " + userid +  " has been created");
	        return editgroup((long) groupid);
		}
		return editgroup((long) groupid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}

public static Result deleteuserchannel(Long userid, Long channelid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	if(uid != -1)
	{
		List<Integer> users = new ArrayList<Integer>();
		Channel tmp = Channel.find.byId(channelid.intValue());
		User tmp2 = User.find.byId(userid.intValue());
		if(tmp2.channels.contains(tmp))
		{
			tmp2.channels.remove(tmp);
			tmp2.save();
			List<Integer> stayusers = models.Channel.getChannelUsers(channelid.intValue());
			for (Iterator<models.User> useriter = models.User.getChannelGroupUser(Groups.getChannelGroups(channelid.intValue())).iterator(); useriter.hasNext();){
		  		int stayuser = useriter.next().id;
		  		if (!stayusers.contains(stayuser))
		  			stayusers.add(stayuser);
		  	}
			if (!stayusers.contains(userid.intValue())){
				users.add(userid.intValue());
			}	
			WebsocketNotifier.sendMessagetoUser(stayusers, channelid.intValue(), "update");
	    	WebsocketNotifier.sendMessagetoUser(users, channelid.intValue(), "delete");
	        flash("success", "Channel " + channelid + " with User " + userid +  " has been deleted");
	        Logger.info("Channel " + channelid + " with User " + userid +  " has been deleted");
	        return editchannel((long) channelid);
		}
		return editchannel((long) channelid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}

public static Result adduserchannel(Long userid, Long channelid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	if(uid != -1)
	{
		Channel tmp = Channel.find.byId(channelid.intValue());
		User tmp2 = User.find.byId(userid.intValue());
		List<Integer> oldusers = models.Channel.getChannelUsers(channelid.intValue());
		for (Iterator<models.User> useriter = models.User.getChannelGroupUser(Groups.getChannelGroups(channelid.intValue())).iterator(); useriter.hasNext();){
	  		int olduser = useriter.next().id;
	  		if (!oldusers.contains(olduser))
	  			oldusers.add(olduser);
	  	}
		List<Integer> users = new ArrayList<Integer>();
		if (!oldusers.contains(userid.intValue()))
				users.add(userid.intValue());
		if(!tmp2.channels.contains(tmp))
		{
			tmp2.channels.add(tmp);
			tmp2.save();
			WebsocketNotifier.sendMessagetoUser(oldusers, channelid.intValue(), "update");
			WebsocketNotifier.sendMessagetoUser(users, channelid.intValue(), "create");
	        flash("success", "Channel " + channelid + " with User " + userid +  " has been created");
	        Logger.info("Channel " + channelid + " with User " + userid +  " has been created");
	        return editchannel((long) channelid);
		}
		return editchannel((long) channelid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}

public static Result deletegroupchannel(Long groupid, Long channelid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	List<Integer> users = new ArrayList<Integer>();
	if(uid != -1)
	{
		Channel tmp = Channel.find.byId(channelid.intValue());
		Groups tmp2 = Groups.find.byId(groupid.intValue());
		if(tmp.groups.contains(tmp2))
		{
			tmp.groups.remove(tmp2);
			tmp.save();
			List<Integer> stayusers = models.Channel.getChannelUsers(channelid.intValue());
	      	for (Iterator<models.User> useriter = models.User.getChannelGroupUser(Groups.getChannelGroups(channelid.intValue())).iterator(); useriter.hasNext();){
	      		int stayuser = useriter.next().id;
	      		if (!stayusers.contains(stayuser))
	      			stayusers.add(stayuser);
	      	}
	    	for (Iterator<models.User> iter = models.Groups.getUsersForGroup(groupid.intValue()).iterator(); iter.hasNext();){
				int tmpuser = iter.next().id;
				if (!stayusers.contains(tmpuser))
					users.add(tmpuser);
			}
	      	WebsocketNotifier.sendMessagetoUser(stayusers, channelid.intValue(), "update");
	    	WebsocketNotifier.sendMessagetoUser(users, channelid.intValue(), "delete");
	        flash("success", "Channel " + channelid + " with Group " + groupid +  " has been deleted");
	        Logger.info("Channel " + channelid + " with Group " + groupid +  " has been deleted");
	        return editchannel((long) channelid);
		}
		return editchannel((long) channelid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}

public static Result addgroupchannel(Long groupid, Long channelid) {
	
	String user = session("userid");
	int uid = verifyAdmin();
	if(uid != -1)
	{
		Channel tmp = Channel.find.byId(channelid.intValue());
		Groups tmp2 = Groups.find.byId(groupid.intValue());
		if(!tmp.groups.contains(tmp2))
		{	
			List<Integer> oldusers = models.Channel.getChannelUsers(channelid.intValue());
			List<Integer>users  = new ArrayList<Integer>(); 
			for (Iterator<models.User> useriter = models.User.getChannelGroupUser(Groups.getChannelGroups(channelid.intValue())).iterator(); useriter.hasNext();){
		  		int olduser = useriter.next().id;
		  		if (!oldusers.contains(olduser))
		  			oldusers.add(olduser);
		  	}
			tmp.groups.add(tmp2);
			tmp.save();
			for (Iterator<models.User> iter = models.Groups.getUsersForGroup(groupid.intValue()).iterator(); iter.hasNext();){
				models.User usr = iter.next();
				if (!oldusers.contains(usr.id))
					users.add(usr.id);	
			}

			WebsocketNotifier.sendMessagetoUser(oldusers, channelid.intValue(), "update");
			WebsocketNotifier.sendMessagetoUser(users, channelid.intValue(), "create");
	        flash("success", "Channel " + channelid + " with Group " + groupid +  " has been created");
	        Logger.info("Channel " + channelid + " with Group " + groupid +  " has been created");
	        return editchannel((long) channelid);
		}
		return editchannel((long) channelid);
	}
	else
	{
		return redirect(routes.Application.index());
	}
}
    
    public static Result editgroup(Long id) {
        Form<Groups> groupForm = form(Groups.class).fill(Groups.find.byId(id.intValue()));
        return ok(editgroup.render(id, groupForm, User.getUsername(Integer.parseInt(session("userid")))));
    }
    
    public static Result updategroup(Long id) {
    	
    	int uid = verifyAdmin();
    	if(uid != -1)
    	{
	        Form<Groups> groupForm = form(Groups.class).bindFromRequest();
	        if(groupForm.hasErrors()) {
	        	Logger.error("Error while editing the existing Group " + groupForm.get().id);
	            return badRequest(editgroup.render(id, groupForm, User.getUsername(Integer.parseInt(session("userid")))));
	        }
	        groupForm.get().update(id.intValue());
	        WebsocketNotifier.notifyAllMembers(websocket.json.out.Group.geninitGroup());
	        flash("success", "Group " + groupForm.get().name + " has been updated");
        	Logger.info("Group " + groupForm.get().name + " with ID " + groupForm.get().id + " has been updated");
	        return index();
    	}
    	else
    	{
    		return redirect(routes.Application.index());
    	}
    }
    
    public static Result creategroup() {
		Form<Groups> groupForm = form(Groups.class);
	    return ok(creategroup.render(groupForm, User.getUsername(Integer.parseInt(session("userid")))));
	}
    
    public static Result savegroup() {
    	
    	int uid = verifyAdmin();
    	if(uid != -1)
    	{
    		Form<Groups> groupForm = form(Groups.class).bindFromRequest();
            if(groupForm.hasErrors()) 
            {
            	Logger.error("Error while creating a new Group");
                return badRequest(creategroup.render(groupForm, User.getUsername(Integer.parseInt(session("userid")))));
            }
            groupForm.get().save();
            WebsocketNotifier.notifyAllMembers(websocket.json.out.Group.geninitGroup());
            flash("success", "Group " + groupForm.get().name + " has been created");
        	Logger.info("Group " + groupForm.get().name + " with ID " + groupForm.get().id + " has been created");
            return index();
    	}
    	else
    	{
    		return redirect(routes.Application.index());
    	}
    }
    
    public static Result deletegroup(Long id) {
    	
    	String user = session("userid");
    	int uid = verifyAdmin();
    	if(uid != -1)
    	{
    		List<Channel> chanlist = Groups.getChannelsForGroup(id.intValue()); 
    		for (Channel chan: chanlist)
    		{
    			chan.groups.remove(Groups.find.byId(id.intValue()));
    			chan.save();
    		}
    		List<User> userlist = Groups.getUsersForGroup(id.intValue()); 
    		for (User use: userlist)
    		{
    			use.groups.remove(Groups.find.byId(id.intValue()));
    			use.save();
    		}
    		
	        Groups.find.ref(id.intValue()).delete();
	        WebsocketNotifier.notifyAllMembers(websocket.json.out.Group.geninitGroup());
	        flash("success", "Group " + id + " has been deleted");
	        Logger.info("Group " + id + " has been deleted");
	        return index();
    	}
    	else
    	{
    		return redirect(routes.Application.index());
    	}
    }
    
    public static Result deletefile(Long id) {
    	
    	String user = session("userid");
    	int uid = verifyAdmin();
    	if(uid != -1)
    	{
	        File.find.ref(id.intValue()).delete();
	        WebsocketNotifier.notifyAllMembers(websocket.json.out.Channel.genChannel("update", models.File.find.byId(id.intValue()).channels.get(0).id));
	        flash("success", "File " + id + " has been deleted");
	        Logger.info("File " + id + " has been deleted");
	        return index();
    	}
    	else
    	{
    		return redirect(routes.Application.index());
    	}
    }

    public static Result ajaxUsers(){
        // TODO: verifyAdmin if user is admin
        int groupId = Integer.parseInt(request().body().asFormUrlEncoded().get("groups")[0]);
        int channelId = Integer.parseInt(request().body().asFormUrlEncoded().get("channels")[0]);
        Logger.info("Got group id " + groupId + " and channel id " + channelId);
        List<User> users = User.findAll();
        return ok(admin_users.render(users));
    }
}
