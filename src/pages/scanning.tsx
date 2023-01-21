import styles from './index.module.scss';
import { type NextPage } from 'next';
import * as Scry from 'scryfall-sdk';
import Head from 'next/head';
import Pusher from 'pusher-js';
import { trpc } from '../utils/trpc';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import useSound from 'use-sound';
import { priceFormatter } from '@/utils/helpers';

interface CardScannedData {
  card: Scry.Card | null;
  printings: Scry.Card[];
  set: Scry.Set | null;
}

const Scanning: NextPage = () => {
  const [playScanBeepDefault] = useSound('/sounds/scan_beep_default.mp3');
  const [playScanBeepGood] = useSound('/sounds/scan_beep_good.mp3');
  const [playScanBeepGreat] = useSound('/sounds/scan_beep_great.mp3');
  const [playScanStart] = useSound('/sounds/scan_start.mp3');

  const [{ card, set, printings }, setCardData] = useState<CardScannedData>({
    card: null,
    printings: [],
    set: null,
  });

  const [shouldOpenWizards, setShouldOpenWizards] = useState(false);

  useEffect(() => {
    const pusher = new Pusher('app-key', {
      wsHost: '127.0.0.1',
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
    });

    const channel = pusher.subscribe('scan');

    channel.bind('card-scanned', function (data: CardScannedData) {
      setCardData(data);
      console.log(data.printings);

      const price = Number(
        data.card?.prices?.usd || data.card?.prices?.usd_foil || 0
      );
      if (price > 10) {
        playScanBeepGreat();
      } else if (price > 1) {
        playScanBeepGood();
      } else {
        playScanBeepDefault();
      }

      if (shouldOpenWizards) {
        console.log(2);
        window.open(
          `https://www.kanatacg.com/buylist/search?query=${data.card?.name.replace(
            /\s/g,
            '+'
          )}`,
          '_blank'
        );
      }
    });

    return () => {
      pusher.unsubscribe('scan');
    };
  }, [
    playScanBeepDefault,
    playScanBeepGood,
    playScanBeepGreat,
    shouldOpenWizards,
  ]);

  return (
    <>
      <Head>
        <title>Magic Rabbit!</title>
        <meta
          name="description"
          content="MTG card inventory and scanning system"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Magic Rabbit</h1>

          <div className={styles.card}>
            <a href={card?.scryfall_uri} target="_blank" rel="noreferrer">
              <img
                className={styles.card__image}
                alt={card?.name || 'mtg card'}
                width={488}
                height={680}
                src={card?.image_uris?.normal || '/images/mtg_card_back.webp'}
              />
            </a>

            <div className={styles.card__content}>
              <label>
                <input
                  onChange={() => setShouldOpenWizards((prev) => !prev)}
                  type="checkbox"
                  checked={shouldOpenWizards}
                />
                <span>Open WizardsTower buylist</span>
              </label>

              <h2 className={styles.card__title}>
                <div>{card?.name || 'Waiting for scan...'}</div>
              </h2>

              {card && (
                <div className={styles.card__details}>
                  {/* {set && (
                    <img
                      alt="card set svg icon"
                      width={48}
                      height={48}
                      src={set.icon_svg_uri}
                      className={styles.card__setIcon}
                    />
                  )} */}

                  {card.prices && (
                    <div className={styles.card__price}>
                      {priceFormatter.format(Number(card.prices.usd))} /{' '}
                      {priceFormatter.format(Number(card.prices.usd_foil))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Scanning;
