#!/usr/bin/env node

const { program } = require("commander");
const axios = require("axios");
const ical = require("ical");
const chalk = require("chalk");
const figlet = require("figlet");
const Preferences = require("preferences");

let prefs = new Preferences(
  "alend",
  {
    feed: null,
  },
  {
    encrypt: false,
    format: "yaml",
  }
);

program.version("1.0.0").description("Get latest events from moodle");

program.command("config").action(() => {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question("Enter feed url: ", (url) => {
    prefs.feed = url;
    readline.close();
  });
});

program.action(main);

program.parse();

function strParse(str, length) {
  return str.length > length
    ? str.substr(0, length - 4) + "..."
    : str + " ".repeat(length - str.length - 1);
}

async function main() {
  const COLUMNS = process.stdout.columns;

  const feed = prefs.feed;

  if (!feed) {
    console.error(chalk.red("No feed url provided, run alend config"));
    return;
  }

  console.info(
    chalk.yellow(figlet.textSync("alend", { horizontalLayout: "full" }))
  );
  console.info(chalk.blue("Getting events from moodle..."));
  console.info("");

  const { data } = await axios.get(feed);

  const events = ical.parseICS(data);

  for (const key in events) {
    const event = events[key];

    const summary = chalk.green(strParse(event.summary, COLUMNS - 10));

    const day = Intl.DateTimeFormat("es", { weekday: "long" }).format(
      event.start
    );

    const url = event.url;

    const datetime = chalk.blue(strParse(day, 10));
    console.info(summary, datetime);

    if (url) console.info(chalk.blue(url));

    console.info("-".repeat(COLUMNS));
  }
}
