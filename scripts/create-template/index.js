// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require("aws-sdk");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

const ses = new AWS.SES({
  apiVersion: "2010-12-01",
  region: "us-east-1",
});

const main = async () => {
  await ses
    .deleteTemplate({
      TemplateName: "CryptoIncomeStatement",
    })
    .promise();

  const html = fs.readFileSync(__dirname + "/template.html");

  await ses
    .createTemplate({
      Template: {
        TemplateName: "CryptoIncomeStatement",
        SubjectPart: "Crypto Income statement",
        HtmlPart: html.toString(),
      },
    })
    .promise();
};

main()
  .then(() => process.exit())
  .catch(console.error);
