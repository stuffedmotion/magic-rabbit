import { type NextApiRequest, type NextApiResponse } from 'next';
import * as Scry from 'scryfall-api';
import Pusher from 'pusher';

export const pusher = new Pusher({
  appId: 'app-id',
  key: 'app-key',
  secret: 'app-secret',
  host: '127.0.0.1',
  port: '6001',
  useTLS: false,
});

const found = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405);
  const { cardId, cardName } = <
    Partial<{
      [key: string]: string;
    }>
  >req.query;

  if (!cardName) return res.status(400);

  const printings = (
    await Scry.Cards.search(cardName, {
      unique: 'prints',
      order: 'released',
      dir: 'desc',
    }).all()
  ).filter((card) => card.name === cardName);

  const card = printings.find((card) => card.id === cardId);

  if (!card) return res.status(404);

  const response = await pusher.trigger('scan', 'card-scanned', {
    card,
    printings,
    set: {},
  });

  res.status(200).json(response);
};

export default found;
