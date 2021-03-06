import * as jwt from "jsonwebtoken";
import Schemas = require('../schema');
import _ = require('lodash');
import { User } from '../entities/all';
import config = require("../config");

export async function getPolls(req, res) {
    const authCookie = req.cookies.jwt;
    const jwtData = jwt.decode(authCookie);
    const all: Schemas.Poll[] = await Schemas.Poll.find() as any;
    const pollsWithSubjects: any = _.groupBy(all, b => b.pollName);
    if (jwtData["type"] === "admin") {
        _.forEach(_.keys(pollsWithSubjects), a => {
            pollsWithSubjects[a] = _.groupBy(pollsWithSubjects[a], d => d.subjectName);
            _.forEach(_.keys(pollsWithSubjects[a]), b => pollsWithSubjects[a][b] = _.first(pollsWithSubjects[a][b])["voteCount"]);
        }
        );
        return res.status(200).send({ poll: pollsWithSubjects, type: "admin" });
    }
    if (jwtData["type"] === "user") {
        _.forEach(
            _.keys(pollsWithSubjects), c =>
                pollsWithSubjects[c] = _.map(pollsWithSubjects[c], d => pollsWithSubjects[c] = d.subjectName
                )
        );
        return res.status(200).send({ poll: pollsWithSubjects, type: "user" });
    }
}

export async function addPoll(req, res) {
    const { pollName, subjects } = req.body;
    const authCookie = req.cookies.jwt;
    const jwtData = jwt.decode(authCookie);
    if (jwtData["type"] === "admin") {
        const subjectsNames = subjects.split(' ').join('').split(',');
        const polls = _.map(subjectsNames, subjectName => ({ pollName, subjectName }));
        const existingPoll = await Schemas.Poll.findOne({ pollName });
        if (existingPoll) {
            return res.status(400).send({ message: 'Poll already exists' });
        }
        const users: User[] = await User.select().all();
        const queries = _.map(users, user => {
            let pollVotes = JSON.parse(user.pollVotes as string);
            pollVotes[pollName] = 0;
            pollVotes = JSON.stringify(pollVotes);
            return User.update({ pollVotes }).where(User.embg.equals(user.embg)).exec();
        });
        queries.push(Schemas.Poll.insertMany(polls));
        try {
            await Promise.all(queries);
        } catch (err) {
            console.log(err);
            return res.status(500).send({ message: 'Something is wrong' });
        }
        return res.status(201).send({ message: `Successfully added ${pollName}` });
    } else {
        return res.status(401).send({ message: "Only admins can add polls" });
    }
}

export async function vote(req, res) {
    const { pollName, subjectName } = req.body;
    const authCookie = req.cookies.jwt;
    const jwtData = jwt.decode(authCookie);
    try {
        const user = await User.select(User.pollVotes).where(User.embg.equals(jwtData["embg"])).get();
        if (!user) {
            return res.status(400).send({ message: 'User does not exist' });
        }
        user.pollVotes = JSON.parse(user.pollVotes as string);
        if (user.pollVotes[pollName] >= config.maxVotes) {
            return res.status(406).send({ message: 'User has no votes remaining for that Poll' });
        }
        user.pollVotes[pollName]++;
        const pollSubject: Schemas.Poll = await Schemas.Poll.findOne({ subjectName, pollName }) as any;
        pollSubject.voteCount++;
        await Schemas.Poll
            .updateOne({ subjectName, pollName }, pollSubject);
        await User
            .update({ pollVotes: JSON.stringify(user.pollVotes) })
            .where(User.embg.equals(jwtData["embg"]))
            .exec();
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Something is wrong' });
    }
    return res.status(200).send({ message: 'Vote successfull' });
}
