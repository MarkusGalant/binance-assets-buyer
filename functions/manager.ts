import { MainClient } from "binance";

export type Event = {
  symbol: string;
  quoteOrderQty: number;
};

const client = new MainClient({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const handler = async (event: Event) => {
  console.log("event", event);

  try {
    const order = await client.submitNewOrder({
      side: "BUY",
      type: "MARKET",
      symbol: event.symbol,
      quoteOrderQty: event.quoteOrderQty,
    });

    console.log("order", order);

    return {
      statusCode: 200,
      body: order,
    };
  } catch (error) {
    console.log("error", error);

    if (error instanceof Error)
      return {
        statusCode: 500,
        body: error,
      };
  }
};
