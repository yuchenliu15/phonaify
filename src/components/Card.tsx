export default function Card(props: { msg: string }) {
  return (
    <>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {/* keep props.msg referenced so lint/TS doesn't mark it unused */}
        <span style={{ display: 'none' }}>{props.msg}</span>
        <div
          style={{
            width: '181px',
            height: '39px',
            left: '0px',
            top: '183px',
            position: 'absolute',
            background: 'linear-gradient(115deg, #7A91DD 0%, #FBA580 100%)',
            boxShadow: '2px 4px 4px rgba(0, 0, 0, 0.40)',
            borderRadius: '10px',
          }}
        />
        <div
          style={{
            width: '181px',
            height: '200px',
            left: '0px',
            top: '0px',
            position: 'absolute',
            background: 'white',
            boxShadow: '2px 1px 4px rgba(0, 0, 0, 0.40)',
            border: '0.50px #E0E0E0 solid',
          }}
        />
        <div
          style={{
            width: '71px',
            height: '9px',
            left: '7px',
            top: '17px',
            position: 'absolute',
          }}
        >
          <div
            style={{
              width: '85px',
              height: '9px',
              left: '0px',
              top: '0px',
              position: 'absolute',
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                color: '#202124',
                fontSize: '9px',
                fontFamily: 'Noto Sans',
                fontWeight: 500,
                wordWrap: 'break-word',
              }}
            >
              Destruction{' '}
            </span>
            <span
              style={{
                color: '#202124',
                fontSize: '7px',
                fontFamily: 'Noto Sans',
                fontWeight: 100,
                wordWrap: 'break-word',
              }}
            >
              noun
            </span>
            <span
              style={{
                color: '#202124',
                fontSize: '8px',
                fontFamily: 'Noto Sans',
                fontWeight: 100,
                wordWrap: 'break-word',
              }}
            >
              {' '}
            </span>
          </div>
        </div>
        <div
          style={{
            width: '16px',
            height: '16px',
            left: '123px',
            top: '30px',
            position: 'absolute',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              left: '0px',
              top: '0px',
              position: 'absolute',
              borderRadius: '9999px',
              border: '0.50px #7A91DD solid',
            }}
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              left: '3px',
              top: '3px',
              position: 'absolute',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '6.67px',
                height: '8.33px',
                left: '1.67px',
                top: '0px',
                position: 'absolute',
                background: 'linear-gradient(180deg, #7A91DD 0%, #FBA580 100%)',
              }}
            />
            <div
              style={{
                width: '10px',
                height: '5px',
                left: '0px',
                top: '5px',
                position: 'absolute',
                background: 'linear-gradient(180deg, #7A91DD 0%, #FBA580 100%)',
              }}
            />
          </div>
        </div>
        <div
          style={{
            width: '16px',
            height: '16px',
            left: '102px',
            top: '30px',
            position: 'absolute',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              left: '0px',
              top: '0px',
              position: 'absolute',
              borderRadius: '9999px',
              border: '0.50px #7A91DD solid',
            }}
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              left: '3px',
              top: '3px',
              position: 'absolute',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '2.04px',
                height: '6.67px',
                left: '7.96px',
                top: '1.67px',
                position: 'absolute',
                background: 'linear-gradient(180deg, #7A91DD 0%, #FBA580 100%)',
              }}
            />
            <div
              style={{
                width: '1.53px',
                height: '4.17px',
                left: '6.83px',
                top: '2.91px',
                position: 'absolute',
                background: 'linear-gradient(180deg, #7A91DD 0%, #FBA580 100%)',
              }}
            />
            <div
              style={{
                width: '6.25px',
                height: '9.85px',
                left: '0px',
                top: '0.08px',
                position: 'absolute',
                background: 'linear-gradient(180deg, #7A91DD 0%, #FBA580 100%)',
              }}
            />
          </div>
        </div>
        <div
          style={{
            width: '89px',
            height: '16px',
            left: '8px',
            top: '30px',
            position: 'absolute',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              color: '#7A91DD',
              fontSize: '15px',
              fontFamily: 'Noto Sans',
              fontWeight: 400,
              wordWrap: 'break-word',
            }}
          >
            /dɪˈstrʌk.ʃən/
          </span>
          <span
            style={{
              color: '#202124',
              fontSize: '15px',
              fontFamily: 'Noto Sans',
              fontWeight: 400,
              wordWrap: 'break-word',
            }}
          >
            {' '}
          </span>
        </div>
        <div
          style={{
            width: '165px',
            height: '31px',
            left: '8px',
            top: '72px',
            position: 'absolute',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: '#202124',
            fontSize: '9px',
            fontFamily: 'Noto Sans',
            fontWeight: 400,
            wordWrap: 'break-word',
          }}
        >
          The act or process of causing so much damage to something that it no longer exists or
          cannot be repaired.
        </div>
        <div
          style={{
            width: '165px',
            height: '11px',
            left: '8px',
            top: '56px',
            position: 'absolute',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: '#5F6368',
            fontSize: '8px',
            fontFamily: 'Noto Sans',
            fontWeight: 400,
            wordWrap: 'break-word',
          }}
        >
          Definition
        </div>
        <div
          style={{
            width: '165px',
            height: '13px',
            left: '8px',
            top: '113px',
            position: 'absolute',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: '#5F6368',
            fontSize: '8px',
            fontFamily: 'Noto Sans',
            fontWeight: 400,
            wordWrap: 'break-word',
          }}
        >
          Example Sentence
        </div>
        <div
          style={{
            width: '165px',
            left: '8px',
            top: '131px',
            position: 'absolute',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              color: 'black',
              fontSize: '9px',
              fontFamily: 'Noto Sans',
              fontWeight: 400,
              wordWrap: 'break-word',
            }}
          >
            “ The earthquake caused widespread{' '}
          </span>
          <span
            style={{
              color: 'black',
              fontSize: '9px',
              fontFamily: 'Noto Sans',
              fontWeight: 400,
              textDecoration: 'underline',
              wordWrap: 'break-word',
            }}
          >
            destruction
          </span>
          <span
            style={{
              color: 'black',
              fontSize: '9px',
              fontFamily: 'Noto Sans',
              fontWeight: 400,
              wordWrap: 'break-word',
            }}
          >
            {' '}
            throughout the city.”
          </span>
        </div>
        <div
          style={{
            width: '165px',
            height: '10px',
            left: '8px',
            top: '165px',
            position: 'absolute',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: '#5F6368',
            fontSize: '8px',
            fontFamily: 'Noto Sans',
            fontWeight: 400,
            wordWrap: 'break-word',
          }}
        >
          Synonyms
        </div>
        <div
          style={{
            width: '26px',
            left: '8px',
            top: '180px',
            position: 'absolute',
            textAlign: 'center',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: '#202124',
            fontSize: '9px',
            fontFamily: 'Noto Sans',
            fontWeight: 400,
            wordWrap: 'break-word',
          }}
        >
          Ruin
        </div>
        <div
          style={{
            width: '26px',
            height: '12px',
            left: '8px',
            top: '180px',
            position: 'absolute',
            borderRadius: '5px',
            border: '0.50px #7A91DD solid',
          }}
        />
        <div
          style={{
            width: '59px',
            left: '39px',
            top: '180px',
            position: 'absolute',
            textAlign: 'center',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: '#202124',
            fontSize: '9px',
            fontFamily: 'Noto Sans',
            fontWeight: 400,
            wordWrap: 'break-word',
          }}
        >
          Devastation
        </div>
        <div
          style={{
            width: '59px',
            height: '12px',
            left: '39px',
            top: '180px',
            position: 'absolute',
            borderRadius: '5px',
            border: '0.50px #7A91DD solid',
          }}
        />
        <div
          style={{
            width: '53px',
            left: '103px',
            top: '180px',
            position: 'absolute',
            textAlign: 'center',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: '#202124',
            fontSize: '9px',
            fontFamily: 'Noto Sans',
            fontWeight: 400,
            wordWrap: 'break-word',
          }}
        >
          Demolition
        </div>
        <div
          style={{
            width: '53px',
            height: '12px',
            left: '103px',
            top: '180px',
            position: 'absolute',
            borderRadius: '5px',
            border: '0.50px #7A91DD solid',
          }}
        />
        <div
          style={{
            width: '9px',
            height: '9px',
            left: '83px',
            top: '17px',
            position: 'absolute',
          }}
        >
          <div
            style={{
              width: '9px',
              height: '9px',
              left: '0px',
              top: '0px',
              position: 'absolute',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '9px',
                height: '7.91px',
                left: '0px',
                top: '0.72px',
                position: 'absolute',
                background: '#B2C5FF',
              }}
            />
          </div>
        </div>
        <div
          style={{
            width: '9px',
            height: '9px',
            left: '167px',
            top: '17px',
            position: 'absolute',
            background: 'white',
          }}
        >
          <div
            style={{
              width: '9px',
              height: '9px',
              left: '0px',
              top: '0px',
              position: 'absolute',
              background: '#E0E0E0',
              borderRadius: '9999px',
              border: '0.50px #E0E0E0 solid',
            }}
          />
          <div
            style={{
              width: '3px',
              height: '2px',
              left: '2.77px',
              top: '4.85px',
              position: 'absolute',
              transform: 'rotate(-45deg)',
              transformOrigin: 'top left',
              outline: '0.80px white solid',
              outlineOffset: '-0.40px',
            }}
          />
        </div>
        <div
          style={{
            width: '71px',
            height: '22px',
            left: '55px',
            top: '202px',
            position: 'absolute',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '22px',
              left: '0px',
              top: '-2px',
              position: 'absolute',
              textAlign: 'center',
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: 'white',
              fontSize: '9px',
              fontFamily: 'Noto Sans',
              fontWeight: 400,
              wordWrap: 'break-word',
            }}
          >
            Word Library
          </div>
          <div
            style={{
              width: '10px',
              height: '9px',
              left: '61px',
              top: '5px',
              position: 'absolute',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '6px',
                left: '1.25px',
                top: '2px',
                position: 'absolute',
                background: 'white',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
