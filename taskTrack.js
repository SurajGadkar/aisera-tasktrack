import fs from "fs";
import csvParser from "csv-parser";

const logData = [];

const calculateTimeSpentByUserPerTask = (logData) => {
  //To keep track of each user and the time spent of each task
  const taskDurationSpentByEachUser = {};
  const taskTrackMap = {};

  for (const data of logData) {
    const [timestamp, userId, taskId, eventType] = data;
    
    if (eventType === "Task Started") {
      // Add each task start in the map with key & value as [userId_task_id] = timestamp
      taskTrackMap[`${userId}_${taskId}`] = timestamp;
    } else if (eventType === "Task Stopped" || eventType === "Task Completed") {
      // If task is stopped or completed, calculate the time spent.
      const taskStopTime = timestamp;
      const taskStartTime = taskTrackMap[`${userId}_${taskId}`];

      // Check to make sure task is started before its completed.
      if (taskStartTime) {
        taskDurationSpentByEachUser[userId] =
          taskDurationSpentByEachUser[userId] || {};
        taskDurationSpentByEachUser[userId][taskId] =
          (taskDurationSpentByEachUser[userId][taskId] || 0) +
          taskStopTime -
          taskStartTime;
      }
    }
  }
  //console.log(taskTrackMap);
  return taskDurationSpentByEachUser;
};

const generateReport = (taskDuration) => {
  let report = "UserId, TaskId, Time Spent \n";

  for (let [userId, tasks] of Object.entries(taskDuration)) {
    for (let [taskId, timeSpent] of Object.entries(tasks)) {
      report += `${userId}     ${taskId}      ${timeSpent} \n`;
    }
    report += "\n";
  }
  return report;
};


const sortByTimestamp = (data) => {
  // using comparators to sort the data based on timestamp
  const sorted = data.sort( (a, b) => {
    return a[0] - b[0];
  })
  return sorted;
}

const parseData = (data) => {
  /*
        {
        'timestamp, userID, taskID, eventType': '1625234800, U01, T03, Task Completed'
        }
  */

  // Cleaning the csv parsed data and formatted in usable data.
  let values = [];
  data.forEach((d) => {
    values.push(d["timestamp, userID, taskID, eventType"]);
  });

  values.forEach((value, index) => {
    const splitted = value.split(", ");
    values[index] = splitted;
  });

  return values;
};



// Pass the file from terminal
const file = process.argv[2];

// Read the passed file
fs.createReadStream(file)
  .pipe(csvParser())
  .on("data", (row) => {
    logData.push(row);
  })
  .on("end", () => {
    //
    const parsedData = parseData(logData);
    const sorted = sortByTimestamp(parsedData);
    const task = calculateTimeSpentByUserPerTask(sorted);
    const report = generateReport(task);
    console.log(report);
    return report;
  });
