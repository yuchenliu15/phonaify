import './Card.css';
import HeartSVG from '@/assets/heart.svg'
import CrossSVG from '@/assets/cross.svg'
import SpeakerSVG from '@/assets/speaker.svg'
import MicSVG from '@/assets/mic.svg'

interface CardProps {
  selected: string;
}

export default function Card({ selected }: CardProps) {
  return (
    <>
      <div className="card-root">
        {/* keep props.msg referenced so lint/TS doesn't mark it unused */}
        <div className="card-gradient" />
        <div className="card-panel" />
        <div className="card-header">
          <div className="card-header-inner">
            <span className="card-title">{selected}</span>
            <span className="card-subtle">noun</span>
            <span className="card-subtle"> 
      <img src={HeartSVG} />


            </span>
          </div>
        </div>
        <div className="icon-slot pos-1">
          <div className="icon-slot circle" />
          <img src={MicSVG} />
          
        </div>
        <div className="icon-slot pos-2">
          <div className="icon-slot circle" />

          <img src={SpeakerSVG} />

        </div>
        <div className="phonetic">
          <span className="phonetic-text">/dɪˈstrʌk.ʃən/</span>
          <span className="phonetic-spacer"> </span>
        </div>
        <div className="definition">
          The act or process of causing so much damage to something that it no longer exists or
          cannot be repaired.
        </div>
        <div className="label">Definition</div>
        <div className="example">Example Sentence</div>
        <div className="example-text">
          <span>“ The earthquake caused widespread </span>
          <span className="underline">destruction</span>
          <span> throughout the city.”</span>
        </div>
        <div className="synonyms">Synonyms</div>
        <div className="chip-text">Ruin</div>
        <div className="chip-border" />
        <div className="chip-2-text">Devastation</div>
        <div className="chip-2-border" />
        <div className="chip-3-text">Demolition</div>
        <div className="chip-3-border" />
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
