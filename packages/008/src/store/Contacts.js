import vCard from 'vcf';

import { cleanPhoneNumber } from '../utils';

const elasticlunr = require('elasticlunr');
const { Level } = require('level');

elasticlunr.clearStopWords();

let CONTACTS_VCF_IDS = [];
let HASH = {};
let IDX;

const NGRAMLEN = 4;

const initIndex = () => {
  CONTACTS_VCF_IDS = [];
  HASH = {};

  IDX = elasticlunr(function () {
    this.setRef('id');
    this.addField('name');
    this.addField('phones');
    this.saveDocument(false);
  });
};

const index = ({ contacts, size = 100 } = {}) => {
  if (!contacts?.length) {
    document?.dispatchEvent(new Event('indexing:end'));
    return;
  }

  const long_tail_tokens = (str, ngramlen = NGRAMLEN, number) => {
    if (!str) return [];

    const tokens = (number ? str.replace(/\s/g, '') : str).split(' ');
    let ngrams = [];

    if (ngramlen > 0) {
      for (let j = 0; j < tokens.length; j++) {
        const token = tokens[j];
        for (let i = 0; i < token.length; i++) {
          ngrams = ngrams.concat(
            token.split('').map((_, idx) => token.substr(i, idx + 1))
          );
        }
      }
    }

    return tokens.concat(ngrams.filter(ngram => ngram.length >= ngramlen));
  };

  let indexed = 0;
  const max = Math.ceil(contacts.length / size);
  for (let i = 0; i < max; i++) {
    document?.dispatchEvent(new Event('indexing'));

    const from = i * size;
    const to = (i + 1) * size;
    const chunk = contacts.slice(from, to);

    // eslint-disable-next-line no-loop-func
    requestIdleCallback(async () => {
      try {
        chunk.forEach(async user => {
          if (user.id.startsWith('cvf-')) CONTACTS_VCF_IDS.push(user.id);

          HASH[user.id] = user;
          IDX.addDoc({
            id: user.id,
            name: long_tail_tokens(user.name, NGRAMLEN),
            phones: [].concat.apply(
              [],
              user.phones.map(number =>
                long_tail_tokens(cleanPhoneNumber(number), NGRAMLEN, true)
              )
            )
          });
        });
      } finally {
        indexed += chunk.length;

        if (indexed === contacts.length) {
          console.log('Indexing ended');
          document?.dispatchEvent(new Event('indexing:end'));
        }
      }
    });
  }
};

export const fromVCF = ({ vcf }) => {
  const cards = vCard.parse(vcf.replace(/\r?\n/g, '\r\n'));

  const contacts = cards
    .map((card, idx) => {
      try {
        const name = card.get('fn').valueOf();
        let phones = card.get('tel')?.valueOf();
        if (Array.isArray(phones)) {
          phones = phones.map(phone => phone.valueOf());
        } else if (phones) {
          phones = [phones.valueOf()];
        }

        const avatar = card.get('photo')?.valueOf();
        return { name, avatar, phones, id: `cvf-${idx}` };
      } catch (err) {
        console.error(err);
      }
    })
    .filter(contact => contact !== undefined);

  return contacts;
};

export default class Contacts {
  constructor() {
    initIndex();
    this.fs = new Level('KZCS', { valueEncoding: 'json' });
  }

  async load(id = 'contacts') {
    try {
      const { hash = {}, index } = (await this.fs.get(id)) || {};
      HASH = hash;

      if (index) {
        IDX = elasticlunr.Index.load(index);
        document?.dispatchEvent(new Event('indexing:end'));
      }
    } catch (err) {
      index({ users: [] });
    }
  }

  async save(id = 'contacts') {
    await this.fs.put(id, { hash: HASH, index: IDX.toJSON() });
  }

  async index({ vcf, contacts = [] }) {
    if (vcf) {
      CONTACTS_VCF_IDS.forEach(id => {
        IDX.removeDoc(HASH[id]);
        delete HASH[id];
      });
      CONTACTS_VCF_IDS = [];

      const contacts = fromVCF({ vcf })
        .filter(contact => contact?.phones?.length)
        .map(contact => ({ ...contact, vcf: true }));

      index({ contacts });
    }

    if (contacts.length) {
      index({ contacts });
    }
  }

  query({ query, max } = {}) {
    const result =
      !query || query.length < NGRAMLEN
        ? Object.values(HASH)
        : IDX.search(query, {}).map(({ score, ref }) => ({
            score,
            ...HASH[ref]
          }));

    const hits = result
      .slice(0, max || result.length)
      .filter(item => item.id !== undefined)
      .sort((a, b) => {
        if (a.score === b.score) return a.vcf ? 1 : -1;

        return b.score - a.score;
      });

    return { hits, total: result.length };
  }

  contact_by_phone({ phone = '' }) {
    const query = cleanPhoneNumber(phone).substr(-9);
    const { hits } = this.query({ query });
    const [contact] = hits;

    return contact;
  }

  clear() {
    initIndex();
    this.fs.clear();
  }
}
