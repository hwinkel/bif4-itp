window.WebChat or= {}

class InviteUserMessage extends window.WebChat.Message

    constructor: (@userId, @channelId, @value) ->
        super('inviteuser')


    serialize: ->
        data = 
            channel_id: @channelId
            user_id: @userId
            value: @value
        return super(data)


window.WebChat.InviteUserMessage = InviteUserMessage