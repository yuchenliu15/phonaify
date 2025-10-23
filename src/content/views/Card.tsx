import './Card.css';
import HeartSVG from '@/assets/heart.svg';
// CrossSVG intentionally removed (unused) to avoid lint errors
import SpeakerSVG from '@/assets/speaker.svg';
import MicSVG from '@/assets/mic.svg';
import { useEffect, useRef, useState } from 'react';

// Minimal ambient declaration for the external LanguageModel global used in this project.
declare global {
  interface LanguageModelType {
    create: (opts?: any) => Promise<any>;
    params?: () => Promise<any>;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var LanguageModel: LanguageModelType;
}

interface CardProps {
  selected: string;
}

const ANALYZING = 'Analyzing your pronunciation...';
const INCORRECT = "You're almost correct, try again!";
const CORRECT = 'Perfect score!';
const INIT = 'Try recording pronunciation w/ mic :)';

type Status = typeof ANALYZING | typeof INCORRECT | typeof CORRECT | typeof INIT;

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

// AUDIO_SCHEMA will be created inside the recording handler to include the current `selected` word.

export default function Card({ selected }: CardProps) {
  const session = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  // Media recording refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);
  const [status, setStatus] = useState<Status>(INIT);
  const [userIPA, setUserIPA] = useState('');
  const [pronScore, setPronScore] = useState<number>(0);
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

  // Recording constraints
  const MAX_RECORDING_MS = 10000; // upper bound: 10s
  const MIN_RECORDING_MS = 200; // ignore very short clips

  const startListening = async (ev?: React.MouseEvent | React.TouchEvent) => {
    ev && (ev as any).preventDefault?.();
    setUserIPA('');
    setPronScore(null);
    setElapsedMs(0);
    setRecording(true);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const options: MediaRecorderOptions = {};
      // try to pick a common mimeType if available
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      }

      const recorder = new MediaRecorder(stream, options);
      recorderRef.current = recorder;

      recorder.ondataavailable = ({ data }) => {
        if (data && data.size > 0) chunksRef.current.push(data);
      };

      recorder.onerror = (e) => console.error('MediaRecorder error', e);

      recorder.start();

      // timer to update elapsedMs
      const startTs = Date.now();
      recordTimerRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startTs);
      }, 100);

      // auto-stop at upper bound
      stopTimeoutRef.current = window.setTimeout(() => {
        // trigger the same stop flow
        stopListening();
      }, MAX_RECORDING_MS);
    } catch (err) {
      console.error('Failed to start recording', err);
      setRecording(false);
      setElapsedMs(0);
    }
  };

  const stopListening = async (ev?: React.MouseEvent | React.TouchEvent) => {
    ev && (ev as any).preventDefault?.();
    if (!recorderRef.current) {
      setRecording(false);
      setElapsedMs(0);
      return;
    }

    // stop timers and recorder
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    const recorder = recorderRef.current;
    const stream = mediaStreamRef.current;
    recorderRef.current = null;

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      try {
        recorder.state !== 'inactive' && recorder.stop();
      } catch (_) {
        resolve();
      }
    });

    setRecording(false);
    const elapsed = elapsedMs;
    setElapsedMs(0);

    // stop tracks
    try {
      stream?.getTracks().forEach((t) => t.stop());
    } catch (_) {}
    mediaStreamRef.current = null;

    // assemble blob
    const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
    chunksRef.current = [];

    if (elapsed < MIN_RECORDING_MS) {
      console.warn('Recording too short, ignoring');
      return;
    }

    // send to LanguageModel
    setStatus(ANALYZING);
    try {
      const arrayBuffer = await blob.arrayBuffer();

      // create a session for audio expected input
      let audioSession: any = null;
      try {
        // prefer to use LanguageModel.params if available
        const lm = LanguageModel as any;
        let createParams: any = { expectedInputs: [{ type: 'audio' }] };
        if (typeof lm?.params === 'function') {
          try {
            const p = await lm.params();
            if (p?.defaultTopK) createParams.topK = p.defaultTopK;
          } catch (_) {}
        }
        audioSession = await lm.create(createParams);
      } catch (e) {
        console.warn('Failed to create audio session with params, falling back', e);
        audioSession = await (LanguageModel as any).create({ expectedInputs: [{ type: 'audio' }] });
      }

      const promptText = `Analyze this user audio and give phonetic of user's pronunciation and put it in userIPA". Return JSON only with keys:userIPA,). Be concise.`;

      // Request the model synchronously (no streaming) since we already assemble the audio
      let collected: any = null;
      // build a local schema for this call that includes the specific selected target
      const callSchema = {
        type: 'object',
        description: `International Phonetic Alphabet of user input audio (userIPA)`,
        properties: {
          userIPA: { type: 'string' },
        },
        required: ['userIPA'],
      } as const;

      const simSchema = {
        type: 'object',
        description: `I want to see if I'm pronuncing the word correctly. Similarity score (0 to 100) measures how similar the word pronunciation of user audio is to actual word '${selected}'. Use pronunciation and International Phonetic Alphabet to compare also, i.e. how close is IPA of user pronunciation to standard IPA of the word.`,
        properties: {
          similarity: { type: 'number' },
        },
        required: ['similarity'],
      } as const;

      const response = await audioSession.prompt(
        [
          {
            role: 'user',
            content: [
              { type: 'text', value: promptText },
              { type: 'audio', value: arrayBuffer },
            ],
          },
        ],
        { responseConstraint: callSchema }
      );

      const responseSim = await audioSession.prompt(
        [
          {
            role: 'user',
            content: [
              { type: 'text', value: promptText },
              { type: 'audio', value: arrayBuffer },
            ],
          },
        ],
        { responseConstraint: simSchema}
      );

      if (typeof response === 'string') collected = response;
      else if (response?.content) collected = String(response.content);
      else collected = typeof response === 'object' ? JSON.stringify(response) : String(response);

      // try to parse JSON from collected string
      let parsed: any = null;
      let parsedSim: any = null;
      try {
        parsed = typeof collected === 'string' ? JSON.parse(collected) : collected;
        parsedSim = JSON.parse(responseSim);
      } catch (e) {
        try {
          const m = String(collected).match(/\{[\s\S]*\}/);
          parsed = m ? JSON.parse(m[0]) : null;
        } catch (_) {
          parsed = null;
        }
      }

      if (parsed && parsedSim) {
        setUserIPA(parsed.userIPA || '');
        setPronScore(
          typeof parsedSim.similarity === 'number'
            ? parsedSim.similarity
            : parsedSim.similarity
              ? Number(parsedSim.similarity)
              : null
        );
        setStatus(parsedSim.similarity >= 95 ? CORRECT : INCORRECT);
      } else {
        // fallback: show that analysis failed
        setUserIPA('—');
        setPronScore(0);
        setStatus(INCORRECT);
      }
    } catch (err) {
      console.error('Failed to analyze audio', err);
      setStatus(INIT);
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

        <div className="analyze">
          <span className="status">{status}</span>
          {(status === INCORRECT || status == CORRECT) && (
            <div className="scores">
              <div className="content-left">{userIPA}</div>
              <div className="vertical-divider"></div>
              <div className="content-right">{pronScore}%</div>
            </div>
          )}
        </div>

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
