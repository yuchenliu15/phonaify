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
  description: 'A comprehensive definition object for a single word.',
  properties: {
    synonyms: { type: 'array' },
    definition: { type: 'string' },
    exampleSentence: { type: 'string' },
    phoneticAlphabet: { type: 'string' },
    partsOfSpeech: { type: 'string' },
  },
};

export default function Card({ selected }: CardProps) {
  const session = useRef<any>(null);
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

  const removeSession = () => {
    if (session.current) {
      try {
        session.current.destroy();
      } catch (_) {}
      session.current = null;
    }
  };

  async function runPrompt(prompt: string, params: any, schema: any = {}) {
    try {
      if (!session.current) {
        // LanguageModel is assumed to be provided globally in this project
        session.current = await (LanguageModel as any).create(params);
      }
      return session.current.prompt(prompt, { responseConstraint: schema });
    } catch (e) {
      console.error('Prompt failed', e);
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
          initialPrompts: [{ role: 'system', content: 'You are a helpful assistant.' }],
        };
        const response = await runPrompt('Give definition of ' + selected, params, DEF_SCHMEA);
        try {
          const parsed = typeof response === 'string' ? JSON.parse(response) : response;
          setSyns(parsed.synonyms || []);
          setPart(parsed.partsOfSpeech || '');
          setExample(parsed.exampleSentence || '');
          setDef(parsed.definition || '');
          setPhon(parsed.phoneticAlphabet || '');
        } catch (e) {
          // fallback: use raw response
          console.warn('Failed parsing response', e);
          setDef(typeof response === 'string' ? response : JSON.stringify(response));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    initModel();
    return () => {
      mounted = false;
      removeSession();
    };
  }, [selected]);

  const startListening = (ev?: React.MouseEvent | React.TouchEvent) => {
    ev && (ev as any).preventDefault?.();
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
      r.onend = () => setRecording(false);
      recognitionRef.current = r;
      r.start();
    } catch (e) {
      console.error('Failed to start SpeechRecognition', e);
      setRecording(false);
    }
  };

  const stopListening = async (ev?: React.MouseEvent | React.TouchEvent) => {
    ev && (ev as any).preventDefault?.();
    try {
      recognitionRef.current?.stop?.();
    } catch (_) {}
    setRecording(false);
    const finalTranscript = transcript.trim();
    if (!finalTranscript) return;
    setLoading(true);
    try {
      const params = {
        initialPrompts: [
          { role: 'system', content: 'You are a helpful assistant. Return concise JSON.' },
        ],
      };
      const promptText = `Given the target word: "${selected}" and the user's spoken utterance (transcript): "${finalTranscript}", return JSON only with keys: targetIPA, userIPA, similarity (0-100), match (true/false)`;
      const response = await runPrompt(promptText, params, {});
      let parsed: any = null;
      try {
        parsed = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (e) {
        try {
          const str = typeof response === 'string' ? response : JSON.stringify(response);
          const m = str.match(/\{[\s\S]*\}/);
          parsed = m ? JSON.parse(m[0]) : null;
        } catch (_) {
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
        setUserIPA(finalTranscript);
      }
    } catch (err) {
      console.error('Failed to get pronunciation from model', err);
    } finally {
      setLoading(false);
    }
  };

  const onSpeakerClick = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(selected);
      utterance.rate = 1;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    } else alert('Your browser does not support the Web Speech API.');
  };

  return (
    <div className={`card-root${loading ? ' loading' : ''}`}>
      {loading && (
        <div className="card-full-skeleton" aria-hidden>
          <div className="card-full-shimmer" />
        </div>
      )}
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
          <div className="icons-group">
            <div
              className={`icon-slot pos-1${recording ? ' recording' : ''}`}
              onMouseDown={startListening}
              onMouseUp={stopListening}
              onTouchStart={startListening}
              onTouchEnd={stopListening}
            >
              <div className="icon-slot circle" />
              <img src={MicSVG} className="icon-inner" />
              {recording && <div className="mic-recording-indicator" />}
            </div>

            <div className="icon-slot pos-2" onClick={onSpeakerClick}>
              <div className="icon-slot circle" />
              <img src={SpeakerSVG} className="icon-inner" />
            </div>
          </div>
        </div>

        <div className="analyze" />

        <div className="card-scroll">
          <div className="definition-group">
            <div className="label">Definition</div>
            <div className="definition">{def}</div>
          </div>

          <div className="example-group">
            <div className="example">Example Sentence</div>
            <div className="example-text">"{example}"</div>
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
      </div>

      <div className="word-library">
        <div className="label">Word Library</div>
        <div className="small-rect">
          <div className="fill" />
        </div>
      </div>
    </div>
  );
}
