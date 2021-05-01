import { main } from "https://deno.land/x/denops_std@v0.8/mod.ts";

let token: string | undefined = undefined;
let statusEmoji: string;

const changeStatus = async (...args: Array<unknown>) => {
  const status = (args as Array<string>).join("");

  if (status === "") {
    console.log("[SlackStatus] Status is empty");
    return;
  }

  const profile = {
    profile: {
      status_text: status,
      status_expiration: Math.floor(Date.now() / 1000) + 1200,
      status_emoji: statusEmoji,
    },
  };

  const options = {
    method: "POST",
    body: JSON.stringify(profile),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Bearer ${token}`,
    },
  };

  await fetch("https://slack.com/api/users.profile.set", options);
};

main(async ({ vim }) => {
  token = Deno.env.get("SLACK_STATUS_TOKEN");

  if (token == null || token === "") {
    console.log("[SlackStatus] Token is not set");
    return;
  }

  statusEmoji = await vim.g.get(
    "slack_status_emoji",
    ":speech_balloon:",
  ) as string;

  const messageContent = await vim.g.get(
    "slack_status_message",
    '["I\'m coding ", &filetype]',
  ) as string;

  vim.register({ changeStatus });

  await vim.execute(
    `command! SlackStatusWrite call denops#notify("${vim.name}", "changeStatus", ${messageContent})`,
  );

  await vim.execute(`
augroup slack_status
  autocmd!
  autocmd BufWinEnter,WinEnter * SlackStatusWrite
augroup END
    `);
});
