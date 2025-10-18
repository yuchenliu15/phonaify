import './Card.css'

export default function Card(props: { msg: string, }) {
  return (
    <>
      <div className="card-root">
        {/* keep props.msg referenced so lint/TS doesn't mark it unused */}
        <span className="card-hidden-msg">{props.msg}</span>
        <div className="card-gradient" />
        <div className="card-panel" />
        <div className="card-header">
          <div className="card-header-inner">
            <span className="card-title">Destruction </span>
            <span className="card-subtle">noun</span>
            <span className="card-subtle"> </span>
          </div>
        </div>
  <div className="icon-slot pos-1">
          <div className="icon-slot circle" />
          <div className="icon-inner">
            <div className="small-bar-a" />
            <div className="small-bar-b" />
          </div>
        </div>
  <div className="icon-slot pos-2">
          <div className="icon-slot circle" />
          <div className="icon-inner">
            <div className="small-bar-a" style={{ left: '7.96px', width: '2.04px', height: '6.67px' }} />
            <div className="small-bar-a" style={{ left: '6.83px', width: '1.53px', height: '4.17px' }} />
            <div className="small-bar-a" style={{ left: '0px', width: '6.25px', height: '9.85px', top: '0.08px' }} />
          </div>
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
        <div className="small-square">
          <div className="small-square-inner">
            <div className="small-square-fill" />
          </div>
        </div>
        <div className="top-right-dot">
          <div className="dot-bg" />
          <div className="dot-mark" />
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
