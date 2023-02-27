module.exports = async ({ github, context, header }) => {
  const fs = require("fs").promises;
  const body = await fs.readFile("/tmp/result.txt", "utf8");

  const comment = [header, body].join("\n");
  console.log("comment length:  ", comment.length);

  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.number,
  });

  const botComment = comments.find(
    (comment) =>
      // github-actions bot user
      comment.user.id === 41898282 && comment.body.startsWith(header)
  );

  const commentFn = botComment ? "updateComment" : "createComment";

  await github.rest.issues[commentFn]({
    owner: context.repo.owner,
    repo: context.repo.repo,
    body: comment,
    ...(botComment
      ? { comment_id: botComment.id }
      : { issue_number: context.payload.number }),
  });
};
