import { type NextApiRequest, type NextApiResponse } from 'next';
import * as Scry from 'scryfall-api';

const found = async (req: NextApiRequest, res: NextApiResponse) => {
  const sets = await Scry.Sets.all();

  res.status(200).json(sets);
};

export default found;
