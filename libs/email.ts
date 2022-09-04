import AWS from "aws-sdk";

const ses = new AWS.SES({
  apiVersion: "2010-12-01",
});

type IncomeItem = {
  asset: string;
  value: number;
  percent: number;
};

type IncomeTotal = {
  value: number;
  percent: number;
};

const buildIncomesContent = (items: IncomeItem[]) =>
  items
    .map((item) => {
      const itemClass = item.value > 0 ? "good" : "bad";
      const sign = item.value > 0 ? "+" : "";

      return `
<tr>
  <td width="20%" class="income_item" align="left">
    <span>
       <b>${item.asset}</b>
    </span>
  </td>
  <td width="40%" class="income_item ${itemClass}" align="right">
      <span>${sign}${item.value.toFixed()} $</span>
  </td>
  <td width="40%" class="income_item ${itemClass}" align="right">
    <span>${sign}${item.percent.toFixed(2)} %</span>
  </td>
</tr>`;
    })
    .join("\n");

const buildTotalContent = (item: IncomeTotal) => {
  const itemClass = item.value > 0 ? "good" : "bad";
  const sign = item.value > 0 ? "+" : "";

  return `
<tr>
  <td width="40%" class="income_footer" align="left">
    <p class="income_total income_total--label">Total</p>
  </td>
  <td width="30%" class="income_footer ${itemClass}" align="right">
    <p class="income_total">${sign}${item.value.toFixed()} $</p>
  </td>
  <td width="30%" class="income_footer ${itemClass}" align="right">
    <p class="income_total">${sign}${item.percent.toFixed(2)} %</p>
  </td>
</tr>`;
};

export const sendEmail = (incomes: IncomeItem[], total: IncomeTotal) => {
  if (!process.env.SENDER_EMAIL || !process.env.RECIPIENT_EMAIL) return;

  const params = {
    Source: process.env.SENDER_EMAIL,
    Destination: {
      ToAddresses: [process.env.RECIPIENT_EMAIL],
    },
    Template: "CryptoIncomeStatement",
    TemplateData: JSON.stringify({
      income_id: new Date().valueOf().toString(16),
      income_date: new Date().toDateString(),
      incomees_items: buildIncomesContent(incomes),
      incomees_total: buildTotalContent(total),
    }),
  };

  return ses.sendTemplatedEmail(params).promise();
};
