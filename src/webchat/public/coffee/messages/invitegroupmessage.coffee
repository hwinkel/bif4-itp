window.WebChat or= {}

class InviteGroupMessage extends window.WebChat.Message

    constructor: (@groupId, @channelId, @value) ->
        super('invitegroup')


    serialize: ->
        data = 
            channel_id: @channelId
            group_id: @groupId
            value: @value
        return super(data)


window.WebChat.InviteGroupMessage = InviteGroupMessage