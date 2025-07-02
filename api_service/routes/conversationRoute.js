const express = require('express');
const router = express.Router();

const AppError = require('../utils/AppError');

const Conversation = require('../model/Conversation');
const Group = require('../model/Group');

const { generateConversationId } = require('../middleware/generateId');


router.get("/", async (req, res, next) => {
    try {
        const response = await Conversation.find();
        if(response.length === 0) return next(new AppError("No conversation was found.", 404));
        res.status(200).json({
            success: true,
            message: "Success.",
            data: response
        })
    } catch (error) {
        return next(new AppError("External Server Error.", 500))
    }
})

router.get("/:id", async(req, res, next) => {
    try {
        const groupConversation = await Group.find({members_id: req.user.id}, {_id: 1});
        const groupIds = groupConversation.map(g => g._id);

        const response = await Conversation.find({
                                            $or:[
                                                {participant: req.user.id},
                                                {groupId: {$in: groupIds}}
                                            ]
                                            })
                                            .populate('participant', 'user_name avatar_url')
                                            .populate('groupId', 'group_name avatar_url')
                                            .sort({updateAt: -1});
        if(!response) return next(new AppError("Conversation not found.", 404))
        res.status(200).json({
            success: true,
            message: "Success.",
            data: response
        })

    } catch (error) {
        return next(new AppError("External Server Error.", 500))
    }
})

router.post("/", async (req, res, next) => {
    try {
       const newConversation = req.body;
       if(!newConversation) return next(new AppError("Required data.", 400));
       if(newConversation.type === 'direct') {
            const conversationId = generateConversationId(newConversation.participant);
            newConversation.conversationId = conversationId;
       }
       const conversation = new Conversation(newConversation);
       await conversation.save();
       res.status(200).json({success: true, message: "Conservation is created.", data: newConversation});
    } catch (error) {
        return next(new AppError("External Server Error.", 500))
    }
})

router.put("/", async (req, res, next) => {
    try {
        const filter = {};
        if (req.body.conversationId) filter.conversationId = req.body.conversationId;
        if (req.body.groupId) filter.groupId = req.body.groupId;

        const response = await Conversation.findOneAndUpdate(
            filter, 
            {
                participant: req.body.participant,
                lastMessage: {
                    from: req.body.lastMessage.from,
                    content: req.body.lastMessage.content,
                    createAt: req.body.lastMessage.createAt
                }
            }, 
            {new:true});
        if(!response) return next(new AppError("Can not find conversation to update.", 404));
        res.status(200).json({success: true, message: "Update success.", data: response});
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
})

router.delete("/:id", async(req, res, next) => {
    try {
        const response = await Conversation.findByIdAndDelete(req.params.id);
        if(!response) return next(new AppError("Conversation not found.", 404));
        res.status(200).json({success: true, message: "Update success.", data: response});
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
})

module.exports = router;