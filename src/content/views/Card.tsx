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
      description:
        'A very short explanation of the word’s meaning, limited to 15 words. You must limit to 15 words.', // Hint for word count
      maxLength: 75,
    },
    exampleSentence: {
      type: 'string',
      description: 'A short sentence using the word, limited to 15 words.', // Hint for word count
      maxLength: 75,
    },
    phoneticAlphabet: {
      type: 'string',
      description:
        'The phonetic spelling of the word using the International Phonetic Alphabet (IPA).', // Hint/Explanation
    },
    partsOfSpeech: {
      type: 'string',
      description: 'The grammatical category of the word (e.g., noun, verb, adjective).', // Hint/Explanation
      enum: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection'], // Optional: Restrict possible values
    },
  },
};

export default function Card({ selected }: CardProps) {
  const session = useRef(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const [userIPA, setUserIPA] = useState('');
  const [targetIPA, setTargetIPA] = useState('');
  const [pronScore, setPronScore] = useState<number | null>(null);
  const [syns, setSyns] = useState<string[]>([]);
  const [def, setDef] = useState('');
  const [phon, setPhon] = useState('');
  const [part, setPart] = useState('');
  const [example, setExample] = useState('');

  const onSpeakerClick = () => {
    // 1. Check for browser support
    if ('speechSynthesis' in window) {
      // 2. Create a new utterance object
      const utterance = new SpeechSynthesisUtterance(selected);

      // Optional: Set properties for pronunciation control
      utterance.rate = 1; // Speed (0.1 to 10)
      utterance.pitch = 1.2; // Pitch (0 to 2)
      // utterance.voice = /* choose from speechSynthesis.getVoices() */;

      // 3. Speak the word
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Your browser does not support the Web Speech API.');
    }
  };

  // microphone click/hold handled by startListening/stopListening

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
            {
              role: 'system',
              content:
                'You are a helpful and friendly assistant who gives short and concise answers.',
            },
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

  // Start speech recognition (hold-to-record). Uses Web Speech API when available.
  const startListening = (ev?: React.MouseEvent | React.TouchEvent) => {
    if (ev && typeof (ev as any).preventDefault === 'function') (ev as any).preventDefault();
    setTranscript('');
    setUserIPA('');
    setTargetIPA('');
    setPronScore(null);
    setRecording(true);
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported');
      setRecording(false);
      return;
    }
    try {
      const r = new SpeechRecognition();
      r.lang = 'en-US';
      r.interimResults = true;
      r.maxAlternatives = 1;
      r.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) final += res[0].transcript + ' ';
          else interim += res[0].transcript + ' ';
        }
        setTranscript((final || interim).trim());
      };
      r.onerror = (e: any) => {
        console.error('SpeechRecognition error', e);
        setRecording(false);
      };
      r.onend = () => {
        // onend will fire after stop(); keep recording state false
        setRecording(false);
      };
      recognitionRef.current = r;
      r.start();
    } catch (e) {
      console.error('Failed to start SpeechRecognition', e);
      setRecording(false);
    }
  };

  // Stop listening and send transcript to model to get IPA and similarity
  const stopListening = async (ev?: React.MouseEvent | React.TouchEvent) => {
    if (ev && typeof (ev as any).preventDefault === 'function') (ev as any).preventDefault();
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    } catch (e) {
      console.error('Error stopping recognition', e);
    }
    setRecording(false);
    const finalTranscript = transcript.trim();
    if (!finalTranscript) return;

    // Ask the model for IPA of both the target and the user's utterance and a similarity score
    setLoading(true);
    try {
      const params = {
        initialPrompts: [
          { role: 'system', content: 'You are a helpful assistant. Return concise JSON.' },
        ],
      };
      const promptText = `Given the target word: "${selected}" and the user's spoken utterance (transcript): "${finalTranscript}", return JSON only with keys: targetIPA (IPA for the target word), userIPA (IPA for the user's utterance), similarity (0-100 integer where 100 means identical), match (true/false if pronunciation matches). Example: {"targetIPA":"/.../","userIPA":"/.../","similarity":85,"match":false}`;
      const response = await runPrompt(promptText, params, {});
      console.log('pronunciation response', response);
      let parsed: any = null;
      try {
        parsed = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (e) {
        try {
          const str = typeof response === 'string' ? response : JSON.stringify(response);
          const m = str.match(/\{[\s\S]*\}/);
          parsed = m ? JSON.parse(m[0]) : null;
        } catch (_e) {
          parsed = null;
        }
      }
      if (parsed) {
        setTargetIPA(parsed.targetIPA || parsed.target_ipa || '');
        setUserIPA(parsed.userIPA || parsed.user_ipa || '');
        setPronScore(
          typeof parsed.similarity === 'number'
            ? parsed.similarity
            : parsed.similarity
              ? Number(parsed.similarity)
              : null
        );
      } else {
        // fallback: ask model to provide IPA from transcript text directly
        // (we can call runPrompt again with a different prompt, but for now set userIPA to transcript)
        setUserIPA(finalTranscript);
      }
    } catch (err) {
      console.error('Failed to get pronunciation from model', err);
    } finally {
      setLoading(false);
    }
  };

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

        <div className="card-body">
          <div className="card-header">
            <span className="card-title">{selected}</span>
            <span className="card-subtle">{part}</span>
            <span className="card-subtle">
              <img src={HeartSVG} />
            </span>
          </div>

          <div className="phonetic-group">
            <div className="phonetic">
              <span className="phonetic-text">{phon}</span>
            </div>
            {/*
              <div className="user-pronunciation">
                <div className="ipa-row">
                  <span className="ipa-label">Target IPA:</span>
                  <span className="ipa-value">{targetIPA || phon}</span>
                </div>
                <div className="ipa-row">
                  <span className="ipa-label">Your IPA:</span>
                  <span className="ipa-value">{userIPA || (transcript ? transcript : '—')}</span>
                </div>
                {pronScore !== null && (
                  <div className="ipa-score">Score: {pronScore}</div>
                )}
              </div>

                */}
            <div className="icons-group">
              <div
                className={`icon-slot pos-1${recording ? ' recording' : ''}`}
                onMouseDown={startListening}
                onMouseUp={stopListening}
              >
                <div className="icon-slot circle" />
                <img src={MicSVG} />
                {recording && <div className="mic-recording-indicator" />}
              </div>

              <div className="icon-slot pos-2" onClick={onSpeakerClick}>
                <div className="icon-slot circle" />
                <img src={SpeakerSVG} />
              </div>
            </div>
          </div>
          <div className="definition-group">
            <div className="label">Definition</div>
            <div className="definition">{def}</div>
          </div>
          <div className="example-group">
            <div className="example">Example Sentence</div>
            <div className="example-text">"{example}”</div>
          </div>
          <div className="synonyms-group">
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
          </div>
        </div>
        {/* 
        <div className="small-square">
          <div className="small-square-inner">
            <div className="small-square-fill" />
          </div>
        </div>
        */}
        {/*
        <div className="top-right-dot">
          <img src={CrossSVG} />
        </div>
        */}
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
