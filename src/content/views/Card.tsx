import './Card.css';
import HeartSVG from '@/assets/heart.svg';
import CrossSVG from '@/assets/cross.svg';
import SpeakerSVG from '@/assets/speaker.svg';
import MicSVG from '@/assets/mic.svg';
import { useEffect, useRef, useState } from 'react';

interface CardProps {
  selected: string;
}

const DEF_SCHMEA = {
  type: 'object',
  description: 'A comprehensive definition object for a single word.', // Optional: Describe the whole object
  properties: {
    synonyms: {
      type: 'array',
      description: 'A list of up to 3 words that have the same or similar meaning.', // Hint/Explanation
      maxItems: 3, // Hard limit on the number of items
      items: {
        type: 'string',
        description: 'A single synonym word.',
      },
    },
    definition: {
      type: 'string',
      description: 'A very short explanation of the word’s meaning, limited to 15 words. You must limit to 15 words.', // Hint for word count
      maxLength: 75, 
    },
    exampleSentence: {
      type: 'string',
      description: 'A short sentence using the word, limited to 15 words.', // Hint for word count
      maxLength: 75
    },
    phoneticAlphabet: {
      type: 'string',
      description: 'The phonetic spelling of the word using the International Phonetic Alphabet (IPA).', // Hint/Explanation
    },
    partsOfSpeech: {
      type: 'string',
      description: 'The grammatical category of the word (e.g., noun, verb, adjective).', // Hint/Explanation
      enum: ["noun", "verb", "adjective", "adverb", "preposition", "conjunction", "interjection"] // Optional: Restrict possible values
    }
  }
};

export default function Card({ selected }: CardProps) {
  const session = useRef(null);
  const [loading, setLoading] = useState(true);
  const [syns, setSyns] = useState<string[]>([]);
  const [def, setDef] = useState('');
  const [phon, setPhon] = useState('');
  const [part, setPart] = useState('');
  const [example, setExample] = useState('');

  const removeSession = () => {
    if (session.current) {
      session.current.destroy();
    }
  };

  async function runPrompt(prompt, params, schema = {}) {
    console.log('runPromp() called with schema: ', schema);
    try {
      if (!session.current) {
        session.current = await LanguageModel.create(params);
      }
      return session.current.prompt(prompt, { responseConstraint: schema });
    } catch (e) {
      console.log('Prompt failed');
      console.error(e);
      console.log('Prompt:', prompt);
      // Reset session
      removeSession();
      throw e;
    }
  }

  useEffect(() => {
    let mounted = true;
    const initModel = async () => {
      setLoading(true);
      try {
        const params = {
          initialPrompts: [
            { role: 'system', content: 'You are a helpful and friendly assistant who gives short and concise answers.' },
          ],
        };
        const response = await runPrompt('Give definition of ' + selected, params, DEF_SCHMEA);
        console.log('card prompt');
        console.log(response);
        const parsed = JSON.parse(response);
        setSyns(parsed['synonyms']);
        setPart(parsed['partsOfSpeech']);
        setExample(parsed['exampleSentence']);
        setDef(parsed['definition']);
        setPhon(parsed['phoneticAlphabet']);

        if (mounted) setLoading(false);
      } catch (e) {
        console.error(e);
        if (mounted) setLoading(false);
      }
    };
    initModel();
    return () => {
      mounted = false;
      removeSession();
    };
  }, [selected]);

  return (
    <>
      <div className={`card-root${loading ? ' loading' : ''}`}>
        {loading && (
          <div className="card-full-skeleton" aria-hidden>
            <div className="card-full-shimmer" />
          </div>
        )}
        {/* keep props.msg referenced so lint/TS doesn't mark it unused */}
        <div className="card-gradient" />
        <div className="card-panel" />
        <div className="card-header">
          <div className="card-header-inner">
            <span className="card-title">{selected}</span>
            <span className="card-subtle">{part}</span>
            <span className="card-subtle">
              <img src={HeartSVG} />
            </span>
          </div>
        </div>
        <div className="icon-slot pos-1">
          <div className="icon-slot circle" />
          <img src={MicSVG} className="icon-inner" />
        </div>
        <div className="icon-slot pos-2">
          <div className="icon-slot circle" />
          <img src={SpeakerSVG} />
        </div>
        <div className="phonetic">
          <span className="phonetic-text">{phon}</span>
          <span className="phonetic-spacer"> </span>
        </div>
        <div className="label">Definition</div>
        <div className="definition">
          {def}
        </div>
        <div className="example">Example Sentence</div>
        <div className="example-text">
          "{example}”
        </div>
        <div className="synonyms">Synonyms</div>
        <div className="chips">
          {syns && syns.length > 0 ? (
            syns.map((syn, i) => (
              <div key={i} className="chip">
                {syn}
              </div>
            ))
          ) : (
            <div className="chip">—</div>
          )}
        </div>
        {/* 
        <div className="small-square">
          <div className="small-square-inner">
            <div className="small-square-fill" />
          </div>
        </div>
        */}
        <div className="top-right-dot">
          <img src={CrossSVG} />
        </div>
        <div className="word-library">
          <div className="label">Word Library</div>
          <div className="small-rect">
            <div className="fill" />
          </div>
        </div>
      </div>
    </>
  );
}
