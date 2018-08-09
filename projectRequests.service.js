const mongodb = require('../mongodb')
const moment = require('moment')
const conn = mongodb.connection
const ObjectId = mongodb.ObjectId

module.exports = {
    readAll: readAll
    , readAllStatusEvaluation: readAllStatusEvaluation
    , readById: readById
    , create: create
    , update: update
    , delete: _delete
    , changeEvalStatus: changeEvalStatus
    , getScoringData: getScoringData
    , getProjectRequestByDate: getProjectRequestByDate
    , populateScorecard: populateScorecard
    , prioritizeRequests
    , findAndModify
}


//removed functions i didn't write


function readAll() {
    return conn.db().collection("projectRequestPartThree").find()
        .map(request => {
            request._id = request._id.toString()
            return request
        })
        .toArray()
}

function readAllStatusEvaluation(id) {
    return conn
        .db()
        .collection("projectRequestPartThree")
        .aggregate([
            {
                $match: { evaluationBoardMemberIds: { $nin: [ObjectId(id)] } }
            },
            {
                $sort: { createDate: 1 }
            },
        ])
        .map(request => {
            request._id = request._id.toString()
            return request
        })
        .toArray()
}


function populateScorecard(id) {
    const aggregateData = [
        {
            $match: {
                 proposalId: ObjectId(id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "evaluatingUser",
                foreignField: "_id",
                as: "attachedUser"
            }
        },
        {
            $unwind: "$attachedUser"
        },
        {
            $project: {
                // attachedUser : 1,
                firstName : "$attachedUser.firstName",
                lastName : "$attachedUser.lastName",
                perceivedScalability : 1,
                perceivedSuccess : 1,
                valueStrategies : 1,
                projectValue : 1,
                // evaluatingUser : 1
            }
        }
    ];
    return conn
        .db()
        .collection("evalAndRank")
        .aggregate(aggregateData)
        .toArray()
}

//removed functions i didn't write

