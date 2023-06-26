import request from 'request';
import express from 'express'
import { config } from 'dotenv';
import bodyParser from 'body-parser';
import cron, { schedule } from 'node-cron'

config();

const app = express();
const port = process.env.PORT || 6000
const lineToken = process.env.LineNotifyToken
const totalTimers = parseInt(process.env.TOTAL_TIMERS) || 0;

console.log(totalTimers)


// app.use(cors())
app.use(bodyParser.json())

app.listen(port, () => {
    console.log(`app running on port ${port}`)
})

app.get(`/api/`, (req, res) => {
    res.json({ message: 'connect api sucessfully' })
})

function sendLineNotifyMessage(message) {
    const lineToken = process.env.LineNotifyToken;

    request.post({
        url: 'https://notify-api.line.me/api/notify',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${lineToken}`
        },
        form: {
            message: message
        }
    }, (err, httpResponse, body) => {
        if (err) {
            console.error('Error sending Line Notify message:', err);
        } else {
            console.log('Line Notify message sent:', body );
        }
    });
}


app.post(`/api/linesendnotify`, (req, res) => {
    const message = req.body.message;

    request(
        {
            method: "POST",
            uri: "https://notify-api.line.me/api/notify",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${lineToken}`,
            },
            form: {
                message: `Message: ${message}`,
            },
        },
        (err, httpResponse, body) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                // console.log(body);
                res.json({ message: 'success' });
            }
        }
    );
});




const schedules = Object.keys(process.env)
    .filter(key => key.startsWith('SCHEDULE_'))
    .map(key => process.env[key]);

// Determine the schedule count
const scheduleCount = schedules.length;

console.log(`Schedule count: ${scheduleCount}`)

// Schedule the function for each schedule
schedules.forEach((schedule) => {
    cron.schedule(schedule, () => {
        const minute = schedule.slice(0,2);
        const hour = schedule.slice(3,5)
        sendLineNotifyMessage(`function running at ${hour} : ${minute}`);
    }, {
        timezone: 'Asia/Bangkok'
    });
});




