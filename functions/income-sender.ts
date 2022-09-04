import { MainClient, SymbolPrice } from "binance";

import { sendEmail } from "libs/email";

export type Event = {
  symbols: string;
};

const client = new MainClient({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const getIncome = async (symbol: string) => {
  const trades = await client.getAccountTradeList({
    symbol: symbol,
    startTime: new Date("2022/07/01 00:00:00Z").getTime(),
  });

  const spendBalance = trades
    .map((it) => +it.price * +it.qty)
    .reduce((prev, curr) => prev + curr, 0);

  const sumQty = trades
    .map((it) => +it.qty)
    .reduce((prev, curr) => prev + curr, 0);

  const symbolPrice = await client.getSymbolPriceTicker({
    symbol: symbol,
  });

  const currentBalance = sumQty * +(symbolPrice as SymbolPrice).price;

  const value = currentBalance - spendBalance;
  const percent =
    currentBalance && spendBalance ? currentBalance / spendBalance - 1 : 0;

  return {
    asset: symbol.replace("USDT", ""),
    spendBalance,
    currentBalance,
    value,
    percent,
  };
};

const getIncomesTotal = async (symbols: string[]) => {
  const incomes = await Promise.all(symbols.map(getIncome));

  const spendBalance = incomes
    .map((it) => it.spendBalance)
    .reduce((prev, curr) => prev + curr, 0);
  const currentBalance = incomes
    .map((it) => it.currentBalance)
    .reduce((prev, curr) => prev + curr, 0);

  const value = currentBalance - spendBalance;
  const percent =
    currentBalance && spendBalance ? currentBalance / spendBalance - 1 : 0;

  return {
    value,
    percent,
  };
};

export const handler = async (event: Event) => {
  console.log("event", event);

  const symbols = event.symbols.split(",");

  try {
    const incomes = await Promise.all(symbols.map(getIncome));
    const total = await getIncomesTotal(symbols);

    const message = await sendEmail(incomes, total);

    console.log("message", message);

    return {
      statusCode: 200,
      body: {},
    };
  } catch (error) {
    console.log("error", error);

    return {
      statusCode: 500,
      body: error,
    };
  }
};
