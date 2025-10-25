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
const LISTENING = 'Listening...';
const INCORRECT = 'Orange marks sounds to improve!';
const CORRECT = 'Perfect!';
const INIT = 'Try recording pronunciation w/ mic :)';

type Status = typeof ANALYZING | typeof INCORRECT | typeof CORRECT | typeof INIT | typeof LISTENING;

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
  const [feedback, setFeedback] = useState<string>('');
  const [match, setMatch] = useState<boolean>(false);
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
    setElapsedMs(0);
    setRecording(true);
    setStatus(LISTENING);
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

      if (typeof response === 'string') collected = response;
      else if (response?.content) collected = String(response.content);
      else collected = typeof response === 'object' ? JSON.stringify(response) : String(response);

      // try to parse JSON from collected string
      let parsed: any = null;
      let parsedSim: any = null;
      try {
        parsed = typeof collected === 'string' ? JSON.parse(collected) : collected;
        const simSchema = {
          type: 'object',
          description: `I want to see if I'm pronuncing the word correctly. Give constructive feedback for pronunciation of user's pronunciation (${parsed.usreIPA}) is correct for '${phon}'. Point out the wrong phonetic alphabet made by the user. Be concise and brutally honest, no need to say incorrect, just the feedback`,
          properties: {
            feedback: { type: 'string' },
            match: { type: 'boolean' },
          },
          required: ['feedback', 'match'],
        } as const;

        const responseSim = await audioSession.prompt(
          [
            {
              role: 'user',
              content: [{ type: 'text', value: promptText }],
            },
          ],
          { responseConstraint: simSchema }
        );
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
        setFeedback(parsedSim.feedback);
        setMatch(parsedSim.match);
        setStatus(parsedSim.match ? CORRECT : INCORRECT);
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

  // render the status string but color only the literal word "Orange"
  const renderStatus = () => {
    const keyword = 'Orange';
    if (typeof status === 'string' && status.includes(keyword)) {
      const parts = status.split(keyword);
      // interleave parts with colored keyword spans
      return parts.flatMap((p, i) =>
        i === parts.length - 1
          ? [p]
          : [
              p,
              <span key={`kw-${i}`} className="orange-word">
                {keyword}
              </span>,
            ]
      );
    }
    return status;
  };

  // Simple LCS-based highlighter: marks characters in the correct phonetic string
  // that are NOT part of the longest common subsequence with the user's IPA.
  const split = (s: string) => Array.from(s || '');

  function buildLCSTable(a: string[], b: string[]) {
    const n = a.length,
      m = b.length;
    const table: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (a[i - 1] === b[j - 1]) table[i][j] = table[i - 1][j - 1] + 1;
        else table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
      }
    }
    return table;
  }

  function backtrackLCS(table: number[][], a: string[], b: string[]) {
    let i = a.length,
      j = b.length;
    const matches: Array<[number, number]> = [];
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        matches.push([i - 1, j - 1]);
        i--;
        j--;
      } else if (table[i - 1][j] >= table[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    matches.reverse();
    return matches;
  }

  const highlightPhon = (correctPhon: string, user: string): React.ReactNode => {
    const a = split(correctPhon);
    const b = split(user);
    if (a.length === 0 || b.length === 0) return correctPhon;
    const table = buildLCSTable(a, b);
    const matches = backtrackLCS(table, a, b);
    const matchedIndices = new Set(matches.map(([ia]) => ia));
    return a.map((ch, idx) => {
      if (ch.trim() === '') return ch;
      if (matchedIndices.has(idx)) return <span key={idx}>{ch}</span>;
      return (
        <span key={idx} className="orange-word">
          {ch}
        </span>
      );
    });
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
        </div>

        <div className="phonetic-group">
          <div className="phonetic">
            <span className="phonetic-text">{highlightPhon(phon, userIPA)}</span>
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
            </div>

            <div className="icon-slot pos-2" onClick={onSpeakerClick}>
              <div className="icon-slot circle" />
              <img src={SpeakerSVG} className="icon-inner" />
            </div>
          </div>
        </div>

        <div className="analyze">
          <span className="status">{renderStatus()}</span>
          {(status === INCORRECT || status == CORRECT) && <div className="scores">{feedback}</div>}
          {status === LISTENING && (
            <svg id="animatedWave" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7a91dd" />
                  <stop offset="100%" stopColor="#fba580" />
                </linearGradient>
                {/* Path for the slower, broader background wave */}
                <path id="wavePath2">
                  <animate
                    attributeName="d"
                    dur="4s"
                    repeatCount="indefinite"
                    keyTimes="0;0.33;0.66;1"
                    values="
                    M-30,50 C120,50 220,50 370,50 Z;      
                    M-30,50 C120,100 220,0 370,50 Z;      
                    M-30,50 C120,0 220,100 370,50 Z;      
                    M-30,50 C120,50 220,50 370,50 Z;
                  "
                  />
                </path>
                {/* Path for the faster, sharper foreground wave */}
                <path id="wavePath1">
                  <animate
                    attributeName="d"
                    dur="3s"
                    begin="-1s"
                    repeatCount="indefinite"
                    keyTimes="0;0.33;0.66;1"
                    values="
                        M50,50 C200,50 300,50 450,50 Z;  
                        M50,50 C150,90 350,10 450,50 Z;  
                        M50,50 C150,10 350,90 450,50 Z;
                        M50,50 C200,50 300,50 450,50 Z;
                    "
                  />
                </path>
              </defs>

              {/* Render the waves */}
              <g style={{ mixBlendMode: 'multiply' }}>
                {/* Background wave (top and bottom) */}
                <use href="#wavePath2" fill="url(#waveGradient)" opacity="0.2" />
                <use
                  href="#wavePath2"
                  transform="translate(0 100) scale(1 -1)"
                  fill="url(#waveGradient)"
                  opacity="0.2"
                />

                {/* Foreground wave (top and bottom) */}
                <use href="#wavePath1" fill="url(#waveGradient)" opacity="0.4" />
                <use
                  href="#wavePath1"
                  transform="translate(0 100) scale(1 -1)"
                  fill="url(#waveGradient)"
                  opacity="0.4"
                />
              </g>

              {/* Center line */}
              <path d="M0,50 L400,50" stroke="url(#waveGradient)" strokeWidth="1.5" />
            </svg>
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
        <div className="label">Phonaify</div>
      </div>
    </div>
  );
}
