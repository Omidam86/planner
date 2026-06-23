import { useState, useEffect, useRef } from "react";

const HOUR_H  = 100;
const MIN_H   = HOUR_H / 60;
const LABEL_W = 60;
const TRACK_X = LABEL_W + 10;
const EV_LEFT = TRACK_X + 14;
const T_PAD   = 30;

const COLORS = ["#4ECDC4","#FFD166","#06D6A0","#7B2FBE","#EF476F","#F77F00","#118AB2"];

const DEFAULT_EVENTS = [
  { id:1, start:"06:00", end:"06:30", title:"بیدار شدن",    color:"#FFD166" },
  { id:2, start:"08:00", end:"08:30", title:"صبحانه",        color:"#06D6A0" },
  { id:3, start:"09:00", end:"11:00", title:"مطالعه شبکه",   color:"#4ECDC4" },
  { id:4, start:"13:00", end:"14:00", title:"ناهار",          color:"#FFD166" },
  { id:5, start:"15:00", end:"17:00", title:"پروژه BandW",   color:"#7B2FBE" },
  { id:6, start:"20:00", end:"21:00", title:"ورزش",           color:"#EF476F" },
  { id:7, start:"22:30", end:"23:00", title:"مطالعه آزاد",   color:"#4ECDC4" },
];

const toMins = t => { const [h,m] = t.split(":").map(Number); return h*60+m; };
const fmt    = (h,m=0) => `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;

export default function App() {
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [now,    setNow   ] = useState(new Date());
  const [modal,  setModal ] = useState(false);
  const [form,   setForm  ] = useState({ start:"09:00", end:"10:00", title:"", color:"#4ECDC4" });
  const [uid,    setUid   ] = useState(50);
  const scrollRef = useRef(null);

  /* tick every 60 s */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  /* auto-scroll to current time on mount */
  useEffect(() => {
    setTimeout(() => {
      if (!scrollRef.current) return;
      const nowM = new Date().getHours()*60 + new Date().getMinutes();
      scrollRef.current.scrollTop = nowM*MIN_H + T_PAD - scrollRef.current.clientHeight/2;
    }, 200);
  }, []);

  const nowM    = now.getHours()*60 + now.getMinutes();
  const nowY    = nowM*MIN_H + T_PAD;
  const activeEv = events.find(e => nowM >= toMins(e.start) && nowM < toMins(e.end));

  const addEvent = () => {
    if (!form.title.trim()) return;
    setEvents(p => [...p, { ...form, id: uid }]);
    setUid(n => n+1);
    setModal(false);
    setForm({ start:"09:00", end:"10:00", title:"", color:"#4ECDC4" });
  };

  const delEvent = id => setEvents(p => p.filter(e => e.id !== id));

  /* ─── render ─── */
  return (
    <div style={{
      fontFamily:"'Tahoma',sans-serif",
      background:"#090E1A",
      color:"#E8EDF4",
      height:"100vh",
      display:"flex",
      flexDirection:"column",
      direction:"rtl",
      overflow:"hidden",
    }}>

      {/* Global CSS */}
      <style>{`
        @keyframes nowPulse {
          0%,100% { box-shadow: 0 0 6px #FF4757, 0 0 18px rgba(255,71,87,.5); }
          50%      { box-shadow: 0 0 10px #FF4757, 0 0 32px rgba(255,71,87,.75); }
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.07); border-radius: 2px; }
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        padding:"16px 20px",
        background:"rgba(9,14,26,.97)",
        backdropFilter:"blur(12px)",
        borderBottom:"1px solid rgba(255,255,255,.07)",
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        flexShrink:0,
      }}>
        <div style={{ minWidth:0 }}>
          <div style={{
            fontSize:"34px",
            fontWeight:"700",
            letterSpacing:"4px",
            color:"#4ECDC4",
            fontFamily:"'Courier New',monospace",
            lineHeight:1,
          }}>
            {fmt(now.getHours(), now.getMinutes())}
          </div>
          <div style={{
            fontSize:"13px",
            color: activeEv ? activeEv.color : "#475569",
            marginTop:"5px",
            overflow:"hidden",
            textOverflow:"ellipsis",
            whiteSpace:"nowrap",
          }}>
            {activeEv
              ? `● ${activeEv.title}  •  ${activeEv.start} تا ${activeEv.end}`
              : "هیچ برنامه‌ای نیست"}
          </div>
        </div>

        <button
          onClick={() => setModal(true)}
          style={{
            background:"linear-gradient(135deg,#4ECDC4,#118AB2)",
            border:"none",
            borderRadius:"12px",
            padding:"11px 22px",
            color:"#fff",
            fontSize:"14px",
            fontFamily:"inherit",
            fontWeight:"600",
            cursor:"pointer",
            flexShrink:0,
            letterSpacing:".3px",
          }}
        >+ برنامه</button>
      </div>

      {/* ── Scrollable timeline ── */}
      <div ref={scrollRef} style={{
        flex:1,
        overflowY:"auto",
        position:"relative",
        direction:"ltr",   /* keeps scrollbar on right & LTR math */
      }}>
        <div style={{
          position:"relative",
          height:`${24*HOUR_H + T_PAD*2}px`,
        }}>

          {/* Vertical track */}
          <div style={{
            position:"absolute",
            top:`${T_PAD}px`,
            bottom:`${T_PAD}px`,
            left:`${TRACK_X}px`,
            width:"1px",
            background:"rgba(255,255,255,.07)",
          }}/>

          {/* Hour rows */}
          {Array.from({ length:25 }, (_,h) => {
            const y   = h*HOUR_H + T_PAD;
            const cur = h === now.getHours();
            return (
              <div key={h} style={{ position:"absolute", top:`${y}px`, left:0, right:0 }}>

                {/* label */}
                <div style={{
                  position:"absolute",
                  left:"6px",
                  width:`${LABEL_W}px`,
                  textAlign:"right",
                  paddingRight:"10px",
                  fontSize:"11px",
                  fontFamily:"'Courier New',monospace",
                  fontWeight: cur ? "700" : "400",
                  color: cur ? "#4ECDC4" : h%6===0 ? "#64748B" : "#1E293B",
                  transform:"translateY(-50%)",
                  userSelect:"none",
                  boxSizing:"border-box",
                }}>
                  {h < 24 ? `${String(h).padStart(2,"0")}:00` : ""}
                </div>

                {/* hour line */}
                {h < 24 && <div style={{
                  position:"absolute",
                  left:`${TRACK_X}px`,
                  right:"12px",
                  height:"1px",
                  background: h%6===0 ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.04)",
                }}/>}

                {/* 30-min sub-line */}
                {h < 24 && <div style={{
                  position:"absolute",
                  top:`${30*MIN_H}px`,
                  left:`${TRACK_X}px`,
                  right:"12px",
                  height:"1px",
                  background:"rgba(255,255,255,.025)",
                }}/>}

              </div>
            );
          })}

          {/* Event blocks */}
          {events.map(ev => {
            const sm  = toMins(ev.start);
            const em  = toMins(ev.end);
            const top = sm*MIN_H + T_PAD;
            const h   = (em-sm)*MIN_H;
            const act = activeEv?.id === ev.id;
            return (
              <div key={ev.id} style={{
                position:"absolute",
                top:`${top}px`,
                left:`${EV_LEFT}px`,
                right:"12px",
                height:`${Math.max(h,22)}px`,
                background:`${ev.color}12`,
                border:`1px solid ${ev.color}${act?"55":"1E"}`,
                borderLeft:`3px solid ${ev.color}`,
                borderRadius:"0 8px 8px 0",
                display:"flex",
                flexDirection:"column",
                justifyContent:"center",
                padding:"3px 8px 3px 10px",
                boxSizing:"border-box",
                overflow:"hidden",
                zIndex:5,
                boxShadow: act ? `0 0 28px ${ev.color}30` : "none",
                transition:"box-shadow .4s",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                  <span style={{
                    fontSize:"13px",
                    fontWeight:"600",
                    color:ev.color,
                    direction:"rtl",
                    fontFamily:"'Tahoma',sans-serif",
                    overflow:"hidden",
                    textOverflow:"ellipsis",
                    whiteSpace:"nowrap",
                    flex:1,
                    minWidth:0,
                  }}>{ev.title}</span>
                  <span
                    onClick={() => delEvent(ev.id)}
                    style={{
                      fontSize:"10px",
                      color:"rgba(255,255,255,.2)",
                      cursor:"pointer",
                      padding:"2px 4px",
                      flexShrink:0,
                      lineHeight:1,
                    }}
                  >✕</span>
                </div>
                {h >= 30 && (
                  <div style={{
                    fontSize:"10px",
                    color:"rgba(255,255,255,.22)",
                    marginTop:"2px",
                    fontFamily:"'Courier New',monospace",
                    direction:"ltr",
                  }}>{ev.start} – {ev.end}</div>
                )}
              </div>
            );
          })}

          {/* ── Current-time indicator ── */}
          <div style={{
            position:"absolute",
            top:`${nowY}px`,
            left:0,
            right:0,
            zIndex:20,
            pointerEvents:"none",
          }}>
            {/* time label */}
            <div style={{
              position:"absolute",
              left:"6px",
              width:`${LABEL_W}px`,
              textAlign:"right",
              paddingRight:"10px",
              fontSize:"10px",
              fontFamily:"'Courier New',monospace",
              fontWeight:"700",
              color:"#FF4757",
              transform:"translateY(-50%)",
              boxSizing:"border-box",
            }}>
              {fmt(now.getHours(), now.getMinutes())}
            </div>

            {/* pulsing dot */}
            <div style={{
              position:"absolute",
              left:`${TRACK_X-4}px`,
              top:"-4px",
              width:"9px",
              height:"9px",
              borderRadius:"50%",
              background:"#FF4757",
              animation:"nowPulse 2s ease-in-out infinite",
            }}/>

            {/* red line */}
            <div style={{
              position:"absolute",
              left:`${TRACK_X}px`,
              right:"12px",
              top:0,
              height:"1px",
              background:"linear-gradient(90deg,#FF4757 0%,rgba(255,71,87,.35) 55%,transparent 100%)",
            }}/>
          </div>

        </div>
      </div>

      {/* ── Add-event bottom sheet ── */}
      {modal && (
        <div
          onClick={() => setModal(false)}
          style={{
            position:"fixed",
            inset:0,
            background:"rgba(0,0,0,.82)",
            zIndex:200,
            display:"flex",
            alignItems:"flex-end",
            direction:"rtl",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:"#0F1628",
              borderTop:"1px solid rgba(255,255,255,.09)",
              borderRadius:"20px 20px 0 0",
              padding:"20px 20px 44px",
              width:"100%",
              boxSizing:"border-box",
            }}
          >
            {/* drag handle */}
            <div style={{
              width:"36px", height:"3px",
              background:"rgba(255,255,255,.12)",
              borderRadius:"2px",
              margin:"0 auto 20px",
            }}/>

            <h3 style={{ margin:"0 0 18px", fontSize:"17px", color:"#E8EDF4" }}>برنامه جدید</h3>

            <input
              value={form.title}
              onChange={e => setForm(f => ({...f, title:e.target.value}))}
              placeholder="مثلاً: ورزش"
              autoFocus
              style={{
                display:"block", width:"100%",
                padding:"12px 14px",
                background:"rgba(255,255,255,.05)",
                border:"1px solid rgba(255,255,255,.1)",
                borderRadius:"10px",
                color:"#E8EDF4",
                fontSize:"15px",
                fontFamily:"inherit",
                direction:"rtl",
                boxSizing:"border-box",
                marginBottom:"12px",
                outline:"none",
              }}
            />

            <div style={{ display:"flex", gap:"10px", marginBottom:"14px" }}>
              {[["شروع","start"],["پایان","end"]].map(([lbl,key]) => (
                <div key={key} style={{ flex:1 }}>
                  <div style={{ fontSize:"11px", color:"#64748B", marginBottom:"5px" }}>{lbl}</div>
                  <input
                    type="time"
                    value={form[key]}
                    onChange={e => setForm(f => ({...f, [key]:e.target.value}))}
                    style={{
                      width:"100%", padding:"10px",
                      background:"rgba(255,255,255,.05)",
                      border:"1px solid rgba(255,255,255,.1)",
                      borderRadius:"10px",
                      color:"#E8EDF4", fontSize:"14px",
                      fontFamily:"'Courier New',monospace",
                      direction:"ltr",
                      boxSizing:"border-box",
                      outline:"none",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* color picker */}
            <div style={{ display:"flex", gap:"8px", marginBottom:"22px", flexWrap:"wrap" }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setForm(f => ({...f,color:c}))} style={{
                  width:"28px", height:"28px",
                  borderRadius:"50%",
                  background:c,
                  cursor:"pointer",
                  border: form.color===c ? "3px solid #fff" : "3px solid transparent",
                  flexShrink:0,
                  boxSizing:"border-box",
                  transition:"transform .15s",
                  transform: form.color===c ? "scale(1.15)" : "scale(1)",
                }}/>
              ))}
            </div>

            <button
              onClick={addEvent}
              style={{
                display:"block", width:"100%",
                padding:"14px",
                background: form.title.trim()
                  ? "linear-gradient(135deg,#4ECDC4,#118AB2)"
                  : "rgba(255,255,255,.07)",
                border:"none", borderRadius:"12px",
                color: form.title.trim() ? "#fff" : "#475569",
                fontSize:"15px",
                fontFamily:"inherit",
                fontWeight:"600",
                cursor: form.title.trim() ? "pointer" : "default",
                transition:"all .2s",
              }}
            >اضافه کن</button>
          </div>
        </div>
      )}
    </div>
  );
}
